import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// config is safe to pass here for now
const app = initializeApp({
    apiKey: "AIzaSyDSLxzlQlYrL0NItCwc3NplBH3Ok4gwbQY",
    authDomain: "application-tracker-baff6.firebaseapp.com",
    projectId: "application-tracker-baff6",
    storageBucket: "application-tracker-baff6.appspot.com",
    messagingSenderId: "454026082855",
    appId: "1:454026082855:web:5c492821f35cf5694cec02"
});

const auth = getAuth(app);

// detect auth state
onAuthStateChanged(auth, user => {
    if (user != null) {
        const uid = user.uid;
        console.log('logged in');
    } else {
        console.log('No user');
    }
});

// create user
createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    });

// sign in
signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    });