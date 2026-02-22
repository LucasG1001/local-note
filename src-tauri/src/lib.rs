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
    pub rank: i32,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdAt")] // <--- CRUCIAL: Mapeia o nome do banco para o Rust
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    #[sqlx(rename = "updatedAt")] // <--- CRUCIAL
    pub updated_at: String,
    pub tags: Option<String>,
}

// Struct auxiliar para o frontend receber os dados limpos
#[derive(Serialize, Deserialize, Clone)]
pub struct NoteWithTags {
    pub id: String,
    pub title: String,
    pub content: String,
    pub rank: i32,
    pub created_at: String,
    pub updated_at: String,
    pub tags: Vec<String>,
}

fn map_note(note: Note) -> NoteWithTags {
    NoteWithTags {
        id: note.id,
        title: note.title,
        content: note.content,
        rank: note.rank,
        created_at: note.created_at,
        updated_at: note.updated_at,
        tags: if note.tags.is_empty() { vec![] } else { note.tags.split(',').map(|s| s.to_string()).collect() },
    }
}

#[tauri::command]
async fn create_note(
    pool: tauri::State<'_, SqlitePool>, 
    title: String, 
    content: String
) -> Result<String, String> {
    let new_id = Uuid::new_v4().to_string();
    
    sqlx::query(
        "INSERT INTO Note (id, title, content, rank, createdAt, updatedAt) 
         VALUES (?, ?, ?, 0, datetime('now'), datetime('now'))"
    )
    .bind(&new_id)
    .bind(title)
    .bind(content)
    .execute(pool.inner())
    .await
    .map_err(|e| {
        eprintln!("Erro ao criar nota: {}", e);
        e.to_string()
    })?;

    Ok(new_id)
}

#[tauri::command]
async fn get_notes(pool: tauri::State<'_, SqlitePool>, limit: i32) -> Result<Vec<NoteWithTags>, String> {
    let notes = sqlx::query_as::<_, Note>(
        "SELECT n.*, GROUP_CONCAT(t.name) as tags 
         FROM Note n 
         LEFT JOIN NoteTag nt ON n.id = nt.noteId 
         LEFT JOIN Tag t ON nt.tagId = t.id 
         GROUP BY n.id 
         ORDER BY n.rank DESC 
         LIMIT ?"
    )
    .bind(limit)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(notes.into_iter().map(map_note).collect())
}

#[tauri::command]
async fn get_notes_by_tags(pool: tauri::State<'_, SqlitePool>, search_tags: Vec<String>) -> Result<Vec<NoteWithTags>, String> {
    // Busca notas que contenham PELO MENOS uma das tags enviadas
    let query = format!(
        "SELECT n.*, GROUP_CONCAT(t.name) as tags 
         FROM Note n 
         JOIN NoteTag nt ON n.id = nt.noteId 
         JOIN Tag t ON nt.tagId = t.id 
         WHERE t.name IN ({}) 
         GROUP BY n.id",
        search_tags.iter().map(|_| "?").collect::<Vec<_>>().join(",")
    );

    let mut sql = sqlx::query_as::<_, Note>(&query);
    for tag in search_tags {
        sql = sql.bind(tag);
    }

    let notes = sql.fetch_all(pool.inner()).await.map_err(|e| e.to_string())?;
    Ok(notes.into_iter().map(map_note).collect())
}

#[tauri::command]
async fn get_all_tags(pool: tauri::State<'_, SqlitePool>) -> Result<Vec<String>, String> {
    let tags = sqlx::query_scalar::<_, String>("SELECT name FROM Tag ORDER BY name ASC")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(tags)
}

#[tauri::command]
async fn update_note(
    pool: tauri::State<'_, SqlitePool>,
    id: String,
    title: String,
    content: String,
    tags: Vec<String>,
    rank: i32,
) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // 1. Update da nota (incluindo o rank passado pelo front)
    sqlx::query("UPDATE Note SET title = ?, content = ?, rank = ?, updatedAt = datetime('now') WHERE id = ?")
        .bind(title)
        .bind(content)
        .bind(rank)
        .bind(&id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // 2. Gerenciar Tags (Remover relações antigas)
    sqlx::query("DELETE FROM NoteTag WHERE noteId = ?").bind(&id).execute(&mut *tx).await.map_err(|e| e.to_string())?;

for tag_name in tags {
    let normalized_tag = tag_name.to_lowercase().trim().to_string();
    
    sqlx::query("INSERT OR IGNORE INTO Tag (name) VALUES (?)")
        .bind(&normalized_tag)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    
    sqlx::query("INSERT INTO NoteTag (noteId, tagId) SELECT ?, id FROM Tag WHERE name = ?")
        .bind(&id)
        .bind(&normalized_tag)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
}

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                let app_dir = app_handle.path().app_data_dir().unwrap();
                std::fs::create_dir_all(&app_dir).unwrap();
                let db_path = app_dir.join("notes_v2.db");

                let pool = SqlitePool::connect_with(SqliteConnectOptions::new().filename(&db_path).create_if_missing(true)).await.unwrap();

                // MIGRATIONS - Estrutura Relacional
                sqlx::query("
                    CREATE TABLE IF NOT EXISTS Note (
                        id TEXT PRIMARY KEY, 
                        title TEXT, 
                        content TEXT, 
                        rank INTEGER DEFAULT 0,
                        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
                        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                    CREATE TABLE IF NOT EXISTS Tag (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT UNIQUE
                    );
                    CREATE TABLE IF NOT EXISTS NoteTag (
                        noteId TEXT,
                        tagId INTEGER,
                        FOREIGN KEY(noteId) REFERENCES Note(id) ON DELETE CASCADE,
                        FOREIGN KEY(tagId) REFERENCES Tag(id) ON DELETE CASCADE,
                        PRIMARY KEY (noteId, tagId)
                    );
                ").execute(&pool).await.unwrap();

                app_handle.manage(pool);
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![ get_notes, get_notes_by_tags, get_all_tags, update_note, create_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}