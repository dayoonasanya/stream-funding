import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyC-u3h6aZriYABBxyZCK8uTpuKK5HRE0Zs",
  authDomain: "stream-b36eb.firebaseapp.com",
  projectId: "stream-b36eb",
  storageBucket: "stream-b36eb.appspot.com",
  messagingSenderId: "390563040381",
  appId: "1:390563040381:web:231d79a2ac5acb9bbb3514",
  measurementId: "G-P8HC0R7MDQ"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const  db = getFirestore(app);


export default app