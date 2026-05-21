import logging
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from .config import settings

logger = logging.getLogger('SourcingDB')

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False, future=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
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
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
