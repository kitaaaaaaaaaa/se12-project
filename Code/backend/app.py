# Import external libraries
import os, socket
from datetime import date, datetime
import datetime as dt
import sqlite3, jwt, bleach, logging
from flask import Flask, request, jsonify, redirect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from flask_caching import Cache
from werkzeug.security import generate_password_hash, check_password_hash
# from . import config
import json

# Declare the base directory for later use
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configure front end url
CONFIG = os.path.join(BASE_DIR, 'config.json')
with open(CONFIG, "r") as file:
    data = json.load(file)

frontend_localhost_url = data['frontend_url']
frontend_port = data['frontend_port']

# Configure backend logging module
LOG = os.path.join(BASE_DIR, 'app.log')
logging.basicConfig(
    filename=LOG,
    encoding='utf-8',
    filemode='a',
    format='{asctime} - {levelname} - {message}',
    style='{',
    datefmt='%Y-%m-%d %H:%M',
)

# Initialise the Flask app and the database
app = Flask(__name__)
app.config['SECRET_KEY'] = 'fd63bbe7b774ea0718361c795c218ccb0a55c9fbb972be4f2c5b0918ba0fe1c122e2d68f04eb1a61152c1f9c9b81cf9e243d0ddb5013c2b8fb87cef3729dc08f'
DATABASE = os.path.join(BASE_DIR, 'database', 'database.db')

# Configure rate limiting
limiter = Limiter(
    key_func=get_remote_address,  # Use built-in utility function
    app=app
)

# Configure trusted domains

# Automatically get the local address for the frontend 
# which is accessible for other devices on the network (i.e. not http://localhost)
# This is a redundancy in case the user has configured the app wrong
frontend_network_url = 'http://' + socket.gethostbyname(socket.gethostname()) + ':' + frontend_port

CORS(app, origins=[f'{frontend_localhost_url}:{frontend_port}', frontend_network_url])

# Configure caching
app.config['CACHE_TYPE'] = "SimpleCache"
app.config['CACHE_DEFAULT_TIMEOUT'] = 3600
cache = Cache(app)

# Declare some variables to be used throughout the backend
blackout_instruction = {
    "job": "lighting",
    "command": "CUE",
    "detail": "blackout end of scene"
}

video_instruction = {
    "job": "visuals",
    "command": "CUE",
    "detail": "video"
}

curtains_instruction = {
    "job": "stage_hands",
    "command": "OPEN",
    "detail": "curtains"
}

empty_event = [{'attributes': {'step_id': 'undefined', 'step_title': '', 'step_performer': '', 'step_number': '01', 'curtains': '', 'video': '', 'blackout': ''}, 'instructions': [{'job': 'stage_hands', 'command': 'HANDOFF', 'detail': ''}]}]

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
        clean = ''

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
    
    if auth_header is None:
        return jsonify({'error': 'You need to sign in to perform this action.'}), 401

    token = auth_header.split(' ')[1]

    try:
        # Check if the JWT token is valid
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded['user_id']
        access_level = execute_query('SELECT role_id FROM users WHERE user_id = ?', (user_id,)).fetchall()[0][0]
        
        # Check if the user has the required access level
        if access_level == needed_access:
            return True
        
        # If the user doesn't have the required access level
        return jsonify({'error': 'You are not allowed to perform this action.'}), 403
    except jwt.ExpiredSignatureError:
        logging.warning('A user has an expired token')
        return jsonify({'error': 'Your session has expired. You will be redirected to the sign in page.'}), 401
    except jwt.InvalidTokenError:
        logging.warning('A user has tried to access a resource with an invalid token')
        return jsonify({'error': 'Your session is invalid. You will be redirected to the sign in page.'}), 401

