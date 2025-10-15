import argparse
import subprocess
import sys
import os
import time
import psutil

from statistics import mean

def monitor_proc(cmd, sample_interval=0.1, timeout=None):
    """Run a command and monitor the process."""
    print(f"Running: {' '.join(cmd)}")

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    start_time = time.time()
    cpu_samples = []
    mem_samples = []
    peak_mem = 0

    try:
        while proc.is_running():
            try:
                with proc.oneshot():
                    cpu = proc.cpu_percent()
                    mem = proc.memory_info().rss / (1024 * 1024)
                    cpu_samples.append(cpu)
                    mem_samples.append(mem)
                    peak_mem = max(peak_mem, mem)
                if timeout and (time.time() - start_time > timeout):
                    proc.kill()
                    break
            except psutil.NoSuchProcess:
                break

        stdout, stderr = proc.communicate()
        end_time = time.time()
        duration = end_time - start_time
        exit_code = proc.returncode

        return {
            "peak_mem": peak_mem,
            "duration": duration,
            "exit_code": exit_code,
            "avg_cpu": mean(cpu_samples) if cpu_samples else 0,
            "stdout": stdout.decode("utf-8"),
            "stderr": stderr.decode("utf-8"),
        }

    except KeyboardInterrupt:
        proc.kill()
        print("Process killed by user.")
        sys.exit(1)


def analyze_results(results):
    """Basic heuristics for inefficiencies and leaks."""
    issues = []
    if results["exit_code"] != 0:
        issues.append("! Non zero exit code: program crashed or returned an error.")
    if results["peak_mem"] > 500:
        issues.append("! High memory usage: program may be leaking memory.")
    if results["duration"] > 10:
        issues.append("! High runtime: program may be inefficient. Check for inefficient loops.")
    if results["avg_cpu"] < 5 and results["duration"] > 5:
        issues.append("! Low CPU usage with long runtime - possible blocking io or deadlock")

    if not issues:
        issues.append("Good job! Your program is efficient and non-leaking.")

    return issues

def main():
    parser = argparse.ArgumentParser(description="Lightweight Valgrind-like runtime analyzer.")
    parser.add_argument("command", nargs="+", help="Command to run (e.g. ./a.out or python script.py)")
    parser.add_argument("--timeout", type=int, default=None, help="Optional timeout in seconds.")
    args = parser.parse_args()

    results = monitor_process(args.command, timeout=args.timeout)
    print("\n--- Resource Summary ---")
    print(f"Duration: {results['duration']:.2f}s")
    print(f"Peak Memory: {results['peak_mem']:.2f} MB")
    print(f"Average CPU: {results['avg_cpu']:.2f}%")
    print(f"Exit Code: {results['exit_code']}\n")

    print("--- Analysis ---")
    for issue in analyze_results(results):
        print(issue)

    print("\n--- STDERR Output (truncated) ---")
    print(results['stderr'][:500])


if __name__ == "__main__":
    main()


