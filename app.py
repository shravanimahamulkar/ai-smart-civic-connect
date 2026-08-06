# Backend - Python for AI Smart Civic Connect
# Technology Stack: Python + Firebase

from flask import Flask, request, jsonify

app = Flask(__name__)

# AI Chatbot Logic (Rule-based)
def get_bot_response(user_msg):
    msg = user_msg.lower()
    if "road" in msg or "rasta" in msg:
        return "Road issue 3-4 days madhe solve kela jail. Krupaya complaint ID track kara."
    elif "water" in msg or "pani" in msg:
        return "Panyachi takrar nodavali. Jal Vibhagashi sampark sadhat aahot."
    elif "login" in msg:
        return "Login sathi User Login page var ja aani Email/Password taka."
    else:
        return "Namaskar! Mi AI Civic Agent aahe. Tumchi kashi madat karu shakto?"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_msg = data.get("message", "")
    reply = get_bot_response(user_msg)
    return jsonify({"reply": reply})

@app.route("/")
def home():
    return "AI Smart Civic - Python Backend Running Successfully!"

if __name__ == "__main__":
    app.run(debug=True)
