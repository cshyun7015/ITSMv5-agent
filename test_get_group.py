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
        
        req2 = urllib.request.Request('http://localhost:8082/api/v1/codes/group/TICKET_PRIORITY',
            headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token})
        
        try:
            with urllib.request.urlopen(req2) as f2:
                codes = json.loads(f2.read().decode('utf-8'))
                print("Code from group:", codes[0] if len(codes) > 0 else "Empty")
        except urllib.error.HTTPError as e:
            print("ERROR", e.code, ":", e.read().decode('utf-8'))
            
except Exception as e:
    print("Failed", e)
