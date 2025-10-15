use walkdir::WalkDir;
use std::path::PathBuf;

pub fn list_files_recursively(dir: &std::path::Path) -> Vec<PathBuf> {
    WalkDir::new(dir)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|e| e.file_type().is_file())
        .map(|e| e.path().to_path_buf())
        .collect()
}

