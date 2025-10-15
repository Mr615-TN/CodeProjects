mod checker;
mod utils;

use checker::*;
use rayon::prelude::*;
use std::env;
use std::path::Path;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: {} <file_or_directory>", args[0]);
        std::process::exit(1);
    }

    let path = Path::new(&args[1]);

    if path.is_file() {
        run_checker(path);
    } else if path.is_dir() {
        let files = utils::list_files_recursively(path);

        println!("🔍 Found {} files. Checking in parallel...\n", files.len());

        files.par_iter().for_each(|entry| {
            run_checker(entry);
        });
    } else {
        eprintln!("Invalid path: {}", path.display());
    }
}

fn run_checker(path: &Path) {
    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
    match ext {
        "rs" => rust_checker::check_rust_file(path),
        "py" => python_checker::check_python_file(path),
        "c" | "h" => c_checker::check_c_file(path),
        "cpp" | "cc" | "cxx" | "hpp" => cpp_checker::check_cpp_file(path),
        "java" => java_checker::check_java_file(path),
        "js" => js_checker::check_js_file(path),
        "ts" => ts_checker::check_ts_file(path),
        "go" => go_checker::check_go_file(path),
        _ => (), // silently skip unsupported files
    }
}

