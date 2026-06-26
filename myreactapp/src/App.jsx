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

function ProductCard({ produs, isAdmin, stergeProdus, deschidePozaMare }) {
  const [indexImagine, setIndexImagine] = useState(0);
  const imagini = Array.isArray(produs.imagine) ? produs.imagine : [produs.imagine];

  const imagineaUrmatoare = (e) => {
    e.stopPropagation(); // Oprește deschiderea pop-up-ului când apeși pe săgeată
    setIndexImagine((prev) => (prev + 1) % imagini.length);
  };

  const imagineaAnterioara = (e) => {
    e.stopPropagation(); // Oprește deschiderea pop-up-ului când apeși pe săgeată
    setIndexImagine((prev) => (prev - 1 + imagini.length) % imagini.length);
  };

  return (
    <div className="card">
      {/* Când se dă click pe containerul imaginii, se deschide ecranul complet */}
      <div className="card-image-container" onClick={() => deschidePozaMare(imagini, indexImagine)}>
        <img src={imagini[indexImagine]} alt={produs.nume} style={{ cursor: "zoom-in" }} />
        
        {imagini.length > 1 && (
          <>
            <button onClick={imagineaAnterioara} className="nav-arrow left">‹</button>
            <button onClick={imagineaUrmatoare} className="nav-arrow right">›</button>
            <div className="image-counter">
              {indexImagine + 1} / {imagini.length}
            </div>
          </>
        )}
      </div>
      <h3>{produs.nume}</h3>
      <p>{produs.pret}</p>
      {isAdmin && (
        <button onClick={() => stergeProdus(produs.id)} style={{ background: "red", color: "white", width: "100%", borderRadius: "0 0 12px 12px", border: "none", padding: "10px", cursor: "pointer" }}>
          Șterge
        </button>
      )}
    </div>
  );
}

function App() {
  const [produse, setProduse] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [numeNou, setNumeNou] = useState("");
  const [pretNou, setPretNou] = useState("");
  const [imaginiBase64, setImaginiBase64] = useState([]);
  const [incarcareInCurs, setIncarcareInCurs] = useState(false);

  // Stări pentru fereastra pop-up cu poza mare
  const [fereastraDeschisa, setFereastraDeschisa] = useState(false);
  const [imaginiPopUp, setImaginiPopUp] = useState([]);
  const [indexPopUp, setIndexPopUp] = useState(0);

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

  const deschidePozaMare = (listaImagini, indexCurent) => {
    setImaginiPopUp(listaImagini);
    setIndexPopUp(indexCurent);
    setFereastraDeschisa(true);
  };

  const autentificareDirector = () => {
    const parolaIntrodusa = prompt("Introdu parola de administrator:");
    if (parolaIntrodusa === "director_luxmob123") {
      setIsAdmin(true);
    } else {
      alert("Parolă incorectă!");
    }
  };

  const manipulareFisierePoze = (e) => {
    const fisiere = Array.from(e.target.files);
    const listeCitite = [];

    fisiere.forEach((fisier) => {
      if (fisier.size > 1500000) {
        alert(`Poza ${fisier.name} este prea mare! Redu-i dimensiunea sau fă-i screenshot.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        listeCitite.push(reader.result);
        if (listeCitite.length === fisiere.length) {
          setImaginiBase64(listeCitite);
        }
      };
      reader.readAsDataURL(fisier);
    });
  };

  const adaugaProdus = async (e) => {
    e.preventDefault();
    if (!numeNou || !pretNou || imaginiBase64.length === 0) {
      return alert("Completează toate câmpurile și alege cel puțin o imagine!");
    }
    setIncarcareInCurs(true);
    try {
      const formatPret = pretNou.includes("MDL") ? pretNou : `${pretNou} MDL`;
      await addDoc(collection(db, "produse"), {
        nume: numeNou,
        pret: formatPret,
        imagine: imaginiBase64
      });
      setNumeNou("");
      setPretNou("");
      setImaginiBase64([]);
      alert("Produs adăugat cu succes!");
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
          <button className="btn-normal">Urmărește</button>
          <button className="btn-normal">Mesaj</button>
          <a href="tel:+37360000000" className="btn-suna">Sună</a>

          {!isAdmin ? (
            <button onClick={autentificareDirector} style={{ background: "#222", color: "gold", border: "1px solid gold" }} className="btn-normal">Admin</button>
          ) : (
            <button onClick={() => setIsAdmin(false)} style={{ background: "red", color: "white" }} className="btn-normal">Ieșire</button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div style={{ background: "#1a1a1a", padding: "20px", borderRadius: "15px", marginTop: "30px", border: "1px solid gold" }}>
          <form onSubmit={adaugaProdus} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input type="text" placeholder="Nume produs" value={numeNou} onChange={(e) => setNumeNou(e.target.value)} style={{ padding: "10px", background: "#333", color: "white", border: "none" }}/>
            <input type="text" placeholder="Preț" value={pretNou} onChange={(e) => setPretNou(e.target.value)} style={{ padding: "10px", background: "#333", color: "white", border: "none" }}/>
            
            <label style={{ color: "gold", fontSize: "12px" }}>Poți selecta mai multe poze simultan:</label>
            <input type="file" accept="image/*" multiple onChange={manipulareFisierePoze} style={{ color: "white" }}/>
            
            <button type="submit" disabled={incarcareInCurs} style={{ padding: "12px", background: "gold", color: "black", fontWeight: "bold" }}>
              {incarcareInCurs ? "Se salvează..." : `Adaugă pe Site (${imaginiBase64.length} foto selectate)`}
            </button>
          </form>
        </div>
      )}

      <h2 className="title">Produse Apple</h2>
      
      {produse.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", marginTop: "20px", fontSize: "14px", fontStyle: "italic" }}>
          Momentan nu sunt produse disponibile.
        </p>
      ) : (
        <div className="products">
          {produse.map((produs) => (
            <ProductCard key={produs.id} produs={produs} isAdmin={isAdmin} stergeProdus={stergeProdus} deschidePozaMare={deschidePozaMare} />
          ))}
        </div>
      )}

      {/* --- STRUCTURA PENTRU POP-UP / MODAL (VIZUALIZARE INTRARE ÎN POZĂ) --- */}
      {fereastraDeschisa && (
        <div className="lightbox-overlay" onClick={() => setFereastraDeschisa(false)}>
          <button className="lightbox-close" onClick={() => setFereastraDeschisa(false)}>×</button>
          
          {imaginiPopUp.length > 1 && (
            <button className="lightbox-arrow left" onClick={(e) => { e.stopPropagation(); setIndexPopUp((prev) => (prev - 1 + imaginiPopUp.length) % imaginiPopUp.length); }}>‹</button>
          )}

          <img src={imaginiPopUp[indexPopUp]} alt="Produs marit" className="lightbox-image" onClick={(e) => e.stopPropagation()} />

          {imaginiPopUp.length > 1 && (
            <button className="lightbox-arrow right" onClick={(e) => { e.stopPropagation(); setIndexPopUp((prev) => (prev + 1) % imaginiPopUp.length); }}>›</button>
          )}
          
          <div className="lightbox-counter">
            {indexPopUp + 1} / {imaginiPopUp.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
