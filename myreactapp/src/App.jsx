import { useState, useEffect } from "react";
import "./App.css";

// --- CONFIGURARE ȘI IMPORTURI FIREBASE ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

// Datele tale reale preluate din consola Firebase:
const firebaseConfig = {
  apiKey: "AIzaSyDyyhd3e4G_zLn-DyLokswdeW2AFUvSSXo",
  authDomain: "luxm-4377e.firebaseapp.com",
  projectId: "luxm-4377e",
  storageBucket: "luxm-4377e.firebasestorage.app",
  messagingSenderId: "91700317006",
  appId: "1:91700317006:web:1bed6021550988c471ac1f",
  measurementId: "G-M6BKQ0E77N"
};

// Inițializăm aplicația și baza de date Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// ------------------------------------

function App() {
  const [produse, setProduse] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [numeNou, setNumeNou] = useState("");
  const [pretNou, setPretNou] = useState("");
  const [imagineBase64, setImagineBase64] = useState(""); // Reținem imaginea convertită în text public
  const [incarcareInCurs, setIncarcareInCurs] = useState(false);

  // --- CITIRE DATE ÎN TIMP REAL ---
  // Oricând adaugi sau ștergi un amazon, modificarea apare instant la TOȚI utilizatorii de pe site
  useEffect(() => {
    const colectieProduse = collection(db, "produse");
    
    const unsubscribe = onSnapshot(colectieProduse, (snapshot) => {
      const listaProduse = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProduse(listaProduse);
    });

    return () => unsubscribe();
  }, []);

  const autentificareDirector = () => {
    const parolaIntrodusa = prompt("Introdu parola de administrator:");
    if (parolaIntrodusa === "director_luxmob123") {
      setIsAdmin(true);
    } else {
      alert("Parolă incorectă! Acces refuzat.");
    }
  };

  const deconectareDirector = () => {
    setIsAdmin(false);
  };

  // Funcție care transformă poza din telefon/calculator într-un format text salvabil în baza de date
  const manipulareFisierPoza = (e) => {
    const fisier = e.target.files[0];
    if (fisier) {
      if (fisier.size > 1500000) {
        alert("Poza este prea mare! Te rog alege o altă imagine sau fă-i un screenshot pentru a reduce dimensiunea.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagineBase64(reader.result);
      };
      reader.readAsDataURL(fisier);
    }
  };

  const adaugaProdus = async (e) => {
    e.preventDefault();
    if (!numeNou || !pretNou) return alert("Introdu numele și prețul!");
    if (!imagineBase64) return alert("Te rog să alegi o imagine!");

    setIncarcareInCurs(true);

    try {
      const formatPret = pretNou.includes("MDL") ? pretNou : `${pretNou} MDL`;
      
      // Salvăm direct în cloud-ul Firebase Firestore
      await addDoc(collection(db, "produse"), {
        nume: numeNou,
        pret: formatPret,
        imagine: imagineBase64
      });

      // Curățăm formularul
      setNumeNou("");
      setPretNou("");
      setImagineBase64("");
      alert("Produsul a fost adăugat cu succes și este vizibil pentru toată lumea!");
    } catch (eroare) {
      console.error(eroare);
      alert("A apărut o eroare la salvarea în baza de date.");
    } finally {
      setIncarcareInCurs(false);
    }
  };

  const stergeProdus = async (id) => {
    if (window.confirm("Sigur vrei să ștergi definitiv acest produs?")) {
      try {
        await deleteDoc(doc(db, "produse", id));
