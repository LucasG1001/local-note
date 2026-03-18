#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use dotenvy::dotenv;
use std::env;

fn main() {
    // Carrega o arquivo .env
    dotenv().ok();

    // DEBUG: Verifique se a chave foi carregada no terminal antes de iniciar o app
    match env::var("GEMINI_API_KEY") {
        Ok(_) => println!("✅ Variável GEMINI_API_KEY carregada!"),
        Err(_) => println!("❌ Erro: GEMINI_API_KEY não encontrada no .env ou ambiente"),
    }

    local_note_lib::run()
}
