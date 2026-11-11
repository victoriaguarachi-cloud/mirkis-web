// Configuración oficial de Firebase para mirkis deco
const firebaseConfig = {
  apiKey: "AIzaSyAlnOj3FxsY9bE3tb-pbBFtLn5oGVdENpI",
  authDomain: "mirkis-bc549.firebaseapp.com",
  projectId: "mirkis-bc549",
  storageBucket: "mirkis-bc549.firebasestorage.app",
  messagingSenderId: "384174820739",
  appId: "1:384174820739:web:0c75e4f0fc6bf1aed4bab6",
  measurementId: "G-T9D3BY37MK"
};

// Inicializar Firebase Compat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const storage = firebase.storage();