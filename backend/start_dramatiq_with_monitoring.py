"""
Script to start both Dramatiq worker and monitoring server together.
This provides a single command to start both services.
"""
import subprocess
import sys
import signal
import os
from multiprocessing import Process
import time

def start_dramatiq_worker():
    """Start the Dramatiq worker process"""
    try:
        # Adjust this command based on your actual dramatiq setup
        subprocess.run([
            sys.executable, "-m", "dramatiq",
            "app.tasks.background_tasks",  # Adjust path as needed
            "--threads", "4",
            "--processes", "1"
        ])
    except KeyboardInterrupt:
        print("Dramatiq worker stopped")

def start_monitoring_server():
    """Start the monitoring HTTP server"""
    try:
        import uvicorn
        from dramatiq_server import app
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=5152,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("Monitoring server stopped")

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print(f"\nReceived signal {signum}, shutting down...")
    sys.exit(0)

def main():
    """Main function to start both processes"""
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    print("Starting Dramatiq worker and monitoring server...")

    # Start both processes
    worker_process = Process(target=start_dramatiq_worker)
    server_process = Process(target=start_monitoring_server)

    try:
        worker_process.start()
        time.sleep(2)  # Give worker a moment to start
        server_process.start()

        print("✅ Dramatiq worker started")
        print("✅ Monitoring server started on http://localhost:5152")
        print("📊 Access Dramatiq dashboard at: http://localhost:5152/dramatiq/dashboard")
        print("🔍 API docs available at: http://localhost:5152/docs")
        print("\nPress Ctrl+C to stop both services")

        # Wait for processes
        worker_process.join()
        server_process.join()

    except KeyboardInterrupt:
        print("\nShutting down...")
        worker_process.terminate()
        server_process.terminate()
        worker_process.join(timeout=5)
        server_process.join(timeout=5)

        if worker_process.is_alive():
            worker_process.kill()
        if server_process.is_alive():
            server_process.kill()

        print("All processes stopped")

if __name__ == "__main__":
    main()