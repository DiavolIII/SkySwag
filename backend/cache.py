import json
import hashlib
from functools import wraps
from typing import Optional, Any
import logging
from config import Config

logger = logging.getLogger('skywag.cache')

# простой in-memory кэш (работает без redis)
class SimpleCache:
    def __init__(self):
        self._cache = {}
    
    def get(self, key: str) -> Optional[Any]:
        return self._cache.get(key)
    
    def set(self, key: str, value: Any, ttl: int = None):
        self._cache[key] = value
    
    def delete(self, key: str):
        self._cache.pop(key, None)
    
    def clear(self):
        self._cache.clear()

# юзаем simplecashe по умолчанию
cache = SimpleCache()
logger.info("In-memory cache initialized")

def cache_key(prefix: str, *args, **kwargs) -> str:
    """генерация ключа кэша"""
    key_parts = [prefix]
    key_parts.extend(str(arg) for arg in args)
    key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
    key_str = ":".join(key_parts)
    return hashlib.md5(key_str.encode()).hexdigest()

def cached(ttl: int = None):
    """декоратор для кэширования результатов функций"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not Config.CACHE_ENABLED:
                return func(*args, **kwargs)
            
            key = cache_key(func.__name__, *args, **kwargs)
            cached_result = cache.get(key)
            
            if cached_result is not None:
                logger.debug(f"Cache HIT: {key}")
                return cached_result
            
            logger.debug(f"Cache MISS: {key}")
            result = func(*args, **kwargs)
            
            try:
                cache.set(key, result, ttl or Config.CACHE_TTL)
            except Exception as e:
                logger.error(f"Cache set error: {e}")
            
            return result
        return wrapper
    return decorator

def invalidate_cache(pattern: str = None):
    """инвалидация кэша"""
    if pattern:
        logger.info(f"Invalidating cache for pattern: {pattern}")
    cache.clear()