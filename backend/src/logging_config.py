import logging


def setup_logger(name: str = None, level=logging.INFO):
    logger = logging.getLogger(name)
    if not logger.handlers:  # Prevent duplicate handlers
        logger.setLevel(level)
    return logger
