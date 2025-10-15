use std::path::Path;
use std::process::Command;

pub fn check_go_file(path: &Path) {
    println!("🐹 Checking Go syntax: {}", path.display());
    let output = Command::new("go")
        .arg("build")
        .arg("-o")
        .arg("/tmp/dummy.out")
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

