from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure backend logging module
import logging

logging.basicConfig(
    filename="Code/backend/app.log",
    encoding="utf-8",
    filemode="a",
    format="{asctime} - {levelname} - {message}",
    style="{",
    datefmt="%Y-%m-%d %H:%M",
)

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    pass

# Example of logging
try:
    x = 3/0
except Exception as e:
    logging.exception("Calculation error")


# Run the app
# if __name__ == "__main__":
    # app.run(debug=True)
