import json
import urllib.request
from django.conf import settings

def send_brevo_email(to_email, to_name, subject, html_content):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": getattr(settings, "BREVO_API_KEY", ""),
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "name": "TransitOps Auth",
            "email": "no-reply@transitops.com"
        },
        "to": [
            {
                "email": to_email,
                "name": to_name
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }
    
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            print("Brevo API response:", res_body)
            return True
    except Exception as e:
        print("Failed to send email via Brevo API:", str(e))
        return False
