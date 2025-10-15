mod checker;
mod utils;

use checker::(c_checker, python_checker, rust_checker);
use std::env;
use std::path::Path;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: {} <path>", args[0]);
        std::process::exit(1);
    }

    let path = Path::new(&args[1]);

    if path.is_file() {
        run_checker(path);
    } else if path.is_dir() {
        for entry in utils::list_files_recursively(path) {
            run_checker(&entry);
        }
    } else {
        eprintln!("Invalid path: {}", path.display());
    }
}

fn run_checker(path: &Path) {
    let ext = path.extension().unwrap().to_str().unwrap();
    match ext {
        "c" | "h" => c_checker::check(path),
        "py" => python_checker::check(path),
        "rs" => rust_checker::check(path),
        _ => println!("Skipping {} (unsupported extension)", path.display()),
    };
}
