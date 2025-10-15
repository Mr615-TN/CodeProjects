use std::path::Path;
use std::process::Command;

pub fn check_python_file(path: &Path) {
    println!("🐍 Checking Python syntax: {}", path.display());
    let output = Command::new("python3")
        .arg("-m")
        .arg("py_compile")
        .arg(path)
        .output();

    match output {
        Ok(o) if o.status.success() => println!("✅ {} — Syntax OK", path.display()),
        Ok(o) => {
            println!("❌ {} — Syntax Error", path.display());
            eprintln!("{}", String::from_utf8_lossy(&o.stderr));
        }
        Err(e) => eprintln!("⚠️ Failed to check {}: {}", path.display(), e),
    }
}

