from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class SourceDescriptor:
    id: str
    label: str
    kind: str
    candidate_lead: bool
    evidence_signal: bool
    auth_required: bool
    build_priority: str
    base_url: str

    def to_dict(self) -> dict:
        return asdict(self)


SOURCE_REGISTRY = [
    SourceDescriptor('github', 'GitHub', 'developer_identity', True, True, False, 'now', 'https://api.github.com'),
    SourceDescriptor('gitlab', 'GitLab', 'developer_identity', True, True, False, 'now', 'https://gitlab.com/api/v4'),
    SourceDescriptor('codeforces', 'Codeforces', 'competitive_programming', True, True, False, 'now', 'https://codeforces.com/api'),
    SourceDescriptor('exercism', 'Exercism', 'competitive_programming', True, True, False, 'now', 'https://exercism.org/api/v2'),
    SourceDescriptor('devto', 'DEV.to', 'community', True, True, True, 'now', 'https://dev.to/api'),
    SourceDescriptor('hashnode', 'Hashnode', 'community', True, True, False, 'now', 'https://gql.hashnode.com'),
    SourceDescriptor('hackernews', 'Hacker News', 'community', True, True, False, 'now', 'https://hn.algolia.com/api/v1'),
    SourceDescriptor('npm', 'npm', 'package', True, True, False, 'now', 'https://registry.npmjs.org'),
    SourceDescriptor('pypi', 'PyPI', 'package', True, True, False, 'now', 'https://pypi.org'),
    SourceDescriptor('crates', 'crates.io', 'package', True, True, False, 'next', 'https://crates.io/api/v1'),
    SourceDescriptor('orcid', 'ORCID', 'research', True, True, False, 'next', 'https://pub.orcid.org/v3.0'),
    SourceDescriptor('openalex', 'OpenAlex', 'research', True, True, False, 'next', 'https://api.openalex.org'),
    SourceDescriptor('semanticscholar', 'Semantic Scholar', 'research', True, True, False, 'next', 'https://api.semanticscholar.org/graph/v1'),
    SourceDescriptor('arxiv', 'arXiv', 'research', True, True, False, 'next', 'https://export.arxiv.org/api/query'),
    SourceDescriptor('pubmed', 'PubMed', 'research', True, True, False, 'next', 'https://eutils.ncbi.nlm.nih.gov'),
]


def registry_as_dicts() -> list[dict]:
    return [source.to_dict() for source in SOURCE_REGISTRY]
