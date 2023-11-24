from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    jsonify,
    flash,
)
import pyrebase
from dotenv import load_dotenv
import os
from xata.client import XataClient
import json

load_dotenv()

config = {
    "apiKey": os.getenv("API_KEY"),
    "authDomain": os.getenv("AUTH_DOMAIN"),
    "projectId": os.getenv("PROJECT_ID"),
    "storageBucket": os.getenv("STORAGE_BUCKET"),
    "messagingSenderId": os.getenv("MESSAGING_SENDER_ID"),
    "appId": os.getenv("APP_ID"),
    "databaseURL": "",
}


firebase = pyrebase.initialize_app(config)

# initialize xata connection
xata = XataClient(api_key=os.getenv("XATA_API_KEY"), db_url=os.getenv("XATA_DB_URL"))

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")


@app.route("/")
def index():
    try:
        session["usr"]
        return redirect(url_for("dashboard"))
    except KeyError:
        return render_template("index.html")


@app.route("/login", methods=["POST"])
def login():
    email = request.form["email"]
    password = request.form["password"]
    auth = firebase.auth()
    try:
        user = auth.sign_in_with_email_and_password(email, password)
        user_id = user["idToken"]
        session["usr"] = user_id
        session["email"] = user["email"]
        # get user id from xata
        # session['usr_uid'] is used to identify the user in xata, will be used
        # to add data to applications table
        res = xata.data().query(
            "Users", {"columns": ["id"], "filter": {"email": email}}
        )
        if res.is_success():
            session["uid"] = res["records"][0]["id"]
            return jsonify(success=True), 200
        else:
            return jsonify(success=False), 500
    except Exception as e:
        # common error codes for firebase auth
        # INVALID_LOGIN_CREDENTIALS, TOO_MANY_ATTEMPTS_TRY_LATER
        return (
            jsonify(success=False, error=json.loads(e.args[1])["error"]["message"]),
            400,
        )


@app.route("/register", methods=["POST"])
def register():
    email = request.form["email"]
    password = request.form["password"]
    auth = firebase.auth()
    try:
        user = auth.create_user_with_email_and_password(email, password)
        user_id = user["idToken"]
        session["usr"] = user_id
        session["email"] = email
        # add user to xata
        res = xata.records().insert("Users", {"email": email})
        if res.is_success() and "idToken" in user:
            # user created in firebase and added to xata
            session["uid"] = res["id"]
            return jsonify(success=True), 200
        else:
            return jsonify(success=False), 500
    except Exception as e:
        # common error codes for firebase auth
        # EMAIL_EXISTS, OPERATION_NOT_ALLOWED, TOO_MANY_ATTEMPTS_TRY_LATER
        return (
            jsonify(success=False, error=json.loads(e.args[1])["error"]["message"]),
            400,
        )


@app.route("/dashboard", methods=["GET"])
def dashboard():
    try:
        session["usr"]

        # Get all applications for the user
        res = xata.data().query(
            "Applications", {"columns": ["*"], "filter": {"uid": session["uid"]}}
        )

        if res.is_success():
            # applications retrieved
            return render_template(
                "dashboard.html", applications=res["records"], email=session["email"]
            )
    except KeyError:
        # If 'usr' is not in session, then the user is not logged in, redirect to index
        return redirect(url_for("index"))


@app.route("/newapp", methods=["POST"])
def newapp():
    try:
        # user must be logged in
        session["usr"]

        # add application to xata
        req_record = request.get_json()
        record = {
            "uid": session["uid"],
            "company": req_record["company"],
            "position": req_record["position"],
            "posting_link": req_record["postingLink"],
            "status": req_record["status"],
            "description": req_record["desc"],
        }

        res = xata.records().insert("Applications", record)
        if res.is_success():
            # application added
            return jsonify(sucess=True, id=res["id"])
        else:
            # db error
            return jsonify(success=False), 500
    except KeyError:
        return redirect(url_for("index"))


@app.route("/deleteapp", methods=["POST"])
def deleteapp():
    try:
        session["usr"]
        data = request.get_json()
        # delete application from xata
        res = xata.records().transaction({"operations": data["ops"]})
        if res.is_success():
            # application deleted
            return jsonify(success=True)
        else:
            # db error
            return jsonify(success=False), 500
    except KeyError:
        return redirect(url_for("index"))


@app.route("/updateapp", methods=["POST"])
def updateapp():
    try:
        session["usr"]
        # update application in xata
        req_record = request.get_json()
        record = {
            "company": req_record["company"],
            "position": req_record["position"],
            "posting_link": req_record["postingLink"],
            "status": req_record["status"],
            "description": req_record["desc"],
        }
        res = xata.records().update("Applications", req_record["id"], record)
        if res.is_success():
            # application updated
            return jsonify(success=True)
        else:
            # db error
            return jsonify(success=False), 500
    except KeyError:
        return redirect(url_for("index"))


@app.route("/logout", methods=["POST"])
def logout():
    try:
        session["usr"]
        # clear session
        session.pop("usr", None)
        session.pop("email", None)
        session.pop("uid", None)
        return redirect(url_for("index"))
    except KeyError:
        return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
