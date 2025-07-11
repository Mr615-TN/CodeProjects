use colored::*;
use std::string::ToString;
use sysinfo::*;

fn exc(exc: &str) -> Result<std::process::Output, std::io::Error> {
    let mut exc = exc.split_whitespace();
    let mut cmd = std::process::Command::new(exc.next().unwrap());
    cmd.args(exc).output();
}

fn main() {
    let mut sys = System::new();
    let mut memory = sys.memory();
    let mut cpu = sys.cpu();
    let mut network = sys.networks();
    let mut battery = sys.batteries();
    println!(
        "{} {} {}",
        "Memory: ".yellow(),
        memory.total().to_string().yellow(),        
        "MB".yellow()
    );    
    println!(
        "{} {} {}",
        "CPU: ".yellow(),
        cpu.usage().to_string().yellow(),
        "%".yellow()
    );
    println!(
        "{} {} {}",
        "Network: ".yellow(),
        network.values().next().unwrap().speed().to_string().yellow(),
        "MB/s".yellow()
    );
    println!(
        "{} {} {}",
        "Battery: ".yellow(),
        battery.values().next().unwrap().percentage().to_string().yellow(),        
        "%".yellow()        
    );    
}                           
