# Application Tracker

## Table of Contents

- [Application Tracker](#application-tracker)
  - [Table of Contents](#table-of-contents)
  - [Technologies Used](#technologies-used)
  - [Setup](#setup)
  - [TODOS (Internal)](#todos-internal)

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
3. Create a virtual environment: `python -m venv venv`
4. Activate the virtual environment: `source venv/bin/activate`
5. Install the dependencies: `pip install -r requirements.txt`
6. Run the application: `flask run --debug`

## TODOS (Internal)

- [✅] Add server logic for adding an application
- [✅] Add server logic for deleting an application
- [✅] Add server logic for updating an application
- [✅] Add server logic for getting all applications
- [✅] Implement error handling in Ajax requests
- [✅] Add client side logic to sort applications?
- [✅] Add client side logic to filter applications?
- [✅] be able to sort by more than one column
- [✅] Add client side logic for mass deletion?
- [ ] Optimize so that sorting on occurs on rows that are visible based on search
- [ ] rows with same dates get sorted sometimes?
