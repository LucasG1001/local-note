use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use tauri::Manager;

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub ai_description: Option<String>, // Descrição simplificada pela IA
    pub embedding: Option<Vec<u8>>,    // Vetor (Blob) para busca matemática
    pub rank: i32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[tauri::command]
async fn create_note(
    pool: tauri::State<'_, SqlitePool>,
    title: String,
    content: String,
) -> Result<String, String> {
    let new_id = Uuid::new_v4().to_string();

    // 1. A mágica acontece aqui: A IA gera uma descrição do comando/texto
    let description = call_ai_to_describe(&content).await?; 
    
    // 2. Transformamos a descrição em um vetor numérico
    let vector = generate_embedding(&description).await?;
    let vector_blob = bincode::serialize(&vector).map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO Note (id, title, content, ai_description, embedding, rank, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))"
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
    // Se a query for vazia, retorna as últimas notas
    if query.is_empty() {
        return get_all_notes(pool).await;
    }

    // 1. Transforma o que o usuário digitou em vetor
    let query_vector = generate_embedding(&query).await?;

    // 2. Busca notas no banco
    let notes = sqlx::query_as::<_, Note>("SELECT * FROM Note")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    let mut ranked_notes: Vec<(f32, Note)> = notes
        .into_iter()
        .filter_map(|note| {
            note.embedding.as_ref().map(|blob| {
                let note_vec: Vec<f32> = bincode::deserialize(blob).unwrap();
                let score = calculate_similarity(&query_vector, &note_vec);
                (score, note)
            })
        })
        .filter(|(score, _)| *score > 0.40) // Filtro de relevância
        .collect();

    // 3. Ordena pela maior similaridade
    ranked_notes.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());

    Ok(ranked_notes.into_iter().map(|(_, n)| n).collect())
}

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