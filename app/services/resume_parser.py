import re
from dataclasses import asdict, dataclass, field
from typing import Any

from .defense_parser import FederalContextExtractor

SKILL_HINTS = [
    'python', 'java', 'javascript', 'typescript', 'react', 'node', 'go', 'rust', 'c++',
    'kubernetes', 'docker', 'terraform', 'ansible', 'aws', 'aws govcloud', 'govcloud',
    'azure', 'azure government', 'gcp', 'linux', 'postgresql', 'redis', 'fastapi',
    'django', 'spring boot', 'ci/cd', 'jenkins', 'gitlab', 'github actions', 'devops',
    'devsecops', 'security', 'rmf', 'fedramp', 'nist', 'nist 800-53', 'stig', 'acas',
    'splunk', 'nessus', 'cloudformation', 'helm', 'prometheus', 'grafana', 'elk',
    'machine learning', 'pytorch', 'tensorflow', 'llm', 'airflow', 'dbt', 'snowflake',
    'databricks', 'sql', 'graphql', 'api design', 'microservices'
]

SENIORITY_PATTERNS: list[tuple[str, re.Pattern[str], float]] = [
    ('Principal', re.compile(r'\b(principal|distinguished|architect)\b', re.I), 0.88),
    ('Staff', re.compile(r'\b(staff|lead)\b', re.I), 0.82),
    ('Senior', re.compile(r'\b(senior|sr\.?|10\+\s*years|8\+\s*years|7\+\s*years)\b', re.I), 0.76),
    ('Mid', re.compile(r'\b(3\+\s*years|4\+\s*years|5\+\s*years|engineer)\b', re.I), 0.48),
]


@dataclass
class ParsedResume:
    result_class: str = 'resume_document'
    name: str | None = None
    headline: str | None = None
    location: str | None = None
    profile_url: str | None = None
    skills: list[str] = field(default_factory=list)
    seniority_label: str | None = None
    seniority_confidence: float = 0.0
    clearance_breadcrumb_level: str = 'none'
    clearance_payload: dict[str, Any] = field(default_factory=dict)
    evidence_snippets: list[str] = field(default_factory=list)
    raw_text_excerpt: str = ''

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class ResumeParser:
    """Conservative parser for approved public resume/profile text.

    It extracts evidence but does not make employment, clearance, or identity claims.
    """

    def __init__(self) -> None:
        self.defense = FederalContextExtractor()

    def parse(self, text: str, source_url: str | None = None) -> ParsedResume:
        clean = self._normalize_text(text)
        name = self._extract_name(clean)
        location = self._extract_location(clean)
        skills = self._extract_skills(clean)
        headline = self._extract_headline(clean, skills)
        seniority_label, seniority_confidence = self._extract_seniority(clean)
        defense_payload = self.defense.evaluate_unstructured_text(clean)
        snippets = self._evidence_snippets(clean, skills, defense_payload.matched_phrases)

        return ParsedResume(
            name=name,
            headline=headline,
            location=location or defense_payload.geo_zone_match,
            profile_url=source_url or self._extract_url(clean),
            skills=skills,
            seniority_label=seniority_label,
            seniority_confidence=seniority_confidence,
            clearance_breadcrumb_level=self.defense.clearance_breadcrumb_level(defense_payload),
            clearance_payload=defense_payload.to_dict(),
            evidence_snippets=snippets,
            raw_text_excerpt=clean[:3000],
        )

    def _normalize_text(self, text: str) -> str:
        return re.sub(r'\s+', ' ', (text or '').replace('\u00a0', ' ')).strip()

    def _extract_name(self, text: str) -> str | None:
        lines = [line.strip() for line in re.split(r'[\n\r]+', text) if line.strip()]
        if lines:
            first = lines[0][:100]
            if not re.search(r'\b(resume|curriculum vitae|experience|summary|skills)\b', first, re.I):
                return first
        match = re.search(r'(?i)(?:name|candidate)\s*[:\-]\s*([A-Z][A-Za-z .\-]{3,80})', text)
        return match.group(1).strip() if match else None

    def _extract_url(self, text: str) -> str | None:
        match = re.search(r'https?://[^\s)>,]+', text)
        return match.group(0) if match else None

    def _extract_location(self, text: str) -> str | None:
        patterns = [
            r'\b(Washington\s*,?\s*DC|District\s*of\s*Columbia|Arlington\s*,?\s*VA|Alexandria\s*,?\s*VA|Reston\s*,?\s*VA|Herndon\s*,?\s*VA|Chantilly\s*,?\s*VA|McLean\s*,?\s*VA|Fairfax\s*,?\s*VA|Fort\s*Meade\s*,?\s*MD|Annapolis\s*Junction\s*,?\s*MD|Rockville\s*,?\s*MD|Bethesda\s*,?\s*MD)\b',
            r'(?i)\b(Remote\s*US|Remote|Hybrid|Onsite)\b',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.I)
            if match:
                return match.group(1)
        return None

    def _extract_skills(self, text: str) -> list[str]:
        lower = text.lower()
        found = {skill for skill in SKILL_HINTS if skill in lower}
        return sorted(found)

    def _extract_headline(self, text: str, skills: list[str]) -> str | None:
        title_match = re.search(r'\b(Senior|Sr\.?|Lead|Principal|Staff)?\s*(DevOps|DevSecOps|Site Reliability|SRE|Platform|Cloud|Security|Systems|Software)\s+(Engineer|Architect|Developer|Specialist)\b', text, re.I)
        if title_match:
            return title_match.group(0).strip()
        if skills:
            return f"Public resume/profile with {', '.join(skills[:5])} evidence"
        return text[:180] if text else None

    def _extract_seniority(self, text: str) -> tuple[str | None, float]:
        for label, pattern, confidence in SENIORITY_PATTERNS:
            if pattern.search(text):
                return label, confidence
        return None, 0.0

    def _evidence_snippets(self, text: str, skills: list[str], clearance_phrases: list[str]) -> list[str]:
        snippets: list[str] = []
        sentences = re.split(r'(?<=[.!?])\s+', text)
        targets = set(skills[:8] + clearance_phrases[:5])
        for sentence in sentences:
            lower = sentence.lower()
            if any(target.lower() in lower for target in targets if target):
                snippets.append(sentence[:280])
            if len(snippets) >= 8:
                break
        return snippets
