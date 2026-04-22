import urllib.request
import json

req = urllib.request.Request('http://localhost:8082/api/v1/auth/login', 
    data=b'{"tenantId": "OPER_MSP", "username":"msp","password":"pwd"}', 
    headers={'Content-Type': 'application/json'},
    method='POST')
try:
    with urllib.request.urlopen(req) as f:
        print(f.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("ERROR", e.code, ":", e.read().decode('utf-8'))
