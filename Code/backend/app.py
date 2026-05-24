# Variables to change
frontend_port = "5500"
frontend_localhost_url = "http://127.0.0.1"

# Import external libraries
import os, socket
import sqlite3, jwt, bleach, logging
import datetime as dt
from datetime import date, datetime
from flask import Flask, request, jsonify, redirect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# Configure backend logging module
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
app.config['SECRET_KEY'] = 'fd63bbe7b774ea0718361c795c218ccb0a55c9fbb972be4f2c5b0918ba0fe1c122e2d68f04eb1a61152c1f9c9b81cf9e243d0ddb5013c2b8fb87cef3729dc08f'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'database', 'database.db')

# Configure rate limiting
limiter = Limiter(
    key_func=get_remote_address,  # Use built-in utility function
    app=app
)

# Configure trusted domains
frontend_network_url = "http://" + socket.gethostbyname(socket.gethostname()) + ":" + frontend_port

CORS(app, origins=[f"{frontend_localhost_url}:{frontend_port}", frontend_network_url])

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

def authorise(req, needed_access):
    '''
    Checks if a client is authorised to make a request

    Args:
        req (obj): The client's request
        needed_access (int): The needed access level for the route
            - Admin = 1
            - User = 2

    Returns:
        dict: JSON response with an error code, or a True boolean if it is authorised
    '''
    auth_header = req.headers.get('Authorization')
    
    if auth_header == None:
        return jsonify({'error': 'You need to sign in to perform this action.'}), 401

    token = auth_header.split(" ")[1]

    try:
        # Check if the JWT token is valid
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded['user_id']
        access_level = execute_query("SELECT role_id FROM users WHERE user_id = ?", (user_id,)).fetchall()[0][0]
        
        # Check if the user has the required access level
        if access_level == needed_access:
            return True
        
        # If the user doesn't have the required access level
        return jsonify({'error': 'You are not allowed to perform this action.'}), 401
    except jwt.ExpiredSignatureError:
        logging.warning("A user has an expired token")
        return jsonify({'error': 'Your session has expired. Please sign in again.'}), 401
    except jwt.InvalidTokenError:
        logging.warning("A user has tried to access a resource with an invalid token")
        return jsonify({'error': 'Your session is invalid. Please sign in again.'}), 401


# Default route
@app.route('/')
def index():
    # If the user happens to access the hosted URL manually
    # in their browser, redirect them to the frontend
    logging.warning("Someone has tried to manually access the API")
    return redirect(frontend_network_url)

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
        user_id = execute_query("SELECT user_id FROM users WHERE email = ?", (email,)).fetchall()[0][0]

        # Send JWT
        logging.info(f"Successfully created an account for - {email}")
        token = jwt.encode({'user_id': user_id, 'exp': dt.datetime.now(dt.UTC) + dt.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token}), 201
    else:
        logging.info("An account could not be created because it already exists")
        return jsonify({"error": "The account already exists. Try signing in."}), 409
        

@app.route('/login', methods=["POST"])
def login():
    data = request.get_json()
    email = sanitise(data.get('email'))
    password = sanitise(data.get('password'))

    # Check if the account exists in the database
    existing_account = execute_query("SELECT * FROM users WHERE email = ?", (email,)).fetchall()

    if len(existing_account) == 1 and check_password_hash(existing_account[0][2], password):
        user_id = execute_query("SELECT user_id FROM users WHERE email = ?", (email,)).fetchall()[0][0]
        access_level = execute_query("SELECT role_id FROM users WHERE user_id = ?", (user_id,)).fetchall()[0][0]

        logging.info(f"Successful login for - {email}")
        token = jwt.encode({'user_id': user_id, 'exp': dt.datetime.now(dt.UTC) + dt.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({"token": token, "level": access_level}), 200
    
    logging.warning(f"Login not permitted. Invalid credentials for - {email}")
    return jsonify({"error": "The credentials are invalid. Please try again."}), 401

@app.route('/get_events', methods=["GET"])
def get_events():
    # Check if the request has the correct authorisation level
    auth = authorise(request, 1)
    
    # If the user is authorised
    if auth is True:
        # Get all events and their data
        events = []
        events_query = execute_query("SELECT event_name, event_date, event_location FROM events").fetchall()

        for event in events_query:
            today = date.today() # Get today's date as yyyy-mm-dd

            event_name = event[0]
            event_date = event[1]
            date_object = datetime.strptime(event_date, "%Y-%m-%d").date()
            event_location = event[2]

            # Give them a past attribute if it is needed
            past = "past" if date_object < today else ""

            events.append({
                "name": event_name,
                "date": event_date,
                "location": event_location,
                "past": past
            })

        return jsonify(events), 200
    
    return auth

@app.route('/create_event', methods=["POST"])
def create_event():
    # Check if the request has the correct authorisation level
    auth = authorise(request, 1)
    
    # If the user is authorised
    if auth is True:
        data = request.get_json();
        name = sanitise(data.get('name'))
        date = sanitise(data.get('date'))
        location = sanitise(data.get('location'))

        try:
            execute_query("INSERT INTO events (event_name, event_date, event_location) VALUES (?, ?, ?)", (name, date, location))
            event_id = execute_query("SELECT event_id FROM events WHERE event_name = ? AND event_date = ? AND event_location = ?", (name, date, location)).fetchall()[0][0]
            
            return jsonify({"event_id": event_id}), 201
        except Exception as e:
            return jsonify({"error": "Event could not be created"}), 500
    
    return auth

# TEMP: Example of a protected route
@app.route('/test_route', methods=["POST"])
def test():
    auth = authorise(request, 1)
    data = request.get_json()
    
    if auth == True:
        print(request.get_json())
        return jsonify({"message": "Successful resource accessed"}), 200
    
    return auth


# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")
    logging.info("App started successfully")
    