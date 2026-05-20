# Variables to change
frontend_url = "http://127.0.0.1:5500"

# Import external libraries
import os
from flask import Flask, request, jsonify, redirect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import bleach


# Configure backend logging module
import logging

# logging.basicConfig(
#     filename="./app.log",
#     encoding="utf-8",
#     filemode="a",
#     format="{asctime} - {levelname} - {message}",
#     style="{",
#     datefmt="%Y-%m-%d %H:%M",
# )

# Initialise the Flask app and the database
app = Flask(__name__)
app.config['SECRET_KEY'] = 'Uwtf9yKv6UDG9NAnntcVv2Ez'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'database', 'database.db')

# Configure rate limiting
limiter = Limiter(
    key_func=get_remote_address,  # Use built-in utility function
    app=app
)

# Configure trusted domains
CORS(app, origins=[frontend_url])

# Handle input sanitisation
allowed_tags = ['b', 'i', 'u', 'p', 'br']
allowed_attributes = {}

def sanitise(text):
    '''
    Sanitises text and HTML using encoding methods.

    Args:
        text(str): Text to sanitise
    
    Returns:
        str: The encoded/sanitised text
    '''
    try:
        clean = bleach.clean(text, tags=allowed_tags, attributes=allowed_attributes)
    except Exception as e:
        clean = ""

    return clean

# Handle interactions with the database
def execute_query(query, params=()):
    '''
    Executes a SQL query on the database.

    Args:
        query (str): SQL query to execute
        params (tuple, optional): Define parameters in the SQL query

    Returns:
        obj: The database cursor. Can use .fetchall() to get all rows - array of tuples (2D).
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
    # Get and sanitise user inputs
    data = request.get_json()
    email = sanitise(data.get('email'))
    password = sanitise(data.get('password'))
    role = sanitise(data.get('role'))
    role_id = 1 if role == "admin" else 2

    # Hash the password
    password_hash = generate_password_hash(password)

    # Check that the account does not already exist
    existing_account = execute_query("SELECT * FROM Users WHERE email = ?", (email,)).fetchall()

    if len(existing_account) == 0:
        # Create account in the database
        execute_query("INSERT INTO users (email, role_id, password_hash) VALUES (?, ?, ?)", (email, role_id, password_hash))

        # Send JWT

        # Return a successful response
        return jsonify({"message": "Account created"}), 201
    else:
        return jsonify({"error": "The account already exists. Try signing in."}), 409
        

@app.route('/login', methods=["POST"])
def login():
    data = request.get_json()
    email = sanitise(data.get('email'))
    password = sanitise(data.get('password'))

    # Check if the account exists in the database
    existing_account = execute_query("SELECT * FROM users WHERE email = ?", (email,)).fetchall()

    if len(existing_account) == 1 and check_password_hash(existing_account[0][2], password):
        user_id = existing_account[0][0]

        token = jwt.encode({'user_id': user_id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token}), 200
    
    return jsonify({"error": "The credentials are invalid. Please try again."}), 401


# login route:
# verify creds
# send JWT


# Example of logging
# try:
#     x = 3/0
# except Exception as e:
#     logging.exception("Calculation error")


# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
