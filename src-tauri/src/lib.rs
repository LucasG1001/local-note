use std::sync::Arc;

use bincode;
use fastembed::{EmbeddingModel, InitOptions, TextEmbedding};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use tauri::Manager;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------------

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone, Debug)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub ai_description: Option<String>,
    #[serde(skip_serializing)]
    pub embedding: Option<Vec<u8>>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

// Wrapper kept in Tauri state so fastembed is initialised only once
struct EmbeddingState(Arc<TextEmbedding>);

// ---------------------------------------------------------------------------
// AI helpers
// ---------------------------------------------------------------------------

/// Call Gemini 1.5 Flash to generate a rich semantic description of the note.
/// The key is read from the GEMINI_API_KEY environment variable at runtime.
async fn call_gemini(content: &str) -> Result<String, String> {
    let api_key = std::env::var("GEMINI_API_KEY")
        .map_err(|_| "GEMINI_API_KEY environment variable not set".to_string())?;

let url = format!(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
    api_key
);

let prompt = format!(
    "Você é um assistente de indexação semântica. \
    Com base na nota abaixo, escreva um único parágrafo detalhado (3 a 5 frases) que explique \
    o tema, os conceitos-chave, o propósito e quaisquer detalhes relevantes. \
    Esta descrição será usada para busca vetorial semântica, portanto, seja preciso e utilize um vocabulário rico. \
    Responda APENAS com a descrição, sem títulos ou texto adicional.\n\nNota:\n{}",
    content
);

    let body = json!({
        "contents": [
            {
                "parts": [{ "text": prompt }]
            }
        ]
    });

    let client = Client::new();
    let resp: serde_json::Value = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("HTTP error calling Gemini: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Failed to parse Gemini response: {}", e))?;

    let description = resp["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .ok_or_else(|| format!("Unexpected Gemini response shape: {}", resp))?
        .trim()
        .to_string();

    Ok(description)
}

/// Generate a normalised embedding vector via fastembed (all-MiniLM-L6-v2, runs locally).
fn get_embedding(model: &TextEmbedding, text: &str) -> Result<Vec<f32>, String> {
    let mut embeddings = model
        .embed(vec![text.to_string()], None)
        .map_err(|e| format!("fastembed error: {}", e))?;
    Ok(embeddings.remove(0))
}

fn cosine_similarity(v1: &[f32], v2: &[f32]) -> f32 {
    let dot: f32 = v1.iter().zip(v2).map(|(a, b)| a * b).sum();
    let mag1: f32 = v1.iter().map(|x| x * x).sum::<f32>().sqrt();
    let mag2: f32 = v2.iter().map(|x| x * x).sum::<f32>().sqrt();
    if mag1 == 0.0 || mag2 == 0.0 {
        return 0.0;
    }
    dot / (mag1 * mag2)
}

// ---------------------------------------------------------------------------
// Tauri commands
// ---------------------------------------------------------------------------

#[tauri::command]
async fn create_note(
    pool: tauri::State<'_, SqlitePool>,
    embedding_state: tauri::State<'_, EmbeddingState>,
    title: String,
    content: String,
) -> Result<String, String> {
    let id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO notes (id, title, content, created_at, updated_at)
         VALUES (?, ?, ?, datetime('now'), datetime('now'))",
    )
    .bind(&id)
    .bind(&title)
    .bind(&content)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
async fn update_note(
    pool: tauri::State<'_, SqlitePool>,
    embedding_state: tauri::State<'_, EmbeddingState>,
    id: String,
    title: String,
    content: String,
) -> Result<(), String> {
    // Regenerate description + embedding on every save so search stays fresh
    let ai_description = match call_gemini(&content).await {
        Ok(desc) => Some(desc),
        Err(e) => {
            eprintln!("❌ ERRO DETALHADO DO GEMINI: {}", e);
            None
        }
    };
    eprintln!("Descrição AI: {:?}", ai_description);
    let text_to_embed = ai_description.as_deref().unwrap_or(&content);
    let vector = get_embedding(&embedding_state.0, text_to_embed)?;
    let vector_blob = bincode::serialize(&vector).map_err(|e| e.to_string())?;

    sqlx::query(
        "UPDATE notes
         SET title = ?, content = ?, ai_description = ?, embedding = ?, updated_at = datetime('now')
         WHERE id = ?",
    )
    .bind(&title)
    .bind(&content)
    .bind(&ai_description)
    .bind(&vector_blob)
    .bind(&id)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn get_notes(
    pool: tauri::State<'_, SqlitePool>,
    limit: i64,
) -> Result<Vec<Note>, String> {
    sqlx::query_as::<_, Note>(
        "SELECT id, title, content, ai_description, embedding, created_at, updated_at
         FROM notes ORDER BY updated_at DESC LIMIT ?",
    )
    .bind(limit)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn search_notes(
    pool: tauri::State<'_, SqlitePool>,
    embedding_state: tauri::State<'_, EmbeddingState>,
    query: String,
) -> Result<Vec<Note>, String> {
    if query.trim().is_empty() {
        return get_notes(pool, 50).await;
    }

    // Embed the user's query using the same model
    let query_vec = get_embedding(&embedding_state.0, &query)?;

    // Fetch all notes that have an embedding stored
    let notes = sqlx::query_as::<_, Note>(
        "SELECT id, title, content, ai_description, embedding, created_at, updated_at
         FROM notes WHERE embedding IS NOT NULL",
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    // Score and filter
    let mut ranked: Vec<(f32, Note)> = notes
        .into_iter()
        .filter_map(|note| {
            let blob = note.embedding.as_ref()?;
            let note_vec: Vec<f32> = bincode::deserialize(blob).ok()?;
            let score = cosine_similarity(&query_vec, &note_vec);
            Some((score, note))
        })
        .filter(|(score, _)| *score > 0.35)
        .collect();

    ranked.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

    Ok(ranked.into_iter().map(|(_, n)| n).collect())
}

#[tauri::command]
async fn delete_note(
    pool: tauri::State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM notes WHERE id = ?")
        .bind(&id)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ---------------------------------------------------------------------------
// App bootstrap
// ---------------------------------------------------------------------------

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::block_on(async move {
                // --- Database ---
                let app_dir = app_handle.path().app_data_dir().unwrap();
                std::fs::create_dir_all(&app_dir).unwrap();
                let db_path = app_dir.join("local_note.db");

                let pool = SqlitePool::connect_with(
                    SqliteConnectOptions::new()
                        .filename(&db_path)
                        .create_if_missing(true),
                )
                .await
                .expect("Failed to open SQLite pool");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS notes (
                        id           TEXT PRIMARY KEY,
                        title        TEXT NOT NULL DEFAULT '',
                        content      TEXT NOT NULL DEFAULT '',
                        ai_description TEXT,
                        embedding    BLOB,
                        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
                    )",
                )
                .execute(&pool)
                .await
                .expect("Failed to create notes table");

                app_handle.manage(pool);

                // --- Embedding model (downloaded once, cached locally) ---
                let model = TextEmbedding::try_new(
                    InitOptions::new(EmbeddingModel::AllMiniLML6V2).with_show_download_progress(true),
                )
                .expect("Failed to initialise fastembed model");

                app_handle.manage(EmbeddingState(Arc::new(model)));
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_note,
            update_note,
            search_notes,
            get_notes,
            delete_note,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}