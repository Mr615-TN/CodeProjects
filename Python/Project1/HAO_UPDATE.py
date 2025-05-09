import subprocess
import schedule
import time
from datetime import datetime

def update_home_assistant():
    """Runs the Home Assistant update commands."""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting Home Assistant update...")
    try:
        # Replace these commands with the actual commands for your Home Assistant installation
        subprocess.run(['sudo', 'systemctl', 'stop', 'home-assistant@homeassistant'], check=True)
        subprocess.run(['sudo', 'pip3', 'install', '--upgrade', 'homeassistant'], check=True)
        subprocess.run(['sudo', 'systemctl', 'start', 'home-assistant@homeassistant'], check=True)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Home Assistant update complete.")
    except subprocess.CalledProcessError as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error during Home Assistant update: {e}")
    except FileNotFoundError:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error: One or more commands not found. Please verify the paths.")
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] An unexpected error occurred: {e}")

# Schedule the update to run every Sunday at 3:00 AM (you can adjust the day and time)
schedule.every().sunday.at("03:00").do(update_home_assistant)

if __name__ == "__main__":
    print("Home Assistant weekly update scheduler started. Press Ctrl+C to exit.")
    while True:
        schedule.run_pending()
        time.sleep(60) # Check for pending tasks every minute
