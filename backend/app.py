from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# ======================
# 💰 RATES
# ======================
rates = [
    {"currency": "US DOLLAR", "buy": 128.50, "sell": 130.00},
    {"currency": "EURO", "buy": 148.00, "sell": 150.00},
    {"currency": "CANADIAN $", "buy": 91.00, "sell": 96.00},
    {"currency": "STERLING POUND", "buy": 170.00, "sell": 175.00},
    {"currency": "DIRHAM", "buy": 32.00, "sell": 37.00},
    {"currency": "AUSTRALIAN $", "buy": 85.00, "sell": 90.00},
    {"currency": "UGANDA SH", "buy": 19.00, "sell": 25.00},
    {"currency": "TANZANIA SH", "buy": 4.00, "sell": 6.00},
    {"currency": "SWISS FRANCS", "buy": 163.00, "sell": 168.00},
    {"currency": "S.A RAND", "buy": 5.00, "sell": 10.00},
    {"currency": "S.ARABIAN RIYAL", "buy": 31.50, "sell": 35.50},
    {"currency": "INDIAN RUPEE", "buy": 1.00, "sell": 2.50},
    {"currency": "CHINESE YUAN", "buy": 16.00, "sell": 18.00},
    {"currency": "QATAR RIYAL", "buy": 32.50, "sell": 37.50},
]

# ======================
# GET RATES
# ======================
@app.route("/rates", methods=["GET"])
def get_rates():
    return jsonify(rates)

# ======================
# UPDATE RATES
# ======================
@app.route("/rates", methods=["POST"])
def update_rates():
    global rates
    data = request.get_json() or []   # ✅ FIXED SAFETY HERE

    if isinstance(data, list):
        rates = data
        return jsonify({"message": "Rates updated successfully"})

    return jsonify({"error": "Invalid data format"}), 400

# ======================
# CONTACT EMAIL
# ======================
@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json() or {}   # ✅ FIXED HERE

    name = data.get("name", "")
    email = data.get("email", "")
    message = data.get("message", "")

    try:
        sender_email = os.getenv("EMAIL_USER")
        password = os.getenv("EMAIL_PASS")

        if not sender_email or not password:
            return jsonify({"error": "Email config missing"}), 500

        # MAIN EMAIL
        msg = MIMEText(f"""
New message from website

Name: {name}
Email: {email}

Message:
{message}
""")

        msg["Subject"] = "New Contact Message"
        msg["From"] = sender_email
        msg["To"] = sender_email

        # AUTO REPLY
        reply = MIMEText(f"""
Hello {name},

Thank you for contacting Harar Forex Bureau.
We will get back to you soon.

Regards,
Harar Forex Team
""")

        reply["Subject"] = "We received your message"
        reply["From"] = sender_email
        reply["To"] = email

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, password)

        server.send_message(msg)
        server.send_message(reply)

        server.quit()

        return jsonify({"message": "Email sent successfully ✅"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================
# HOME
# ======================
@app.route("/")
def home():
    return "Harar Backend Running ✅"

# ======================
# FAVICON FIX
# ======================
@app.route("/favicon.ico")
def favicon():
    return "", 204

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)