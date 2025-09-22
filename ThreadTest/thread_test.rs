use std::thread;
use std::time::{Duration, Instant};

fn main() {
    let n = 100000;
    let start = Instant::now();

    let mut handles = vec![];

    for _ in 0..n {
        let handle = thread::spawn(|| {
            thread::sleep(Duration::from_secs(2));
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let elapsed = start.elapsed();
    println!("Rust: Took {:.2} seconds", elapsed.as_secs_f64());
}