def get_event_from_database(event_id, classes):
    '''
    Retrieves all the steps and instructions from the database, given an event_id

    Args: 
        event_id (int): The id number of the event in the database
        classes (str): The classes that should be applied to each step
            - Apply class "admin" for event administrators
            - Apply class "" for users

    Returns:
        dict: JSON with the event data

    '''
    # Initialise an array with all the steps in it
    event_data = []

    # Execute query to get necessary data
    steps_query = execute_query("""
        SELECT step_id, step_title, step_performer, step_num
        FROM steps
        WHERE event_id = ?
        ORDER BY step_num ASC
    """, (event_id,)).fetchall()

    # Loop through every step
    for step in steps_query:
        s_id = step[0]
        s_title = step[1]
        s_performer = step[2]
        s_num = step[3]

        # Get the instructions for each step
        instructions_query = execute_query("""
            SELECT instructions.instruction_num, jobs.job_name, instructions.instruction_detail
            FROM instructions, jobs
            WHERE instructions.job_id = jobs.job_id AND instructions.step_id = ?
            ORDER BY instructions.instruction_num ASC
        """, (s_id,)).fetchall()
        
        instructions_data = []
        for instruction in instructions_query:
            i_job = instruction[1]
            i_text = instruction[2]

            try:
                i_command = i_text.split(maxsplit=1)[0]
                i_detail = i_text.split(maxsplit=1)[1]
            except IndexError:
                logging.error("Index error occurred when processing instruction. Possible empty instruction.")
                i_command = ""
                i_detail = ""

            instructions_data.append({
                "job": i_job,
                "command": i_command,
                "detail": i_detail
            })

        event_data.append({
            "attributes": {
                "step_title": s_title,
                "step_performer": s_performer,
                "step_number": s_num, 
                "classes": classes
            },
            "instructions" : instructions_data
        })

    return event_data


# -------------------------------------------------------------------
# Default route
@app.route('/')
def index():
    # If the user happens to access the hosted URL manually
    # in their browser, redirect them to the frontend
    logging.warning('Someone has tried to manually access the API')
    return redirect(frontend_network_url)

@app.route('/create_account', methods=['POST'])
@limiter.limit("5 per minute")
def create_account():
    # Get and sanitise user inputs
    data = request.get_json()
    email = sanitise(data.get('email'))
    password = sanitise(data.get('password'))
    role = sanitise(data.get('role'))
    role_id = 1 if role == 'admin' else 2

    # Hash the password
    password_hash = generate_password_hash(password)

    # Check that the account does not already exist
    existing_account = execute_query('SELECT * FROM Users WHERE email = ?', (email,)).fetchall()

    if len(existing_account) == 0:
        # Create account in the database
        execute_query('INSERT INTO users (email, role_id, password_hash) VALUES (?, ?, ?)', (email, role_id, password_hash))
        user_id = execute_query('SELECT user_id FROM users WHERE email = ?', (email,)).fetchall()[0][0]

        # Send JWT
        logging.info(f'Successfully created an account for - {email}')
        token = jwt.encode({'user_id': user_id, 'exp': dt.datetime.now(dt.UTC) + dt.timedelta(hours=2)}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token, 'level': role_id}), 201
    else:
        logging.info('An account could not be created because it already exists')
        return jsonify({'error': 'The account already exists. Try signing in.'}), 409
        

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    email = sanitise(data.get('email'))
    password = sanitise(data.get('password'))
    print(email)

    # Check if the account exists in the database
    existing_account = execute_query('SELECT * FROM users WHERE email = ?', (email,)).fetchall()

    if len(existing_account) == 1 and check_password_hash(existing_account[0][2], password):
        user_id = execute_query('SELECT user_id FROM users WHERE email = ?', (email,)).fetchall()[0][0]
        access_level = execute_query('SELECT role_id FROM users WHERE user_id = ?', (user_id,)).fetchall()[0][0]

        logging.info(f'Successful login for - {email}')
        token = jwt.encode({'user_id': user_id, 'exp': dt.datetime.now(dt.UTC) + dt.timedelta(hours=2)}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token, 'level': access_level}), 200
    
    logging.warning(f'Login not permitted. Invalid credentials for - {email}')
    return jsonify({'error': 'The credentials are invalid. Please try again.'}), 401

