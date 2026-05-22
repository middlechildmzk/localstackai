import json
import sys
import urllib.request
from pathlib import Path

API_URL = 'http://localhost:8000/tasks/sync/batch'
DEFAULT_PATH = Path('examples/seed_public_records.json')


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PATH
    payload = path.read_text(encoding='utf-8')
    req = urllib.request.Request(
        API_URL,
        data=payload.encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        print(resp.read().decode('utf-8'))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
