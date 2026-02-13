use serde::{Serialize, Deserialize};
use uuid::Uuid;
use tauri::Manager;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Note {
    pub id: String,
    pub titulo: String,
    pub content: String,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    #[sqlx(rename = "updatedAt")]
    pub updated_at: String,
}

#[tauri::command]
async fn get_notes(
    pool: tauri::State<'_, SqlitePool> 
) -> Result<Vec<Note>, String> {
    let notes = sqlx::query_as::<_, Note>("SELECT * FROM Note ORDER BY createdAt DESC")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(notes)
}

#[tauri::command]
async fn create_note(
    pool: tauri::State<'_, SqlitePool>, 
    titulo: String, 
    content: String
) -> Result<String, String> {
    let new_id = Uuid::new_v4().to_string();

    sqlx::query("INSERT INTO Note (id, titulo, content, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))")
        .bind(&new_id)
        .bind(titulo)
        .bind(content)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(new_id)
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
                    titulo TEXT, 
                    content TEXT, 
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
        .invoke_handler(tauri::generate_handler![get_notes, create_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}