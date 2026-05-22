import re
from typing import Any

SKILL_HINTS = [
    'python', 'java', 'javascript', 'typescript', 'react', 'node', 'go', 'rust', 'c++',
    'kubernetes', 'docker', 'terraform', 'aws', 'azure', 'gcp', 'linux', 'postgresql',
    'redis', 'fastapi', 'django', 'spring boot', 'ci/cd', 'jenkins', 'gitlab', 'github',
    'devops', 'devsecops', 'security', 'rmf', 'fedramp', 'nist', 'stig', 'acas',
    'splunk', 'nessus', 'machine learning', 'pytorch', 'tensorflow', 'llm', 'airflow',
    'dbt', 'snowflake', 'databricks', 'sql', 'react native', 'graphql', 'api design'
]

CLEARANCE_TERMS = ['ts/sci', 'top secret', 'secret', 'public trust', 'ci poly', 'full scope poly', 'fsp', 'polygraph']


def extract_skills(text: str) -> list[str]:
    lower = text.lower()
    return sorted({skill for skill in SKILL_HINTS if skill in lower})


def extract_clearance_breadcrumbs(text: str) -> list[str]:
    lower = text.lower()
    return sorted({term for term in CLEARANCE_TERMS if term in lower})


def first_non_empty_line(text: str) -> str:
    for line in text.splitlines():
        clean = line.strip()
        if clean:
            return clean[:120]
    return 'Imported Profile'


def extract_public_url(text: str) -> str | None:
    match = re.search(r'https?://[^\s)>,]+', text)
    return match.group(0) if match else None


def extract_location_hint(text: str) -> str | None:
    patterns = [
        r'(?i)(washington,?\s*dc|district of columbia|arlington,?\s*va|alexandria,?\s*va|reston,?\s*va|chantilly,?\s*va|mclean,?\s*va|fort meade,?\s*md|annapolis junction,?\s*md)',
        r'(?i)(remote\s+us|remote|hybrid|onsite)'
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    return None


def import_text_to_record(text: str, source_name: str = 'manual_import', source_user_id: str | None = None) -> dict[str, Any]:
    clean_text = text.strip()
    if not clean_text:
        raise ValueError('Cannot import empty text')
    name = first_non_empty_line(clean_text)
    url = extract_public_url(clean_text)
    skills = extract_skills(clean_text)
    clearance = extract_clearance_breadcrumbs(clean_text)
    signals = []
    if clearance:
        signals.append({
            'signal_type': 'clearance_breadcrumb_unverified',
            'signal_value': ', '.join(clearance),
            'signal_source': source_name,
        })
    if skills:
        signals.append({
            'signal_type': 'skill_count',
            'signal_value': str(len(skills)),
            'signal_source': source_name,
        })
    stable_id = source_user_id or str(abs(hash(clean_text[:500])))
    return {
        'source_name': source_name,
        'source_user_id': stable_id,
        'full_name': name,
        'profile_url': url,
        'username_handle': None,
        'location': extract_location_hint(clean_text),
        'headline': clean_text[:240],
        'bio_summary': clean_text[:3000],
        'extracted_skills': skills,
        'signals': signals,
        'publications': [],
        'raw_payload': {
            'import_type': 'approved_text',
            'source_name': source_name,
            'text_excerpt': clean_text[:3000],
            'clearance_note': 'Any clearance language is an unverified breadcrumb only.',
        },
    }


def import_records_from_text_blocks(blocks: list[str], source_name: str = 'manual_import') -> list[dict[str, Any]]:
    records = []
    for index, block in enumerate(blocks, start=1):
        if block.strip():
            records.append(import_text_to_record(block, source_name=source_name, source_user_id=f'{source_name}_{index}'))
    return records
