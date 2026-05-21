import asyncio
import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import aiohttp
from pydantic import BaseModel, Field, HttpUrl
from redis.asyncio import Redis

from .config import settings

logger = logging.getLogger('SourcingEngine')


class NormalizedProfile(BaseModel):
    source_name: str
    source_user_id: str
    full_name: str
    location: Optional[str] = None
    profile_url: Optional[HttpUrl] = None
    username_handle: Optional[str] = None
    bio_summary: Optional[str] = None
    extracted_skills: List[str] = Field(default_factory=list)
    raw_payload: Dict[str, Any] = Field(default_factory=dict)

    @property
    def payload_hash(self) -> str:
        payload = json.dumps(self.raw_payload, sort_keys=True, default=str).encode('utf-8')
        return hashlib.sha256(payload).hexdigest()


class RedisRateLimiter:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    async def is_allowed(self, rate_key: str, max_limit: int, time_window_secs: int) -> bool:
        current_timestamp = datetime.now(timezone.utc).timestamp()
        cutoff_timestamp = current_timestamp - time_window_secs
        member = f'{current_timestamp}:{id(self)}'

        async with self.redis.pipeline(transaction=True) as pipe:
            pipe.zremrangebyscore(rate_key, 0, cutoff_timestamp)
            pipe.zadd(rate_key, {member: current_timestamp})
            pipe.zcard(rate_key)
            pipe.expire(rate_key, time_window_secs)
            results = await pipe.execute()

        total_hits = int(results[2])
        allowed = total_hits <= max_limit
        if not allowed:
            logger.warning('Rate limit denied for %s: %s/%s in %ss', rate_key, total_hits, max_limit, time_window_secs)
        return allowed


class LocalInferenceEnricher:
    def __init__(self, ollama_endpoint: str = settings.ollama_endpoint):
        self.endpoint = f'{ollama_endpoint.rstrip("/")}/api/generate'

    async def extract_skills_from_text(self, text_content: str) -> List[str]:
        if not text_content:
            return []

        prompt = (
            'Extract all technical programming skills, frameworks, platforms, and databases mentioned in the following text. '
            'Return strictly as a flat valid JSON array of lowercase strings. No markdown. '
            f'Text: "{text_content[:4000]}"'
        )
        payload = {'model': 'llama3', 'prompt': prompt, 'stream': False, 'format': 'json'}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.endpoint, json=payload, timeout=15) as resp:
                    if resp.status != 200:
                        logger.warning('Ollama enrichment returned HTTP %s', resp.status)
                        return []
                    response_data = await resp.json()
                    raw_output = response_data.get('response', '[]')
                    parsed = json.loads(raw_output)
                    if isinstance(parsed, dict):
                        parsed = parsed.get('skills', [])
                    if not isinstance(parsed, list):
                        return []
                    return sorted({str(item).strip().lower() for item in parsed if str(item).strip()})
        except Exception as err:
            logger.error('Failed to infer skills via local enrichment layer: %s', err)
            return []


class HeuristicSkillExtractor:
    SKILL_TERMS = {
        'python','java','javascript','typescript','react','node','fastapi','sqlalchemy','postgresql','postgres',
        'redis','celery','opensearch','elasticsearch','docker','kubernetes','terraform','aws','azure','gcp',
        'machine learning','llm','pytorch','tensorflow','hugging face','linux','devsecops','rmf','nist','fedramp',
        'github','gitlab','ci/cd','jenkins','gitlab ci','security+', 'cissp', 'nessus', 'acas', 'stig'
    }

    @classmethod
    def extract(cls, text: str) -> List[str]:
        lowered = text.lower()
        return sorted({term for term in cls.SKILL_TERMS if term in lowered})


class GitHubSourceNormalizer:
    @staticmethod
    async def process_transform(raw_payload: Dict[str, Any], enricher: LocalInferenceEnricher) -> NormalizedProfile:
        bio = raw_payload.get('bio') or ''
        inferred_tags = await enricher.extract_skills_from_text(bio)
        heuristic_tags = HeuristicSkillExtractor.extract(bio)
        explicit_languages = [str(lang).lower() for lang in (raw_payload.get('languages') or {}).keys()]
        combined_skills = sorted(set(inferred_tags + heuristic_tags + explicit_languages))

        return NormalizedProfile(
            source_name='github',
            source_user_id=str(raw_payload.get('id') or raw_payload.get('login') or ''),
            full_name=raw_payload.get('name') or raw_payload.get('login') or 'Anonymous User',
            location=raw_payload.get('location'),
            profile_url=raw_payload.get('html_url'),
            username_handle=raw_payload.get('login'),
            bio_summary=bio,
            extracted_skills=combined_skills,
            raw_payload=raw_payload,
        )


async def normalize_public_profile(raw_payload: Dict[str, Any], source_name: str = 'github') -> NormalizedProfile:
    enricher = LocalInferenceEnricher()
    if source_name == 'github':
        return await GitHubSourceNormalizer.process_transform(raw_payload, enricher)
    raise ValueError(f'Unsupported source normalizer: {source_name}')
