import argparse
import subprocess
import psutil
import time
import sys
from statistics import mean

def monitor_process(proc, sample_interval=0.2, timeout=None):
    """Monitor an already running process for CPU/memory usage."""
    cpu_samples = []
    mem_samples = []
    peak_memory = 0
    start_time = time.time()

    while proc.is_running():
        try:
            with proc.oneshot():
                cpu = proc.cpu_percent(interval=None)
                mem = proc.memory_info().rss / (1024 * 1024)
                cpu_samples.append(cpu)
                mem_samples.append(mem)
                peak_memory = max(peak_memory, mem)
        except psutil.NoSuchProcess:
            break

        if timeout and (time.time() - start_time > timeout):
            proc.kill()
            print("⛔ Timeout reached. Process killed.")
            break

        time.sleep(sample_interval)

    stdout, stderr = proc.communicate()
    end_time = time.time()
    return {
        "exit_code": proc.returncode,
        "duration": end_time - start_time,
        "avg_cpu": mean(cpu_samples) if cpu_samples else 0,
        "peak_memory": peak_memory,
        "stdout": stdout.decode(errors="ignore"),
        "stderr": stderr.decode(errors="ignore"),
    }


def run_smart(cmd, timeout=None):
    """Run process and automatically choose between light and monitored modes."""
    start = time.time()
    proc = psutil.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    try:
        stdout, stderr = proc.communicate(timeout=1)
        end = time.time()

        # 🩹 FIX: Safely get memory info if process still exists
        try:
            mem_info = proc.memory_info().rss / (1024 * 1024)
        except psutil.NoSuchProcess:
            mem_info = 0.0  # process ended too quickly to sample

        return {
            "exit_code": proc.returncode,
            "duration": end - start,
            "avg_cpu": 0,
            "peak_memory": mem_info,
            "stdout": stdout.decode(errors="ignore"),
            "stderr": stderr.decode(errors="ignore"),
            "mode": "light",
        }

    except subprocess.TimeoutExpired:
        # Still running — switch to monitoring mode
        print("ℹ️ Detected long-running program — switching to monitor mode.")
        return {**monitor_process(proc, timeout=timeout), "mode": "monitor"}



def analyze_results(results):
    issues = []
    if results["exit_code"] != 0:
        issues.append("❗ Non-zero exit code: program crashed or returned error.")
    if results["peak_memory"] > 500:
        issues.append("⚠️ High memory usage (>500 MB). Possible leak or inefficiency.")
    if results["duration"] > 10:
        issues.append("⚠️ Long runtime (>10s). Check for inefficient loops or I/O.")
    if results["avg_cpu"] < 5 and results["duration"] > 5 and results["mode"] == "monitor":
        issues.append("⚠️ Low CPU usage with long runtime — possible blocking I/O or deadlock.")
    if not issues:
        issues.append("✅ No obvious issues detected.")
    return issues


def main():
    parser = argparse.ArgumentParser(description="Smart lightweight Valgrind-like analyzer.")
    parser.add_argument("command", nargs="+", help="Command to run (e.g. ./a.out or python script.py)")
    parser.add_argument("--timeout", type=int, default=None, help="Optional timeout in seconds.")
    args = parser.parse_args()

    results = run_smart(args.command, timeout=args.timeout)

    print("\n--- Resource Summary ---")
    print(f"Mode: {results['mode']}")
    print(f"Duration: {results['duration']:.2f}s")
    print(f"Peak Memory: {results['peak_memory']:.2f} MB")
    if results['mode'] == "monitor":
        print(f"Average CPU: {results['avg_cpu']:.2f}%")
    print(f"Exit Code: {results['exit_code']}\n")

    print("--- Analysis ---")
    for issue in analyze_results(results):
        print(issue)

    if results['stderr']:
        print("\n--- STDERR Output (truncated) ---")
        print(results['stderr'][:500])


if __name__ == "__main__":
    main()

