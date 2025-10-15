import argparse
import subprocess
import psutil
import time
import os
import sys
from statistics import mean

def monitor_process(cmd, sample_interval=0.2, timeout=None):
    """Run a command and monitor its resource usage."""
    print(f"Running: {' '.join(cmd)}")

    process = psutil.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    start_time = time.time()
    cpu_samples = []
    mem_samples = []
    peak_memory = 0

    try:
        while process.is_running():
            try:
                with process.oneshot():
                    cpu = process.cpu_percent()
                    mem = process.memory_info().rss / (1024 * 1024)  # MB
                    cpu_samples.append(cpu)
                    mem_samples.append(mem)
                    peak_memory = max(peak_memory, mem)
                if timeout and (time.time() - start_time > timeout):
                    process.kill()
                    print(f"⛔ Timeout reached ({timeout}s). Process killed.")
                    break
                time.sleep(sample_interval)
            except psutil.NoSuchProcess:
                break

        stdout, stderr = process.communicate()
        end_time = time.time()
        duration = end_time - start_time
        exit_code = process.returncode

        return {
            "exit_code": exit_code,
            "duration": duration,
            "avg_cpu": mean(cpu_samples) if cpu_samples else 0,
            "peak_memory": peak_memory,
            "stdout": stdout.decode(errors="ignore"),
            "stderr": stderr.decode(errors="ignore"),
        }

    except KeyboardInterrupt:
        process.kill()
        print("⛔ Process interrupted by user.")
        sys.exit(1)


def analyze_results(results):
    """Basic heuristics for inefficiencies and leaks."""
    issues = []
    if results["exit_code"] != 0:
        issues.append("❗ Non-zero exit code: program crashed or returned error.")
    if results["peak_memory"] > 500:
        issues.append("⚠️ High memory usage (>500 MB). Possible leak or inefficiency.")
    if results["duration"] > 10:
        issues.append("⚠️ Long runtime (>10s). Check for inefficient loops or I/O.")
    if results["avg_cpu"] < 5 and results["duration"] > 5:
        issues.append("⚠️ Low CPU usage with long runtime — possible blocking I/O or deadlock.")

    if not issues:
        issues.append("✅ No obvious issues detected.")
    return issues


def main():
    parser = argparse.ArgumentParser(description="Lightweight Valgrind-like runtime analyzer.")
    parser.add_argument("command", nargs="+", help="Command to run (e.g. ./a.out or python script.py)")
    parser.add_argument("--timeout", type=int, default=None, help="Optional timeout in seconds.")
    args = parser.parse_args()

    results = monitor_process(args.command, timeout=args.timeout)
    print("\n--- Resource Summary ---")
    print(f"Duration: {results['duration']:.2f}s")
    print(f"Peak Memory: {results['peak_memory']:.2f} MB")
    print(f"Average CPU: {results['avg_cpu']:.2f}%")
    print(f"Exit Code: {results['exit_code']}\n")

    print("--- Analysis ---")
    for issue in analyze_results(results):
        print(issue)

    print("\n--- STDERR Output (truncated) ---")
    print(results['stderr'][:500])


if __name__ == "__main__":
    main()

