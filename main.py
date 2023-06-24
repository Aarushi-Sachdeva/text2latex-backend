# from flask import Flask, request, jsonify


# app =Flask(__name__)
# @app.route('/')

import openai
from dotenv import load_dotenv
import os

# load env variables from .env file
load_dotenv()

# access env vairables
openai.api_key = os.getenv("OPENAI_API_KEY")

question = input("Please ask a question: ")
prefix = "Turn the following into latex: "
prompt = prefix + question

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