@app.route('/get_events', methods=['GET'])
@limiter.limit("12 per minute")
def get_events():
    # Check if the request has the correct authorisation level
    auth = authorise(request, 1)
    
    # If the user is authorised
    if auth is True:
        # Get all events and their data
        events = []
        events_query = execute_query('SELECT event_name, event_date, event_location FROM events').fetchall()

        for event in events_query:
            today = date.today() # Get today's date as yyyy-mm-dd

            event_name = event[0]
            event_date = event[1]
            date_object = datetime.strptime(event_date, '%Y-%m-%d').date()
            event_location = event[2]
            event_id = execute_query('SELECT event_id FROM events WHERE event_name = ? AND event_date = ? AND event_location = ?', (event_name, event_date, event_location)).fetchall()[0][0]

            # Give them a past attribute if it is needed
            past = 'past' if date_object < today else ''

            events.append({
                'event_id': event_id,
                'event_name': event_name,
                'event_date': event_date,
                'event_location': event_location,
                'past': past
            })

        # Sort the events from most recent to least recent
        # This function was made using the help of a StackOverflow article
        sorted_events = sorted(events, key=lambda x: datetime.strptime(x['event_date'], '%Y-%m-%d'), reverse=True)

        logging.info('Admin user has retrieved all events for homepage')
        return jsonify(sorted_events), 200
    
    logging.warning('Unauthorised user has attempted to retrieve all events')
    return auth

@app.route('/create_event', methods=['POST'])
@limiter.limit("5 per minute")
def create_event():
    # Check if the request has the correct authorisation level
    auth = authorise(request, 1)
    
    # If the user is authorised
    if auth is True:
        data = request.get_json();
        name = sanitise(data.get('name'))
        date = sanitise(data.get('date'))
        location = sanitise(data.get('location'))

        # Check if the date is valid before entering into the database
        # Invalid dates will throw errors later on.
        if str(date) > "9999-12-31":
            return jsonify({'error', 'Event could not be created because the date is too far in the future'}), 500

        try:
            # Create a new event record
            execute_query('INSERT INTO events (event_name, event_date, event_location) VALUES (?, ?, ?)', (name, date, location))
            # Retrieve the event id
            event_id = execute_query('SELECT event_id FROM events WHERE event_name = ? AND event_date = ? AND event_location = ?', (name, date, location)).fetchall()[0][0]
            
            return jsonify({'event_id': event_id}), 201
        except Exception as e:
            logging.error('Event creation failed')
            logging.debug(e)
            return jsonify({'error': 'Event could not be created'}), 500
    
    logging.warning("Unauthorised user attempted to create an event")
    return auth

@app.route('/delete_event', methods=['DELETE'])
def delete_event():
    auth = authorise(request, 1)
    event_id = str(request.get_json())

    if auth is True:
        try:
            execute_query("DELETE FROM events WHERE event_id = ?", (event_id,))
            logging.info("Event deleted successfully")
            return jsonify({'message': 'Event deleted successfully'}), 200
        except Exception as e:
            logging.error("Event deletion failed")
            logging.debug(e)
            return jsonify({'error': 'The event could not be deleted. Please try again.'}), 500

    logging.warning("Unauthorised user attempted to delete an event")
    return auth

@app.route('/get_edit_event_data/<int:event_id>', methods=['GET'])
@limiter.limit("12 per minute")
def get_edit_event_data(event_id):
    auth = authorise(request, 1)

    if auth is True:
        # Initialise an array with all the steps in it
        event_data = []

        # Execute query to get necessary data
        steps_query = execute_query("""
            SELECT step_id, step_title, step_performer, step_num
            FROM steps
            WHERE event_id = ?
            ORDER BY step_num ASC
        """, (event_id,)).fetchall()

        # Loop through every step
        for step in steps_query:
            s_id = step[0]
            s_title = step[1]
            s_performer = step[2]
            s_num = step[3]

            # Get the instructions for each step
            instructions_query = execute_query("""
                SELECT instructions.instruction_num, jobs.job_name, instructions.instruction_detail
                FROM instructions, jobs
                WHERE instructions.job_id = jobs.job_id AND instructions.step_id = ?
                ORDER BY instructions.instruction_num ASC
            """, (s_id,)).fetchall()
            
            instructions_data = []
            for instruction in instructions_query:
                i_num = instruction[0]
                i_job = instruction[1]
                i_text = instruction[2]

                try:
                    i_command = i_text.split(maxsplit=1)[0]
                    i_detail = i_text.split(maxsplit=1)[1]
                except IndexError:
                    logging.error("Index error occurred when processing instruction in get_edit_event_data. Possible empty instruction.")
                    i_command = ""
                    i_detail = ""

                instructions_data.append({
                    "job": i_job,
                    "command": i_command,
                    "detail": i_detail
                })

            # Logic to toggle the pills if the curtains, video, blackout
            # commands are present
            s_curtains = ""
            s_video = ""
            s_blackout = ""

            if curtains_instruction in instructions_data:
                s_curtains = "active"
            
            if video_instruction in instructions_data:
                s_video = "active"

            if blackout_instruction in instructions_data:
                s_blackout = "active"

            event_data.append({
                "attributes": {
                    "step_id": s_id,
                    "step_title": s_title,
                    "step_performer": s_performer,
                    "step_number": s_num, 
                    "curtains": s_curtains,
                    "video": s_video,
                    "blackout": s_blackout
                },
                "instructions" : instructions_data
            })

        logging.info("Get event data for editing page successful")
        return jsonify(event_data), 200
    
    logging.warning("Unauthorised user attempted to get event data for editing")
    return auth


