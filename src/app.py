from flask import Flask, render_template, request, redirect, url_for, session, jsonify
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
            session['uid'] = res['records'][0]['id']
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
        session['email'] = email
        # add user to xata
        res = xata.records().insert('Users', {'email': email})
        if res.is_success() and 'idToken' in user:
            # user created in firebase and added to xata
            session['uid'] = res['id']
            return redirect(url_for('dashboard'))
    except:
        return redirect(url_for('index'))


@app.route('/dashboard', methods=['GET'])
def dashboard():
    try:
        usr = session['usr']

        # Get all applications for the user
        res = xata.data().query('Applications', {
            "columns": ["*"],
            "filter": {
                "uid": session['uid']
            }
        })

        # ! this could be slow if there are a lot of applications, but 4 queries will be slow if there are a lot of applications in the db
        # Filter the applications by status
        applied = [app for app in res['records']
                   if app['status'] == 'applied']
        phone_interview = [
            app for app in res['records'] if app['status'] == 'phoneinterview']
        interview = [
            app for app in res['records'] if app['status'] == 'interview']
        offer_rejected = [
            app for app in res['records'] if app['status'] == 'offered' or app['status'] == 'rejected']

        if res.is_success():
            # applications retrieved
            return render_template('dashboard.html', applied=applied, phone_interview=phone_interview, interview=interview, offer_rejected=offer_rejected)
    except KeyError:
        # If 'usr' is not in session, then the user is not logged in, redirect to index
        return redirect(url_for('index'))


@app.route('/newapp', methods=['POST'])
def newapp():
    try:
        # user must be logged in
        usr = session['usr']

        # add application to xata
        record = {
            'uid': session['uid'],
            'company': request.form['company'],
            'position': request.form['position'],
            'posting_link': request.form['postingLink'],
            'status': request.form['status'],
            'description': request.form['desc'],
        }

        res = xata.records().insert('Applications', record)
        if res.is_success():
            # application added
            return jsonify(sucess=True, id=res['id'])
        else:
            # db error
            return jsonify(success=False)
    except KeyError:
        return redirect(url_for('index'))


@app.route('/deleteapp', methods=['POST'])
def deleteapp():
    try:
        usr = session['usr']

        # delete application from xata
        res = xata.records().delete(
            'Applications', request.form['id'])
        if res.is_success():
            # application deleted
            return jsonify(success=True)
        else:
            # db error
            return jsonify(success=False)
    except KeyError:
        return redirect(url_for('index'))


@app.route('/updateapp', methods=['POST'])
def updateapp():
    try:
        usr = session['usr']
        # update application in xata
        record = {
            'company': request.form['company'],
            'position': request.form['position'],
            'posting_link': request.form['postingLink'],
            'status': request.form['status'],
            'description': request.form['desc'],
        }
        res = xata.records().update(
            'Applications', request.form['id'], record)
        if res.is_success():
            # application updated
            return jsonify(success=True)

        else:
            # db error
            return jsonify(success=False)
    except KeyError:
        return redirect(url_for('index'))


@app.route('/logout', methods=['POST'])
def logout():
    try:
        usr = session['usr']
        # clear session
        session.pop('usr', None)
        session.pop('email', None)
        session.pop('uid', None)
        return redirect(url_for('index'))
    except KeyError:
        return redirect(url_for('index'))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
