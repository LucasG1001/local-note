use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use tauri::Manager;

// --- ESTRUTURAS DE DADOS ---

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub ai_description: Option<String>, // Resumo técnico gerado pela IA
    pub embedding: Option<Vec<u8>>,    // Vetor serializado (Blob)
    pub rank: i32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

// --- LÓGICA DE IA (MOCK/API) ---

// --- 1. FUNÇÃO LENTA (Só para o Create/Update) ---
// Usa um LLM para entender o que o usuário colou
async fn generate_ai_description(content: &str) -> Result<String, String> {
    // Aqui você chamaria uma API (Groq/OpenAI) ou um modelo local.
    // Ex: "O que este código faz?" 
    // Retorno: "Comando Git para ver logs em uma linha"
    let description = call_llm_api(content).await?; 
    Ok(description)
}

// --- 2. FUNÇÃO RÁPIDA (Para o Create E para a Busca) ---
// Transforma qualquer texto em vetor (all-MiniLM-L6-v2)
async fn get_embedding(text: &str) -> Result<Vec<f32>, String> {
    let vector = call_embedding_model(text).await?;
    Ok(vector)
}

fn calculate_cosine_similarity(v1: &[f32], v2: &[f32]) -> f32 {
    let dot_product: f32 = v1.iter().zip(v2).map(|(a, b)| a * b).sum();
    let mag_v1: f32 = v1.iter().map(|x| x * x).sum::<f32>().sqrt();
    let mag_v2: f32 = v2.iter().map(|x| x * x).sum::<f32>().sqrt();
    if mag_v1 == 0.0 || mag_v2 == 0.0 { return 0.0; }
    dot_product / (mag_v1 * mag_v2)
}

// --- COMANDOS TAURI ---

#[tauri::command]
async fn create_note(
    pool: tauri::State<'_, SqlitePool>,
    title: String,
    content: String,
) -> Result<String, String> {
    let new_id = Uuid::new_v4().to_string();

    let ai_desc = generate_ai_description(&content).await?;
    let vector = get_embedding(&ai_desc).await?;
    let vector_blob = bincode::serialize(&vector).unwrap(); 

    sqlx::query(
        "INSERT INTO Note (id, title, content, ai_description, embedding, rank, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))",
    )
    .bind(&new_id)
    .bind(title)
    .bind(content)
    .bind(description)
    .bind(vector_blob)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(new_id)
}

#[tauri::command]
async fn search_notes(
    pool: tauri::State<'_, SqlitePool>,
    query: String,
) -> Result<Vec<Note>, String> {
    if query.is_empty() {
        return get_notes(pool, 50).await;
    }

    // 1. Transforma a pesquisa do usuário em vetor (usando o mesmo modelo all-MiniLM)
    let query_vector = get_embedding(&query).await?;

    // 2. Busca notas que têm inteligência configurada
    let notes = sqlx::query_as::<_, Note>("SELECT * FROM Note WHERE embedding IS NOT NULL")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    // 3. Compara a dúvida do usuário com a descrição de cada nota
    let mut ranked_notes: Vec<(f32, Note)> = notes
        .into_iter()
        .filter_map(|note| {
            let note_vec: Vec<f32> = bincode::deserialize(note.embedding.as_ref()?).ok()?;
            let score = calculate_cosine_similarity(&query_vector, &note_vec);
            Some((score, note))
        })
        .filter(|(score, _)| *score > 0.45) // Limiar de precisão
        .collect();

    ranked_notes.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());

    Ok(ranked_notes.into_iter().map(|(_, n)| n).collect())
}

#[tauri::command]
async fn get_notes(pool: tauri::State<'_, SqlitePool>, limit: i32) -> Result<Vec<Note>, String> {
    sqlx::query_as::<_, Note>("SELECT * FROM Note ORDER BY createdAt DESC LIMIT ?")
        .bind(limit)
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_note(pool: tauri::State<'_, SqlitePool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM Note WHERE id = ?")
        .bind(id)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// --- RUNNER ---

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                let app_dir = app_handle.path().app_data_dir().unwrap();
                std::fs::create_dir_all(&app_dir).unwrap();
                let db_path = app_dir.join("notes_semantic.db");

                let pool = SqlitePool::connect_with(
                    SqliteConnectOptions::new()
                        .filename(&db_path)
                        .create_if_missing(true),
                )
                .await.unwrap();

                // Tabela única e inteligente
                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS Note (
                        id TEXT PRIMARY KEY, 
                        title TEXT, 
                        content TEXT, 
                        ai_description TEXT, 
                        embedding BLOB,
                        rank INTEGER DEFAULT 0,
                        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
                        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                    );"
                ).execute(&pool).await.unwrap();

                app_handle.manage(pool);
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_note,
            search_notes,
            get_notes,
            delete_note
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}