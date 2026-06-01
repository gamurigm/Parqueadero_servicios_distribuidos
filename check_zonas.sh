#!/bin/bash
curl -s http://localhost:8081/v3/api-docs | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    paths = list(d.get('paths', {}).keys())
    print('Zonas API paths:')
    for p in paths[:20]:
        print(' ', p)
except Exception as e:
    print('Error:', e)
    sys.stdin = open('/dev/stdin')
"
