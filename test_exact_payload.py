import urllib.request
import json

req = urllib.request.Request('http://localhost:8082/api/v1/auth/login', 
    data=b'{"tenantId": "OPER_MSP", "username":"msp","password":"pwd"}', 
    headers={'Content-Type': 'application/json'},
    method='POST')
try:
    with urllib.request.urlopen(req) as f:
        res = json.loads(f.read().decode('utf-8'))
        token = res['accessToken']
        
        req2 = urllib.request.Request('http://localhost:8082/api/v1/codes/9999',
            data=b'{"groupId":"E2E_GRP_1776859893540","codeId":"E2E_CD_1776859893540","codeName":"Updated E2E Code","description":"Updated Description","sortOrder":10,"isActive":true}',
            headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
            method='PUT')
        
        try:
            with urllib.request.urlopen(req2) as f2:
                print("SUCCESS:", f2.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            print("ERROR", e.code, ":", e.read().decode('utf-8'))
            
except Exception as e:
    print("Failed", e)
