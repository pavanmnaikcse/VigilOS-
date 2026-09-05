
import httpx
import os

url = "https://api.resend.com/emails"
headers = {
    "Authorization": f"Bearer {os.getenv('RESEND_API_KEY', 'YOUR_API_KEY')}",
    "Content-Type": "application/json"
}
payload = {
    "from": "VigilOS Alerts <onboarding@resend.dev>",
    "to": ["pavan.m.naik.cse@gmail.com"],
    "subject": "Test Alert from VigilOS",
    "html": "<p>This is a test to verify email delivery.</p>"
}

try:
    resp = httpx.post(url, headers=headers, json=payload, timeout=10.0)
    print("status:", resp.status_code, resp.text)
except Exception as e:
    print("error:", str(e))

