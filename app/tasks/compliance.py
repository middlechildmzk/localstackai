import hashlib
import logging

from sqlalchemy.orm import Session

from .. import models
from ..db import SessionLocal
from ..search import indexer

logger = logging.getLogger('ComplianceEngine')


def execute_hard_erasure_workflow(target_email: str) -> str:
    clean_email = target_email.strip().lower()
    email_hash = hashlib.sha256(clean_email.encode('utf-8')).hexdigest()
    db: Session = SessionLocal()

    try:
        candidate = db.query(models.Candidate).filter(models.Candidate.primary_email == clean_email).first()
        if not candidate:
            audit_log = models.ComplianceAuditLog(
                event_type='HARD_ERASURE_NOOP',
                anonymized_key_hash=email_hash,
                action_summary='No active candidate record found for supplied anonymized identifier.',
            )
            db.add(audit_log)
            db.commit()
            logger.info('No candidate found for erasure hash: %s', email_hash)
            return email_hash

        candidate_uuid = str(candidate.id)
        db.query(models.Candidate).filter(models.Candidate.id == candidate.id).delete()
        indexer.delete_candidate_profile(candidate_uuid)

        audit_log = models.ComplianceAuditLog(
            event_type='HARD_ERASURE_REQUEST',
            anonymized_key_hash=email_hash,
            action_summary=f'Candidate profile {candidate_uuid} completely erased across relational and search index layers.',
        )
        db.add(audit_log)
        db.commit()
        logger.info('Compliance erasure pipeline finished for entity hash: %s', email_hash)
        return email_hash
    except Exception as failure:
        db.rollback()
        logger.exception('Critical failure inside compliance erasure workflow: %s', failure)
        raise
    finally:
        db.close()
