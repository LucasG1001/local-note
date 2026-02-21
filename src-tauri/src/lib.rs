use serde::{Serialize, Deserialize};
use uuid::Uuid;
use tauri::Manager;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")]
    pub created_at: DateTime<Utc>, 
    #[serde(rename = "updatedAt")]
    #[sqlx(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
    #[sqlx(json)]
    pub tags: Vec<String>,
}
#[tauri::command]
async fn get_notes(
    pool: tauri::State<'_, SqlitePool> 
) -> Result<Vec<Note>, String> {
    let notes = sqlx::query_as::<sqlx::Sqlite, Note>("SELECT * FROM Note ORDER BY createdAt DESC")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| {
            println!("Erro no banco: {}", e); // Log para te ajudar
            e.to_string()
        })?;
    
    Ok(notes)
}

#[tauri::command]
async fn create_note(
    pool: tauri::State<'_, SqlitePool>, 
    title: String, 
    content: String,
    tags: Vec<String>,
) -> Result<String, String> {
    let new_id = Uuid::new_v4().to_string();
    let now = Utc::now();

    sqlx::query("INSERT INTO Note (id, title, content, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(&new_id)
        .bind(title)
        .bind(content)
        .bind(sqlx::types::Json(tags))
        .bind(now)
        .bind(now)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(new_id)
}

#[tauri::command]
async fn update_note(
    pool: tauri::State<'_, SqlitePool>,
    id: String,
    title: String,
    content: String,
    tags: Vec<String>,
) -> Result<(), String> {
    sqlx::query("UPDATE Note SET title = ?, content = ?, tags = ?, updatedAt = datetime('now') WHERE id = ?")
        .bind(title)
        .bind(content)
        .bind(sqlx::types::Json(tags))
        .bind(id)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn delete_note(
    pool: tauri::State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM Note WHERE id = ?")
        .bind(id)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            tauri::async_runtime::block_on(async move {
                let app_dir = app_handle.path().app_data_dir()
                    .expect("Falha ao obter diretório de dados");
                
                std::fs::create_dir_all(&app_dir).expect("Falha ao criar pastas");

                let db_path = app_dir.join("notes.db");

                let options = SqliteConnectOptions::new()
                    .filename(&db_path)
                    .create_if_missing(true);

                let pool = SqlitePool::connect_with(options)
                    .await
                    .expect("Falha ao conectar ao banco");

                sqlx::query("CREATE TABLE IF NOT EXISTS Note (
                    id TEXT PRIMARY KEY, 
                    title TEXT, 
                    content TEXT, 
                    tags TEXT,
                    createdAt TEXT, 
                    updatedAt TEXT
                );")
                .execute(&pool)
                .await
                .expect("Falha na migração");

                app_handle.manage(pool);
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_notes, create_note, update_note, delete_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}