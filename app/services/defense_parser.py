import re
from dataclasses import asdict, dataclass, field


@dataclass
class DefenseContextPayload:
    is_clearance_breadcrumb_found: bool
    highest_detected_level: str | None = None
    confidence_rating: float = 0.0
    matched_phrases: list[str] = field(default_factory=list)
    geo_zone_match: str | None = None
    geo_confidence: float = 0.0
    caveat: str = 'Public-source clearance language is an unverified breadcrumb only.'

    def to_dict(self) -> dict:
        return asdict(self)


class FederalContextExtractor:
    """Conservative parser for public defense and DMV-region breadcrumbs.

    This parser never verifies clearance. It only detects public text patterns that
    should be routed to manual recruiter verification.
    """

    def __init__(self) -> None:
        self.clearance_matrix: list[tuple[str, re.Pattern[str], float]] = [
            ('TS_SCI_POLY', re.compile(r'\b(ts[\s/\-]*sci[\s/\-]*(?:with|w/)?[\s/\-]*(?:ci\s*)?poly(?:graph)?|top\s*secret[\s/\-]*sci[\s/\-]*(?:ci\s*)?poly(?:graph)?|full\s*scope\s*poly|fsp)\b', re.I), 0.80),
            ('TS_SCI', re.compile(r'\b(ts[\s/\-]*sci|top\s*secret[\s/\-]*sci)\b', re.I), 0.72),
            ('TOP_SECRET', re.compile(r'\b(top\s*secret\s*clearance|active\s*top\s*secret)\b', re.I), 0.62),
            ('SECRET', re.compile(r'\b(active\s*secret\s*clearance|secret\s*clearance)\b', re.I), 0.48),
            ('PUBLIC_TRUST', re.compile(r'\b(public\s*trust)\b', re.I), 0.35),
        ]
        self.dmv_geocodes = re.compile(
            r'\b(washington\s*,?\s*dc|district\s*of\s*columbia|dc\s*metro|dmv|arlington\s*,?\s*va|alexandria\s*,?\s*va|reston\s*,?\s*va|herndon\s*,?\s*va|chantilly\s*,?\s*va|mclean\s*,?\s*va|tysons\s*,?\s*va|fairfax\s*,?\s*va|rockville\s*,?\s*md|bethesda\s*,?\s*md|fort\s*meade\s*,?\s*md|annapolis\s*junction\s*,?\s*md)\b',
            re.I,
        )

    def evaluate_unstructured_text(self, text_blob: str) -> DefenseContextPayload:
        if not text_blob:
            return DefenseContextPayload(is_clearance_breadcrumb_found=False)

        matched_phrases: list[str] = []
        highest_detected: str | None = None
        confidence = 0.0

        for level, pattern, base_confidence in self.clearance_matrix:
            matches = pattern.findall(text_blob)
            if matches and highest_detected is None:
                highest_detected = level
                confidence = base_confidence
            for match in matches:
                matched_phrases.append(match if isinstance(match, str) else match[0])

        lower = text_blob.lower()
        if highest_detected and any(token in lower for token in ['active', 'current', 'held', 'possess']):
            confidence = min(confidence + 0.08, 0.90)
        if highest_detected and any(token in lower for token in ['eligible', 'ability to obtain', 'able to obtain']):
            confidence = max(confidence - 0.16, 0.20)

        geo_match = self.dmv_geocodes.search(text_blob)
        geo_zone = geo_match.group(0) if geo_match else None
        geo_confidence = 0.82 if geo_zone else 0.0
        if geo_zone and any(token in lower for token in ['remote', 'relocate', 'willing to relocate']):
            geo_confidence = 0.55

        return DefenseContextPayload(
            is_clearance_breadcrumb_found=highest_detected is not None,
            highest_detected_level=highest_detected,
            confidence_rating=round(confidence, 2),
            matched_phrases=sorted(set(p.strip() for p in matched_phrases if p.strip())),
            geo_zone_match=geo_zone,
            geo_confidence=geo_confidence,
        )

    def clearance_breadcrumb_level(self, payload: DefenseContextPayload) -> str:
        if not payload.is_clearance_breadcrumb_found:
            return 'none'
        if payload.highest_detected_level in {'TS_SCI_POLY', 'TS_SCI'} and payload.confidence_rating >= 0.72:
            return 'strong'
        if payload.highest_detected_level in {'TOP_SECRET', 'SECRET', 'TS_SCI'}:
            return 'medium'
        return 'weak'
