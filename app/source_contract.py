from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class SourceIngestionRecord:
    source_name: str
    source_user_id: str
    full_name: str
    profile_url: str | None = None
    username_handle: str | None = None
    location: str | None = None
    headline: str | None = None
    bio_summary: str | None = None
    extracted_skills: list[str] = field(default_factory=list)
    signals: list[dict[str, Any]] = field(default_factory=list)
    publications: list[dict[str, Any]] = field(default_factory=list)
    raw_payload: dict[str, Any] = field(default_factory=dict)

    def to_payload(self) -> dict[str, Any]:
        return asdict(self)
