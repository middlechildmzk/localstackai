import logging
from collections.abc import Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from .config import settings

logger = logging.getLogger('SourcingDB')

engine: Engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=1800,
    echo=settings.DB_ECHO_SQL,
    connect_args={'options': '-csearch_path=public'},
    future=True,
)


@event.listens_for(engine, 'connect')
def _on_connect(dbapi_connection, connection_record) -> None:  # type: ignore[no-untyped-def]
    cursor = dbapi_connection.cursor()
    cursor.execute("SET timezone='UTC'")
    cursor.close()


SessionFactory = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False, future=True)
SessionLocal = SessionFactory


def get_db() -> Generator[Session, None, None]:
    db = SessionFactory()
    try:
        yield db
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception('Database transaction failed and was rolled back: %s', exc)
        raise
    except Exception as exc:
        db.rollback()
        logger.exception('Unexpected database dependency failure: %s', exc)
        raise
    finally:
        db.close()


def session_scope() -> Generator[Session, None, None]:
    db = SessionFactory()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def verify_database_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        logger.info('Database connectivity verified.')
        return True
    except Exception as exc:
        logger.error('Database connectivity check failed: %s', exc)
        return False
