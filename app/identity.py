import logging
from difflib import SequenceMatcher
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from . import models

logger = logging.getLogger('IdentityEngine')


class TieredDeduplicationEngine:
    @staticmethod
    def calculate_text_ratio(string_a: Optional[str], string_b: Optional[str]) -> float:
        if not string_a or not string_b:
            return 0.0
        return SequenceMatcher(None, string_a.strip().lower(), string_b.strip().lower()).ratio()

    def evaluate_identity_link_score(self, source_a: Dict[str, Any], source_b: Dict[str, Any]) -> float:
        if source_a.get('primary_email') and source_a['primary_email'] == source_b.get('primary_email'):
            return 1.0

        running_confidence = 0.0
        name_score = self.calculate_text_ratio(source_a.get('canonical_name'), source_b.get('canonical_name'))
        if name_score >= 0.85:
            running_confidence += name_score * 0.50

        location_a = (source_a.get('primary_location') or '').strip().lower()
        location_b = (source_b.get('primary_location') or '').strip().lower()
        if location_a and location_a == location_b:
            running_confidence += 0.25

        handle_a = (source_a.get('username_handle') or '').strip().lower()
        handle_b = (source_b.get('username_handle') or '').strip().lower()
        if handle_a and handle_a == handle_b:
            running_confidence += 0.25

        return min(1.0, running_confidence)

    def find_best_existing_match(self, db: Session, candidate: models.Candidate, threshold: float = 0.85) -> Optional[models.Candidate]:
        candidates = db.query(models.Candidate).filter(models.Candidate.id != candidate.id, models.Candidate.deleted_at.is_(None)).limit(250).all()
        target_payload = {
            'canonical_name': candidate.canonical_name,
            'primary_location': candidate.primary_location,
            'primary_email': candidate.primary_email,
            'username_handle': candidate.sources[0].username_handle if candidate.sources else None,
        }
        best_candidate = None
        best_score = 0.0
        for other in candidates:
            other_payload = {
                'canonical_name': other.canonical_name,
                'primary_location': other.primary_location,
                'primary_email': other.primary_email,
                'username_handle': other.sources[0].username_handle if other.sources else None,
            }
            score = self.evaluate_identity_link_score(target_payload, other_payload)
            if score > best_score:
                best_score = score
                best_candidate = other
        if best_candidate and best_score >= threshold:
            logger.info('Identity match found: %s -> %s at %.2f', candidate.id, best_candidate.id, best_score)
            return best_candidate
        return None

    def resolve_and_merge_profiles(self, db: Session, target_candidate_id: str, duplicate_candidate_id: str) -> None:
        if target_candidate_id == duplicate_candidate_id:
            return

        logger.info('Merging candidate record %s into master record %s', duplicate_candidate_id, target_candidate_id)
        db.query(models.CandidateSource).filter(models.CandidateSource.candidate_id == duplicate_candidate_id).update({'candidate_id': target_candidate_id})
        db.query(models.CandidateSkill).filter(models.CandidateSkill.candidate_id == duplicate_candidate_id).update({'candidate_id': target_candidate_id})
        db.query(models.CandidateExperience).filter(models.CandidateExperience.candidate_id == duplicate_candidate_id).update({'candidate_id': target_candidate_id})
        db.query(models.Candidate).filter(models.Candidate.id == duplicate_candidate_id).delete()
        db.commit()
