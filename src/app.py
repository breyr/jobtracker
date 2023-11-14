from flask import Flask, render_template, request, redirect, url_for, session
import pyrebase
from dotenv import load_dotenv
import os

load_dotenv()

config = {
    "apiKey": os.getenv('API_KEY'),
    "authDomain": os.getenv('AUTH_DOMAIN'),
    "projectId": os.getenv('PROJECT_ID'),
    "storageBucket": os.getenv('STORAGE_BUCKET'),
    "messagingSenderId": os.getenv('MESSAGING_SENDER_ID'),
    "appId": os.getenv('APP_ID'),
    "databaseURL": ""
}

firebase = pyrebase.initialize_app(config)

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')


@app.route('/')
def index():
    try:
        usr = session['usr']
        return redirect(url_for('dashboard'))
    except KeyError:
        return render_template('index.html')


@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']
    auth = firebase.auth()
    try:
        user = auth.sign_in_with_email_and_password(email, password)
        # TODO: refresh session token, tokens are invalid after 1 hour
        user_id = user['idToken']
        session['usr'] = user_id
        return redirect(url_for('dashboard'))
    except:
        return redirect(url_for('index'))


@app.route('/register', methods=['POST'])
def register():
    email = request.form['email']
    password = request.form['password']
    auth = firebase.auth()
    try:
        # TODO check if email is already in use
        user = auth.create_user_with_email_and_password(email, password)
        # TODO refresh session token, tokens are invalid after 1 hour
        user_id = user['idToken']
        session['usr'] = user_id
        return redirect(url_for('dashboard'))
    except:
        return redirect(url_for('index'))


@app.route('/dashboard')
def dashboard():
    try:
        usr = session['usr']
        return render_template('dashboard.html')
    except KeyError:
        # If 'usr' is not in session, then the user is not logged in, redirect to index
        return redirect(url_for('index'))


@app.route('/logout', methods=['POST'])
def logout():
    try:
        usr = session['usr']
        session.pop('usr', None)
        return redirect(url_for('index'))
    except KeyError:
        return redirect(url_for('index'))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
