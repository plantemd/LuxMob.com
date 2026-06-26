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
  // Oricând adaugi sau ștergi un produs, modificarea apare instant la TOȚI utilizatorii de pe site
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
      } catch (eroare) {
        alert("Nu s-a putut șterge produsul.");
      }
    }
  };

  return (
    <div className="container">
      <div className="profile">
        <div className="logo">
          <img src="logo.png" alt="Lux_Mob" className="logo"/>
        </div>
        <p>Tehnică Apple Originală</p>
        <div className="buttons">
          <button>Urmărește</button>
          <button>Mesaj</button>
          <button>Sună</button>
          
          {!isAdmin ? (
            <button onClick={autentificareDirector} style={{ background: "#222", color: "gold", border: "1px solid gold" }}>
              Logare Admin
            </button>
          ) : (
            <button onClick={deconectareDirector} style={{ background: "red", color: "white" }}>
              Ieșire Admin
            </button>
          )}
        </div>
      </div>

      {/* --- PANOU ADMINISTRATOR (DIRECTOR) --- */}
      {isAdmin && (
        <div style={{ background: "#1a1a1a", padding: "20px", borderRadius: "15px", marginTop: "30px", border: "1px solid gold" }}>
          <h3 style={{ marginBottom: "15px", color: "gold" }}>Panou Director (Bază de date conectată)</h3>
          <form onSubmit={adaugaProdus} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input 
              type="text" 
              placeholder="Nume produs (ex: iPhone 15 Pro)" 
              value={numeNou} 
              onChange={(e) => setNumeNou(e.target.value)}
              style={{ padding: "10px", borderRadius: "5px", border: "none", background: "#333", color: "white" }}
            />
            <input 
              type="text" 
              placeholder="Preț (ex: 1200)" 
              value={pretNou} 
              onChange={(e) => setPretNou(e.target.value)}
              style={{ padding: "10px", borderRadius: "5px", border: "none", background: "#333", color: "white" }}
            />
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "5px" }}>
              <label style={{ color: "gold", fontSize: "14px" }}>Selectează poza din telefon:</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={manipulareFisierPoza}
                style={{ padding: "10px", borderRadius: "5px", background: "#333", color: "white", width: "100%" }}
              />
            </div>

            {imagineBase64 && (
              <div style={{ marginTop: "5px" }}>
                <p style={{ color: "#aaa", fontSize: "12px", marginBottom: "5px" }}>Previzualizare foto:</p>
                <img src={imagineBase64} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px", border: "1px solid gold" }} />
              </div>
            )}

            <button 
              type="submit" 
              disabled={incarcareInCurs}
              style={{ padding: "10px", background: incarcareInCurs ? "#555" : "gold", color: "black", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}
            >
              {incarcareInCurs ? "Se salvează în baza de date..." : "Adaugă pe Site"}
            </button>
          </form>
        </div>
      )}

      <h2 className="title">Produse Apple</h2>

      {/* --- LISTA DE PRODUSE SINCRONIZATĂ --- */}
      <div className="products">
        {produse.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center", width: "100%", gridColumn: "1/-1", padding: "20px"