@app.route("/save_edit_event_data/<int:event_id>", methods=["PUT"])
@limiter.limit("12 per minute")
def save_edit_event_data(event_id):
    auth = authorise(request, 1)
    data = request.get_json()
    
    if auth is True:
        # If it is an empty event, don't save it to the database
        if data == empty_event:
            logging.info("Event saved successfully. No event data was given, so nothing was saved.")
            return jsonify({"message": "Event saved successfully"}), 200
        
        # Keep track of all the step ids in the request
        r_all_step_ids = []

        for step in data:
            attributes = step.get("attributes")
            instructions = step.get("instructions")
            
            s_id = sanitise(attributes.get("step_id"))
            s_title = sanitise(attributes.get("step_title"))
            s_performer = sanitise(attributes.get("step_performer"))
            s_number = sanitise(attributes.get("step_number"))
            s_curtains = sanitise(attributes.get("curtains"))
            s_video = sanitise(attributes.get("video"))
            s_blackout = sanitise(attributes.get("blackout"))

            # If the curtains, video, blackout attributes are active, add commands for them
            if s_curtains == "active" and curtains_instruction not in instructions:
                instructions.append(curtains_instruction)
            if s_video == "active" and video_instruction not in instructions:
                instructions.append(video_instruction)
            if s_blackout == "active" and blackout_instruction not in instructions:
                instructions.append(blackout_instruction)
            
            if s_curtains == "" and curtains_instruction in instructions:
                instructions.remove(curtains_instruction)
            if s_video == "" and video_instruction in instructions:
                instructions.remove(video_instruction)
            if s_blackout == ""and blackout_instruction in instructions:
                instructions.remove(blackout_instruction)

            # Delete all instructions associated with the step
            execute_query("""
                DELETE FROM instructions WHERE step_id = ?
            """, (s_id,))

            if s_id is None or s_id == "undefined":
                # If the step does not exist, insert a new record into the database
                execute_query("""
                    INSERT INTO steps (event_id, step_num, step_title, step_performer) 
                    VALUES (?, ?, ?, ?)
                """, (event_id, s_number, s_title, s_performer))
                
                # Set s_id variable to new s_id
                s_id = execute_query("""
                    SELECT step_id
                    FROM steps
                    WHERE event_id = ? AND step_num = ? AND step_title = ? AND step_performer = ?
                """, (event_id, s_number, s_title, s_performer)).fetchall()[0][0]
                s_id = int(s_id)
            else:
                # If a step_id is provided
                # Insert a new record for each step with the given step_id
                execute_query("""
                    INSERT INTO steps (step_id, event_id, step_num, step_title, step_performer) 
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT (step_id)
                    DO UPDATE SET
                        event_id = excluded.event_id,
                        step_num = excluded.step_num,
                        step_title = excluded.step_title,
                        step_performer = excluded.step_performer
                """, (s_id, event_id, s_number, s_title, s_performer))

                s_id = int(s_id)
            
            # Keep track of all the step ids given in the request
            r_all_step_ids.append(int(s_id))

            for instruction in instructions:
                # Retrieve all the instruction attributes and preprocess them
                # to store in the database
                i_job = sanitise(instruction.get("job"))
                i_job_id = execute_query("""
                    SELECT job_id
                    FROM jobs
                    WHERE job_name = ?
                """, (i_job,)).fetchall()[0][0]
                i_number = instructions.index(instruction) + 1
                i_command = sanitise(instruction.get("command"))
                i_detail = sanitise(instruction.get("detail"))
                i_combined = i_command + " " + i_detail

                # Add the new instructions to the database
                execute_query("""
                    INSERT INTO instructions (step_id, job_id, instruction_num, instruction_detail)
                    VALUES (?, ?, ?, ?)
                """, (s_id, i_job_id, i_number, i_combined))


        # Deal with deleted events
        # Query database to get all step ids associated with event 
        all_step_ids_query = execute_query("""
            SELECT step_id
            FROM steps
            WHERE event_id = ?
        """, (event_id,)).fetchall()

        for record in all_step_ids_query:
            if record[0] not in r_all_step_ids:
                execute_query("""
                    DELETE FROM steps WHERE step_id = ?
                """, (record[0],))
                
        logging.info("An edited event has been successfully saved")
        return jsonify({'message': 'Event successfully saved'}), 200
    
    logging.warning("Unauthorised user attempted to save an edited event")
    return auth

