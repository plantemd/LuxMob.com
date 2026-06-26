import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [produse, setProduse] = useState(() => {
    const produseSalvate = localStorage.getItem("produse_lux_mob");
    return produseSalvate ? JSON.parse(produseSalvate) : [
      {
        id: 1,
        nume: "iPhone 16 Pro Max",
        pret: "39.999 MDL",
        imagine: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab"
      },
      {
        id: 2,
        nume: "iPhone 15 Pro",
        pret: "29.999 MDL",
        imagine: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
      }
    ];
  });

  // --- COLOANA DE SECURITATE PENTRU DIRECTOR ---
  const [isAdmin, setIsAdmin] = useState(false);

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
  // ---------------------------------------------

  const [numeNou, setNumeNou] = useState("");
  const [pretNou, setPretNou] = useState("");
  // Aici vom salva imaginea transformată în text (Base64)
  const [imagineNoua, setImagineNoua] = useState("");

  useEffect(() => {
    localStorage.setItem("produse_lux_mob", JSON.stringify(produse));
  }, [produse]);

  // Funcție care ia poza din telefon și o transformă în text
  const manipulareFisierPoza = (e) => {
    const fisier = e.target.files[0];
    if (fisier) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagineNoua(reader.result); // Salvează imaginea convertită
      };
      reader.readAsDataURL(fisier);
    }
  };

  const adaugaProdus = (e) => {
    e.preventDefault();
    if (!numeNou || !pretNou) return alert("Introdu numele și prețul!");
    if (!imagineNoua) return alert("Te rog să alegi o imagine din telefon!");

    const produsNou = {
      id: Date.now(),
      nume: numeNou,
      pret: pretNou.includes("MDL") ? pretNou : `${pretNou} MDL`,
      imagine: imagineNoua // Aici se salvează direct poza încărcată
    };

    setProduse([...produse, produsNou]);
    setNumeNou("");
    setPretNou("");
    setImagineNoua("");
  };

  const stergeProdus = (id) => {
    const produseRamase = produse.filter(produs => produs.id !== id);
    setProduse(produseRamase);
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

      {/* --- PANOU ADMIN MODIFICAT PENTRU ÎNCĂRCARE FIȘIERE --- */}
      {isAdmin && (
        <div style={{ background: "#1a1a1a", padding: "20px", borderRadius: "15px", marginTop: "30px", border: "1px solid gold" }}>
          <h3 style={{ marginBottom: "15px", color: "gold" }}>Panou Director (Mod Editare Activ)</h3>
          <form onSubmit={adaugaProdus} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input 
              type="text" 
              placeholder="Nume produs" 
              value={numeNou} 
              onChange={(e) => setNumeNou(e.target.value)}
              style={{ padding: "10px", borderRadius: "5px", border: "none", background: "#333", color: "white" }}
            />
            <input 
              type="text" 
              placeholder="Preț" 
              value={pretNou} 
              onChange={(e) => setPretNou(e.target.value)}
              style={{ padding: "10px", borderRadius: "5px", border: "none", background: "#333", color: "white" }}
            />
            
            {/* Butonul nou care deschide galeria foto a telefonului */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "5px" }}>
              <label style={{ color: "gold", fontSize: "14px" }}>Selectează poza din telefon:</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={manipulareFisierPoza}
                style={{ padding: "10px", borderRadius: "5px", background: "#333", color: "white", width: "100%" }}
              />
            </div>

            {/* Previhualizare mică a pozei alese înainte de salvare */}
            {imagineNoua && (
              <div style={{ marginTop: "5px" }}>
                <p style={{ color: "#aaa", fontSize: "12px", marginBottom: "5px" }}>Previzualizare poză selectată:</p>
                <img src={imagineNoua} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px", border: "1px solid gold" }} />
              </div>
            )}

            <button type="submit" style={{ padding: "10px", background: "gold", color: "black", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
              Adaugă pe Site
            </button>
          </form>
        </div>
      )}

      <h2 className="title">Produse Apple</h2>

      <div className="products">
        {produse.map((produs) => (
          <div className="card" key={produs.id}>
            <img src={produs.imagine} alt={produs.nume} />
            <h3>{produs.nume}</h3>
            <p>{produs.pret}</p>
            
            {isAdmin && (
              <button 
                onClick={() => stergeProdus(produs.id)}
                style={{ margin: "10px", padding: "8px 12px", background: "#d9534f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", width: "calc(100% - 20px)" }}
              >
                Marchează ca Vândut (Șterge)
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
