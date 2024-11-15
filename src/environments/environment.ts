
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyCvHQwUz4A8rlrFWjrH_80x6rTnMwfdq28",
  authDomain: "almacen-6ea00.firebaseapp.com",
  projectId: "almacen-6ea00",
  storageBucket: "almacen-6ea00.appspot.com",
  messagingSenderId: "695724800747",
  appId: "1:695724800747:web:150592011a5d8391601cae",
  measurementId: "G-GZTRTNZTD3"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

