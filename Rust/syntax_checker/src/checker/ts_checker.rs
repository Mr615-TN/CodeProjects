use std::path::Path;
use std::process::Command;

pub fn check_ts_file(path: &Path) {
    println!("🟦 Checking TypeScript syntax: {}", path.display());
    let output = Command::new("tsc")
        .arg("--noEmit")
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

