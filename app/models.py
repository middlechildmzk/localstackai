import datetime as dt
import uuid

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Candidate(Base):
    __tablename__ = 'candidates'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canonical_name = Column(String, nullable=False)
    primary_email = Column(String, unique=True, nullable=True)
    primary_location = Column(String)
    headline = Column(String)
    current_role = Column(String)
    current_company = Column(String)
    summary_bio = Column(Text)
    orcid_id = Column(String, unique=True)
    github_handle = Column(String)
    gitlab_handle = Column(String)
    kaggle_handle = Column(String)
    codeforces_handle = Column(String)
    mastodon_handle = Column(String)
    devto_handle = Column(String)
    scholar_id = Column(String)
    arxiv_ids = Column(ARRAY(String), default=list)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), onupdate=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    sources = relationship('CandidateSource', back_populates='candidate', cascade='all, delete-orphan')
    skills = relationship('CandidateSkill', back_populates='candidate', cascade='all, delete-orphan')
    experiences = relationship('CandidateExperience', back_populates='candidate', cascade='all, delete-orphan')
    signals = relationship('CandidateSignal', back_populates='candidate', cascade='all, delete-orphan')
    publications = relationship('CandidatePublication', back_populates='candidate', cascade='all, delete-orphan')
    role_scores = relationship('RoleScore', back_populates='candidate', cascade='all, delete-orphan')


class CandidateSource(Base):
    __tablename__ = 'candidate_sources'
    __table_args__ = (UniqueConstraint('source_name', 'source_user_id', name='uq_candidate_source_identity'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'), nullable=False)
    source_name = Column(String, nullable=False)
    source_user_id = Column(String, nullable=False)
    profile_url = Column(String)
    username_handle = Column(String)
    raw_payload = Column(JSONB, nullable=False)
    payload_hash = Column(String(64), nullable=False)
    last_seen_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    candidate = relationship('Candidate', back_populates='sources')


class CandidateSkill(Base):
    __tablename__ = 'candidate_skills'
    __table_args__ = (UniqueConstraint('candidate_id', 'skill_name', 'source_name', name='uq_candidate_skill_source'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'), nullable=False)
    skill_name = Column(String, nullable=False)
    source_name = Column(String, nullable=False)
    confidence_score = Column(Numeric(3, 2), nullable=False, default=0.80)
    extracted_by = Column(String, nullable=False, default='heuristic_regex')
    last_seen_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)

    candidate = relationship('Candidate', back_populates='skills')


class CandidateExperience(Base):
    __tablename__ = 'candidate_experiences'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'), nullable=False)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    source_name = Column(String, nullable=False)
    description = Column(Text)

    candidate = relationship('Candidate', back_populates='experiences')


class CandidateSignal(Base):
    __tablename__ = 'candidate_signals'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'), nullable=False)
    signal_type = Column(String, nullable=False)
    signal_value = Column(Text, nullable=False)
    signal_source = Column(String, nullable=False)
    captured_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)

    candidate = relationship('Candidate', back_populates='signals')


class CandidatePublication(Base):
    __tablename__ = 'candidate_publications'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'), nullable=False)
    title = Column(Text, nullable=False)
    doi = Column(String)
    publication_year = Column(Integer)
    citation_count = Column(Integer, default=0)
    source_name = Column(String, nullable=False)
    source_url = Column(String)
    co_authors = Column(ARRAY(String), default=list)
    topics = Column(ARRAY(String), default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)

    candidate = relationship('Candidate', back_populates='publications')


class RoleScore(Base):
    __tablename__ = 'role_scores'
    __table_args__ = (UniqueConstraint('candidate_id', 'role_key', name='uq_role_score_candidate_role'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'), nullable=False)
    role_key = Column(String, nullable=False)
    score = Column(Numeric(5, 2), nullable=False)
    explanation = Column(JSONB, nullable=False, default=dict)
    computed_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)

    candidate = relationship('Candidate', back_populates='role_scores')


class ProvenanceEvent(Base):
    __tablename__ = 'provenance_events'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'))
    source_name = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    evidence_url = Column(String)
    evidence_hash = Column(String(64))
    license_label = Column(String)
    payload = Column(JSONB, nullable=False, default=dict)
    captured_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)


class IdentityEdge(Base):
    __tablename__ = 'identity_edges'
    __table_args__ = (UniqueConstraint('from_candidate_id', 'to_candidate_id', 'edge_type', name='uq_identity_edge'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'), nullable=False)
    to_candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'), nullable=False)
    edge_type = Column(String, nullable=False)
    confidence_score = Column(Numeric(4, 3), nullable=False, default=0.500)
    evidence = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)


class EmbeddingJob(Base):
    __tablename__ = 'embedding_jobs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'))
    object_type = Column(String, nullable=False)
    object_id = Column(String)
    text_hash = Column(String(64), nullable=False)
    embedding_model = Column(String, nullable=False)
    status = Column(String, nullable=False, default='queued')
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), onupdate=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)


class AdapterHealthEvent(Base):
    __tablename__ = 'adapter_health_events'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    latency_ms = Column(Integer)
    error_message = Column(Text)
    captured_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)


class ReviewerFeedback(Base):
    __tablename__ = 'reviewer_feedback'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id', ondelete='CASCADE'))
    feedback_type = Column(String, nullable=False)
    feedback_value = Column(String, nullable=False)
    role_key = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)


class SourceSyncState(Base):
    __tablename__ = 'source_sync_state'

    source_name = Column(String, primary_key=True)
    last_cursor = Column(Text)
    last_run_status = Column(String, nullable=False)
    error_message = Column(Text)
    updated_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), onupdate=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)


class ComplianceAuditLog(Base):
    __tablename__ = 'compliance_audit_log'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String, nullable=False)
    anonymized_key_hash = Column(String(64), nullable=False)
    action_summary = Column(Text, nullable=False)
    executed_at = Column(DateTime(timezone=True), default=lambda: dt.datetime.now(dt.timezone.utc), nullable=False)
