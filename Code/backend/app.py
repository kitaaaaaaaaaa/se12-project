# Variables to change
frontend_url = "http://127.0.0.1:5500"

# Import external libraries
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import sqlite3

# Configure backend logging module
import logging

logging.basicConfig(
    filename="./app.log",
    encoding="utf-8",
    filemode="a",
    format="{asctime} - {levelname} - {message}",
    style="{",
    datefmt="%Y-%m-%d %H:%M",
)

# Initialise the Flask app and the database
app = Flask(__name__)
DATABASE = "database/database.db"

# Configure trusted domains
CORS(app, origins=[frontend_url])

# Define functions
def execute_query(query, params=()):
    '''
    Executes a SQL query on the database.

    Args:
        query (str): SQL query to execute
        params (tuple, optional): Define parameters in the SQL query

    Returns:
        obj: The database cursor. Can use .fetchall() to get all rows.
    '''
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        return cursor

# Default route
@app.route('/')
def index():
    # If the user happens to access the hosted URL manually
    # in their browser, redirect them to the frontend
    return redirect(frontend_url)

@app.route('/create_account', methods=['POST'])
def create_account():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    print(data)
    return data, 200

# Example of logging
# try:
#     x = 3/0
# except Exception as e:
#     logging.exception("Calculation error")


# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
