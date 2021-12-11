import firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyBEytoke0ssKOlznXyIRTf2oFBnOUtg2-I",
    authDomain: "willy-c48f8.firebaseapp.com",
    projectId: "willy-c48f8",
    storageBucket: "willy-c48f8.appspot.com",
    messagingSenderId: "456572885101",
    appId: "1:456572885101:web:aa9d69490bc3c06556c764"
  };
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();