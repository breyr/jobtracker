from flask import Flask, render_template, request, redirect, url_for, session
import pyrebase
from dotenv import load_dotenv
import os
from xata.client import XataClient

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

# initialize xata connection
xata = XataClient(api_key=os.getenv('XATA_API_KEY'),
                  db_url=os.getenv('XATA_DB_URL'))

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
        session['email'] = user['email']
        # get user id from xata
        # ! session['usr_uid'] is used to identify the user in xata, will be used
        # ! to add data to applications table
        res = xata.data().query('Users', {
            "columns": ["id"],
            "filter": {
                "email": email
            }
        })
        if res.is_success():
            session['usr_uid'] = res['records'][0]['id']
        else:
            # user not in db
            pass
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
        # add user to xata
        res = xata.records().insert('Users', {'email': email})
        if res.is_success() and 'idToken' in user:
            # user created in firebase and added to xata
            session['email'] = email
            session['usr_uid'] = res['id']
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
        # clear session
        session.pop('usr', None)
        session.pop('email', None)
        session.pop('usr_uid', None)
        return redirect(url_for('index'))
    except KeyError:
        return redirect(url_for('index'))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
