// Fix: Ensure named import for initializeApp and use environment variable for API Key as per coding guidelines
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase para o projeto Lagoon GastroBar
// A API key deve ser obtida exclusivamente da variável de ambiente process.env.API_KEY
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "estoque-lagoon-gastrobar.firebaseapp.com",
  projectId: "estoque-lagoon-gastrobar",
  storageBucket: "estoque-lagoon-gastrobar.firebasestorage.app",
  messagingSenderId: "10776352430",
  appId: "1:10776352430:web:18eba8bf51b7a2309f3f3f",
  measurementId: "G-M3LEDWRRWJ"
};

// Inicializa o Firebase usando o SDK modular v9+
const app = initializeApp(firebaseConfig);

// Exporta o Firestore para uso em toda a aplicação
export const db = getFirestore(app);