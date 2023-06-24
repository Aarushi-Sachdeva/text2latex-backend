from flask import Flask, request, jsonify
import openai
from dotenv import load_dotenv
import os

app = Flask(__name__)


# load env variables from .env file
load_dotenv()

# access env vairables
openai.api_key = os.getenv("OPENAI_API_KEY")

question = input("Write math text as if you were speaking it : ")
prefix = "Turn the following into latex: "
prompt = prefix + question


@app.route('/openai/api', methods=['POST'])
def openai_api():
    data = request.get_json()

    prompt = data.get('prompt')
    MODEL = "gpt-3.5-turbo"
    response = openai.ChatCompletion.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "you are"},
            {"role": "user", "content": prompt}
        ],
        temperature=0,
    )

    print(response["choices"][0]["message"]["content"])
