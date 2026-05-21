from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore', case_sensitive=False)

    DATABASE_URL: str = 'postgresql://sourcing:sourcing@localhost:5432/sourcing'
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_ECHO_SQL: bool = False

    REDIS_URL: str = 'redis://localhost:6379/0'
    CELERY_BROKER_URL: str = 'redis://localhost:6379/0'
    CELERY_RESULT_BACKEND: str = 'redis://localhost:6379/1'

    OPENSEARCH_URL: str = 'http://localhost:9200'
    OPENSEARCH_INDEX: str = 'candidates'
    OPENSEARCH_SHARDS: int = 1
    OPENSEARCH_REPLICAS: int = 0

    OLLAMA_ENDPOINT: str = 'http://localhost:11434'
    OLLAMA_MODEL: str = 'llama3'
    OLLAMA_TIMEOUT_SECS: int = 15

    IDENTITY_MATCH_THRESHOLD: float = 0.85
    GITHUB_RATE_LIMIT_MAX: int = 30
    GITHUB_RATE_LIMIT_WINDOW_SECONDS: int = 60
    LOG_LEVEL: str = 'INFO'

    @property
    def database_url(self) -> str:
        return self.DATABASE_URL

    @property
    def redis_url(self) -> str:
        return self.REDIS_URL

    @property
    def celery_broker_url(self) -> str:
        return self.CELERY_BROKER_URL

    @property
    def celery_result_backend(self) -> str:
        return self.CELERY_RESULT_BACKEND

    @property
    def opensearch_url(self) -> str:
        return self.OPENSEARCH_URL

    @property
    def opensearch_index(self) -> str:
        return self.OPENSEARCH_INDEX

    @property
    def ollama_endpoint(self) -> str:
        return self.OLLAMA_ENDPOINT


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
