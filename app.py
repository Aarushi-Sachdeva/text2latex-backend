from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import openai
from dotenv import load_dotenv
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

limiter = Limiter(app)


# load env variables from .env file
load_dotenv()

# access env vairables
openai.api_key = os.getenv("OPENAI_API_KEY")


@app.route('/', methods=['POST'])
@limiter.limit("15 per minute")
def openai_api():

    # user prompt
    data = request.get_json()

    # input validation
    if not data or 'prompt' not in data or not data['prompt']:
        return jsonify(error="Missing Prompt."), 400
    elif type(data['prompt']) != str:
        return jsonify(error="Prompt must be a string"), 400
    elif len(data['prompt']) > 1000:
        return jsonify(error="Prompt must be less than 1000 characters"), 400

    CONTENT = ""
    PREFIX = ""
    prompt = ""
    if data["type"] == "latex":
        CONTENT = "answer each question with the correct latex code, and no other text"
        PREFIX = "turn the following into latex code: "
        prompt = PREFIX + data.get('prompt')
    elif data["type"] == "question":
        CONTENT = "answer the following question to the best of your abilities, explicity stating your assumptions"
        PREFIX = "answer the following question: "
        prompt = PREFIX + data.get('prompt')

    MODEL = "gpt-3.5-turbo"
    try:
        response = openai.ChatCompletion.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": CONTENT},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
        )

        # generated_text = response.json().get('generated_text')

        # Return the generated text as JSON response
        return {"response": response['choices'][0]['message']['content']}
    except Exception as e:
        return jsonify(error=f"{e}"), 500


if __name__ == "__main__":
    app.run()
