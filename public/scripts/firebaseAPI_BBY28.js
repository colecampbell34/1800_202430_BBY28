//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyBQ2csW6UXcyRATLp175bFYsFbzAXNxoX8",
    authDomain: "bby28-collectivecoin.firebaseapp.com",
    projectId: "bby28-collectivecoin",
    storageBucket: "bby28-collectivecoin.appspot.com",
    messagingSenderId: "473318389343",
    appId: "1:473318389343:web:f548855570fa5090cecdea",
    measurementId: "G-9MS4GMTD6K"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
