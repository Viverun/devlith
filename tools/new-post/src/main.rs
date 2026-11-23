// Usage: npm run new -- "My post title"
use std::{fs, path::Path, process::exit};

fn main() {
    let title = std::env::args().skip(1).collect::<Vec<_>>().join(" ").trim().to_string();
    if title.is_empty() {
        eprintln!("Usage: npm run new -- \"My post title\"");
        exit(1);
    }
    let mut slug = String::new();
    for c in title.to_lowercase().chars() {
        if c.is_ascii_lowercase() || c.is_ascii_digit() {
            slug.push(c);
        } else if !slug.ends_with('-') {
            slug.push('-');
        }
    }
    let slug = slug.trim_matches('-');
    let file = format!("src/content/writing/{slug}.md");
    if Path::new(&file).exists() {
        eprintln!("Already exists: {file}");
        exit(1);
    }
    let date = chrono::Utc::now().format("%Y-%m-%d");
    let body = format!(
        "---\ntitle: {}\ndescription: \"\"\ndate: {date}\ntopic: Thoughts\ndraft: true\n---\n\nStart writing here.\n",
        serde_json::to_string(&title).unwrap()
    );
    if let Err(e) = fs::write(&file, body) {
        eprintln!("Failed to write {file}: {e}");
        exit(1);
    }
    println!("Created {file} (draft: true — flip to false to publish)");
}
