import { useState, useEffect } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

// Configurația bazei tale de date Google Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDyyhd3e4G_zLn-DyLokswdeW2AFUvSSXo",
  authDomain: "luxm-4377e.firebaseapp.com",
  projectId: "luxm-4377e",
  storageBucket: "luxm-4377e.firebasestorage.app",
  messagingSenderId: "91700317006",
  appId: "1:91700317006:web:1bed6021550988c471ac1f",
  measurementId: "G-M6BKQ0E77N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [produse, setProduse] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [numeNou, setNumeNou] = useState("");
  const [pretNou, setPretNou] = useState("");
  const [imagineBase64, setImagineBase64] = useState("");
  const [incarcareInCurs, setIncarcareInCurs] = useState(false);

  // Ascultă în timp real produsele din baza de date
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
      alert("Parolă incorectă!");
    }
  };

  const manipulareFisierPoza = (e) => {
    const fisier = e.target.files[0];
    if (fisier) {
      if (fisier.size > 1500000) {
        alert("Poza este prea mare! Fă-i un screenshot pentru a o micșora.");
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
    if (!numeNou || !pretNou || !imagineBase64) return alert("Completează toate câmpurile și alege o imagine!");
    setIncarcareInCurs(true);
    try {
      const formatPret = pretNou.includes("MDL") ? pretNou : `${pretNou} MDL`;
      await addDoc(collection(db, "produse"), {
        nume: numeNou,
        pret: formatPret,
        imagine: imagineBase64
      });
      setNumeNou("");
      setPretNou("");
      setImagineBase64("");
      alert("Produs adăugat!");
    } catch (eroare) {
      alert("Eroare la salvare.");
    } finally {
      setIncarcareInCurs(false);
    }
  };

  const stergeProdus = async (id) => {
    if (window.confirm("Ștergi acest produs?")) {
      await deleteDoc(doc(db, "produse", id));
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
          
          {/* BUTONUL DE APEL TELEFONIC - Înlocuiește +37360000000 cu numărul tău real */}
          <a href="tel:+37360000000" style={{ textDecoration: 'none' }}>
            <button style={{ cursor: 'pointer' }}>Sună</button>
          </a>

          {!isAdmin ? (
            <button onClick={autentificareDirector} style={{ background: "#222", color: "gold", border: "1px solid gold" }}>Admin</button>
          ) : (
            <button onClick={() => setIsAdmin(false)} style={{ background: "red", color: "white" }}>Ieșire</button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div style={{ background: "#1a1a1a", padding: "20px", borderRadius: "15px", marginTop: "30px", border: "1px solid gold" }}>
          <form onSubmit={adaugaProdus} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input type="text" placeholder="Nume produs" value={numeNou} onChange={(e) => setNumeNou(e.target.value)} style={{ padding: "10px", background: "#333", color: "white", border: "none" }}/>
            <input type="text" placeholder="Preț" value={pretNou} onChange={(e) => setPretNou(e.target.value)} style={{ padding: "10px", background: "#333", color: "white", border: "none" }}/>
            <input type="file" accept="image/*" onChange={manipulareFisierPoza} style={{ color: "white" }}/>
            <button type="submit" disabled={incarcareInCurs} style={{ padding: "10px", background: "gold", color: "black", fontWeight: "bold" }}>
              {incarcareInCurs ? "Se salvează..." : "Adaugă pe Site"}
            </button>
          </form>
        </div>
      )}

      <h2 className="title">Produse Apple</h2>
      <div className="products">
        {produse.map((produs) => (
          <div className="card" key={produs.id}>
            <img src={produs.imagine} alt={produs.nume} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
            <h3>{produs.nume}</h3>
            <p>{produs.pret}</p>
            {isAdmin && <button onClick={() => stergeProdus(produs.id)} style={{ background: "red", color: "white", width: "100%" }}>Șterge</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
