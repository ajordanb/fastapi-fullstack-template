import os
import subprocess
import signal
import sys
import time
from pathlib import Path

import questionary


def start_local_redis():
    os.system(
        "docker compose -f redis-docker-compose.yaml pull && docker compose -f redis-docker-compose.yaml down"
    )
    os.system("docker compose -f redis-docker-compose.yaml up -d")
    print("Redis started")
    print("Dashboard available in 6379")


def start_local_datadog():
    """Start Datadog agent for local development"""
    # Check if DD_API_KEY is set
    if not os.getenv('DD_API_KEY'):
        print("❌ DD_API_KEY environment variable not set!")
        print("💡 Get your API key from: https://app.datadoghq.com/organization-settings/api-keys")
        print("💡 Then set it: export DD_API_KEY=your_api_key")
        return

    os.system(
        "docker compose -f datadog-docker-compose.yaml pull && docker compose -f datadog-docker-compose.yaml down"
    )
    os.system("docker compose -f datadog-docker-compose.yaml up -d")
    print("✅ Datadog Agent started")
    print("📍 APM: localhost:8126")
    print("📍 StatsD: localhost:8125")
    print("📍 Dashboard: https://app.datadoghq.com/")


def start_monitoring_stack():
    """Start Redis + Datadog for local development"""
    print("🚀 Starting Monitoring Stack (Redis + Datadog)...")

    # Check if DD_API_KEY is set
    if not os.getenv('DD_API_KEY'):
        print("❌ DD_API_KEY environment variable not set!")
        print("💡 Get your API key from: https://app.datadoghq.com/organization-settings/api-keys")
        print("💡 Then set it: export DD_API_KEY=your_api_key")
        return

    start_local_redis()
    time.sleep(2)
    start_local_datadog()
    print("\n✅ Monitoring stack is running!")
    print("📍 Redis: localhost:6379")
    print("📍 Datadog APM: localhost:8126")
    print("📍 Datadog Dashboard: https://app.datadoghq.com/")


def start_development_stack():
    """Start the full development stack: Redis + API + Workers"""
    print("🚀 Starting Development Stack...")

    # Ask if user wants to include Datadog
    include_datadog = False
    if os.getenv('DD_API_KEY'):
        include_datadog = questionary.confirm(
            "Start with Datadog monitoring? (DD_API_KEY is set)",
            default=False
        ).ask()
    else:
        print("💡 Tip: Set DD_API_KEY to enable Datadog monitoring option")

    # Store process references
    processes = []

    def signal_handler(sig, frame):
        print("\n🛑 Shutting down development stack...")
        for process in processes:
            if process.poll() is None:  # Process is still running
                process.terminate()
        sys.exit(0)

    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        # 1. Start Redis
        print("📦 Starting Redis...")
        start_local_redis()
        time.sleep(2)  # Give Redis time to start

        # 2. Optionally start Datadog
        if include_datadog:
            print("📊 Starting Datadog agent...")
            start_local_datadog()
            time.sleep(2)

        # 3. Change to backend directory
        backend_dir = Path(__file__).parent.parent
        os.chdir(backend_dir)

        # 4. Start API in background
        print("🌐 Starting FastAPI server...")
        api_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--reload",
            "--host", "127.0.0.1",
            "--port", "8000"
        ])
        processes.append(api_process)
        time.sleep(3)  # Give API time to start

        # 5. Start Dramatiq workers
        print("⚙️  Starting Dramatiq workers...")
        worker_process = subprocess.Popen([
            sys.executable, "-m", "dramatiq",
            "app.tasks.background_tasks",
            "--watch", "app",
            "--processes", "1",
            "--threads", "2"
        ])
        processes.append(worker_process)

        print("\n✅ Development stack is running!")
        print("📍 API: http://127.0.0.1:8000")
        print("📍 API Docs: http://127.0.0.1:8000/docs")
        print("📍 Redis: localhost:6379")
        if include_datadog:
            print("📍 Datadog: https://app.datadoghq.com/")
        print("\n💡 Press Ctrl+C to stop all services")

        # Keep the script running
        while True:
            # Check if any process has died
            for i, process in enumerate(processes):
                if process.poll() is not None:
                    print(f"❌ Process {i} has stopped unexpectedly")
                    signal_handler(signal.SIGTERM, None)
            time.sleep(1)

    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
    except Exception as e:
        print(f"❌ Error starting development stack: {e}")
        signal_handler(signal.SIGTERM, None)


def start_api_only():
    """Start just the FastAPI server for development"""
    print("🌐 Starting FastAPI server only...")
    backend_dir = Path(__file__).parent.parent
    os.chdir(backend_dir)

    os.system("uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")


def start_workers_only():
    """Start just the Dramatiq workers for development"""
    print("⚙️  Starting Dramatiq workers only...")
    backend_dir = Path(__file__).parent.parent
    os.chdir(backend_dir)

    os.system("dramatiq app.tasks.background_tasks --watch app --processes 1 --threads 2")


actions = {
    "Development Stack (All)": start_development_stack,
    "API Only": start_api_only,
    "Workers Only": start_workers_only,
    "Local Redis": start_local_redis,
    "Local Datadog": start_local_datadog,
    "Monitoring Stack (Redis + Datadog)": start_monitoring_stack,
}


if __name__ == "__main__":
    action = questionary.select(
        "Tools - what do you want to do?", choices=list(actions.keys())
    ).ask()
    result = actions[action]()
