from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    database_url: str = 'postgresql+psycopg2://user:pass@localhost:5432/sourcing'
    redis_url: str = 'redis://localhost:6379/0'
    celery_broker_url: str = 'redis://localhost:6379/0'
    celery_result_backend: str = 'redis://localhost:6379/1'
    opensearch_url: str = 'http://localhost:9200'
    opensearch_index: str = 'candidates'
    ollama_endpoint: str = 'http://localhost:11434'
    github_rate_limit_max: int = 30
    github_rate_limit_window_seconds: int = 60


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
