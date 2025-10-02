"""
Structured logging configuration for production and development environments
"""
import sys
import json
from pathlib import Path
from loguru import logger
from app.core.config import settings, Mode


def serialize_record(record: dict) -> str:
    """Serialize log record to JSON format for production"""
    subset = {
        "timestamp": record["time"].isoformat(),
        "level": record["level"].name,
        "message": record["message"],
        "module": record["name"],
        "function": record["function"],
        "line": record["line"],
    }

    # Include exception info if present
    if record["exception"]:
        subset["exception"] = {
            "type": record["exception"].type.__name__,
            "value": str(record["exception"].value),
        }

    # Include extra fields from context
    if record["extra"]:
        subset["extra"] = record["extra"]

    return json.dumps(subset)


def setup_logging():
    """
    Configure logging based on environment mode.
    - Production: JSON format, INFO level, with rotation
    - Development: Human-readable format, DEBUG level
    """
    # Remove default handler
    logger.remove()

    if settings.mode == Mode.prod:
        # Production configuration: JSON logging
        logger.add(
            sys.stdout,
            format=serialize_record,
            level="INFO",
            serialize=False,  # We're doing custom serialization
            backtrace=False,
            diagnose=False,  # Don't include variable values in production
        )

        # Also log to file with rotation
        log_path = Path("logs")
        log_path.mkdir(exist_ok=True)

        logger.add(
            log_path / "app_{time:YYYY-MM-DD}.log",
            format=serialize_record,
            level="INFO",
            rotation="00:00",  # Rotate at midnight
            retention="30 days",  # Keep logs for 30 days
            compression="zip",  # Compress rotated logs
            serialize=False,
            backtrace=False,
            diagnose=False,
        )

        # Separate error log
        logger.add(
            log_path / "error_{time:YYYY-MM-DD}.log",
            format=serialize_record,
            level="ERROR",
            rotation="00:00",
            retention="90 days",  # Keep error logs longer
            compression="zip",
            serialize=False,
            backtrace=True,  # Include backtrace for errors
            diagnose=False,
        )

    else:
        # Development configuration: Human-readable with colors
        logger.add(
            sys.stdout,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
            level="DEBUG",
            colorize=True,
            backtrace=True,
            diagnose=True,  # Include variable values in development
        )

    logger.info(f"Logging configured for {settings.mode} mode")


def get_logger():
    """Get configured logger instance"""
    return logger
