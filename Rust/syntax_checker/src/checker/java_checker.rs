use std::path::Path;
use std::process::Command;

pub fn check_java_file(path: &Path) {
    println!("☕ Checking Java syntax: {}", path.display());
    let output = Command::new("javac")
        .arg("-Xlint")
        .arg("-d")
        .arg("/tmp") // compiled class files are discarded here
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

