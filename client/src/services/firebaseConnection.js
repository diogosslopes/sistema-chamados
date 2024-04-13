import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage'

let firebaseConfig = {
  // apiKey: "AIzaSyDZ26qrW7ePZQ4aSi3okR7VErz31G6D28c",
  // authDomain: "chamados-e665c.firebaseapp.com",
  // projectId: "chamados-e665c",
  // storageBucket: "chamados-e665c.appspot.com",
  // messagingSenderId: "469741550564",
  // appId: "1:469741550564:web:6b9bdad85554e34b2865f1",
  // measurementId: "G-NXCN3HP3S7"

  apiKey: "AIzaSyDooXA924iS6rbjV9q7MzoLvIux99OBpwA",
  authDomain: "chamados-4159b.firebaseapp.com",
  projectId: "chamados-4159b",
  storageBucket: "chamados-4159b.appspot.com",
  messagingSenderId: "868767201765",
  appId: "1:868767201765:web:8a5e26379f0802d415970c",
  measurementId: "G-VLB6GH368W"
};

if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

export default firebase;

