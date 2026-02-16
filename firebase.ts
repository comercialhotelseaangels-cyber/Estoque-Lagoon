
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração real do Firebase para o projeto Lagoon GastroBar
const firebaseConfig = {
  apiKey: "AIzaSyCqVPYKUyVlSenZVMtmVwMCK4FiD8McVjY",
  authDomain: "estoque-lagoon-gastrobar.firebaseapp.com",
  projectId: "estoque-lagoon-gastrobar",
  storageBucket: "estoque-lagoon-gastrobar.firebasestorage.app",
  messagingSenderId: "10776352430",
  appId: "1:10776352430:web:18eba8bf51b7a2309f3f3f",
  measurementId: "G-M3LEDWRRWJ"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o Firestore para uso em toda a aplicação
export const db = getFirestore(app);
