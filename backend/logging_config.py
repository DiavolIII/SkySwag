import logging
import sys

def setup_logging():
    """настройка логирования"""
    logger = logging.getLogger('skywag')
    logger.setLevel(logging.INFO)
    
    # форматтер
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # консольный handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger

logger = setup_logging()