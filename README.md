# Application Tracker

Application Tracker is a web application that allows users to track their job applications. Users can add applications, view applications, and update applications. The application uses Firebase for authentication and Xata for database storage.

## Table of Contents

- [Application Tracker](#application-tracker)
  - [Table of Contents](#table-of-contents)
  - [Technologies Used](#technologies-used)
  - [Setup](#setup)

## Technologies Used

- Python
- [Flask](https://flask.palletsprojects.com/en/3.0.x/)
- [pyrebase](https://github.com/nhorvath/Pyrebase4)
- [Firebase](https://firebase.google.com/)
- [Bootstrap](https://getbootstrap.com/)
- [jQuery](https://jquery.com/)
- [js-priority-queue](https://www.jsdelivr.com/package/npm/js-priority-queue)
- [Font Awesome](https://fontawesome.com/)
- [Xata](https://xata.io/)

## Setup

1. Clone the repository: `git clone https://github.com/breyr/jobtracker.git`
2. Navigate to the repository directory: `cd jobtracker`
3. Rename `.env.example` to `.env`
4. Create a Firebase project and add a web app to it, setup email/password authentication, and add config to `.env` file
5. Create a Xata database and add config to `.env` file
6. Generate a random string for the `SECRET_KEY` variable in the `.env` file
7. Create a virtual environment: `python -m venv venv`
8. Activate the virtual environment: `source venv/bin/activate`
9. Install the dependencies: `pip install -r requirements.txt`
10. Run the application: `flask run --debug`
