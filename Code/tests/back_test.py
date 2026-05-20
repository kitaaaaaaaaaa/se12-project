import sys
import os
# Navigate up one folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest, socket
from backend import app as backend_app # Import the backend application

backend_url = "http://" + socket.gethostbyname(socket.gethostname()) + ":5000"

@pytest.fixture()
def app():
    flask_app = backend_app.app
    flask_app.config.update({
        "TESTING": True,
    })

    with flask_app.app_context():
        yield flask_app

@pytest.fixture()
def client(app):
    return app.test_client()

@pytest.mark.parametrize("text, expected", [
    ("Hello<script>console.log('world')</script>", "Hello&lt;script&gt;console.log('world')&lt;/script&gt;"),
    ("Hello <u>world</u>", "Hello <u>world</u>"),
])
def test_sanitise(text, expected):
    assert backend_app.sanitise(text) == expected

def test_login_success(client):
    custom_payload = {
        "email": "something@mail.com",
        "password": "hello123!@#$%^&*()"
    }

    custom_headers = {
        'Content-Type': 'application/json'
    }

    response = client.post("/login", json=custom_payload, headers=custom_headers)

    assert response.status_code == 200
    assert response.get_json()["token"] is not None

def test_login_fail(client):
    custom_payload = {
        "email": "something@mail.com",
        "password": "fakepassword"
    }

    custom_headers = {
        'Content-Type': 'application/json'
    }

    response = client.post("/login", json=custom_payload, headers=custom_headers)

    assert response.status_code == 401

def test_login_nonexist(client):
    custom_payload = {
        "email": "aosdjfioasjfoidfjgosdji@asdofiajfgdsflgf",
        "password": "afjkghidisj49jgf"
    }

    custom_headers = {
        'Content-Type': 'application/json'
    }

    response = client.post("/login", json=custom_payload, headers=custom_headers)

    assert response.status_code == 401