@app.route('/start_live_event/<int:event_id>', methods=['GET'])
@limiter.limit("12 per minute")
def start_live_event(event_id):
    auth = authorise(request, 1)

    if auth is True:
        event_data = get_event_from_database(event_id, "admin")

        # Initiate the step index variable
        cache.set("step_index", 0)
        cache.set("max_index", len(event_data) - 1)
        cache.set("event_id", event_id)

        logging.info("Event admin successfully started event")
        return jsonify(event_data), 200

    logging.warning("Unauthorised user attempted to start an event")
    return auth

@app.route("/next_step", methods=["GET"])
@limiter.limit("60 per minute")
def next_step():
    auth = authorise(request, 1)
    
    if auth is True:
        # Get step index
        step_index = cache.get("step_index")
        max_index = cache.get("max_index")
        
        if step_index is not None:
            # Increment and return step index if valid
            requested_index = step_index + 1
            if requested_index <= max_index:
                step_index += 1
            
            # Save step index
            cache.set("step_index", step_index)
            return jsonify({"message": step_index}), 200
        
        logging.info("Event progressed to next step by admin")
        return jsonify({"error": "There is no event being played right now"}), 400
    
    logging.warning("Unauthorised user attempted to progress to next step")
    return auth

@app.route("/prev_step", methods=["GET"])
@limiter.limit("60 per minute")
def prev_step():
    auth = authorise(request, 1)
    
    if auth is True:
        # Get step index
        step_index = cache.get("step_index")
        
        if step_index is not None:
            # Increment and return step index if valid
            requested_index = step_index - 1
            if requested_index >= 0:
                step_index -= 1
            
            # Save step index
            cache.set("step_index", step_index)
            return jsonify({"message": step_index}), 200
        
        logging.info("Event regressed to previous step by admin")
        return jsonify({"error": "There is no event playing right now"}), 400
    
    logging.warning("Unauthorised user attempted to progress to previous step")
    return auth

@app.route('/end_live_event', methods=['PUT'])
@limiter.limit("12 per minute")
def end_live_event():
    auth = authorise(request, 1)
    
    if auth is True:
        cache.set("step_index", None)
        cache.set("max_index", None)
        cache.set("event_id", None)

        logging.info("Event successfully ended by admin")
        return jsonify({"message": "Event successfully ended"}), 200
    
    logging.warning("Unauthorised user attempted to end live event")
    return auth

@app.route('/get_step_index', methods=['GET'])
@limiter.limit("130 per minute")
def get_step_index():
    step_index = cache.get("step_index")

    if step_index is None:
        logging.info("User attempted to get step index with no event playing")
        return jsonify({"error": "There is no event playing right now"}), 400
    
    logging.info("Get step index successful: " + str(step_index))
    return jsonify({"message": step_index})

@app.route('/start_crew', methods=['GET'])
@limiter.limit("12 per minute")
def start_crew():
    auth = authorise(request, 2)
    event_id = cache.get("event_id")

    if auth is True:
        if event_id is None:
            return jsonify({"error": "There is no event being played right now. Ask your administrator for help."}), 400

        event_data = get_event_from_database(event_id, "")

        logging.info("Crew member dashboard initialised successfully")
        return jsonify(event_data), 200

    logging.warning("Unauthorised user attempted to initialise crew member dashboard")
    return auth

@limiter.limit("20 per minute")
@app.route('/get_server_status', methods=['GET'])
def get_server_status():
    logging.info("Client pinged server")
    return jsonify({'message': 'Server online'}), 200

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
    logging.info('App started successfully')
