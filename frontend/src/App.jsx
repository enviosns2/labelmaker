import React, { useState } from "react";
import PackageForm from "./components/packageform";
import PackageLabel from "./components/PackageLabel";

function App() {
  const [packageData, setPackageData] = useState(null);

  const handleGenerateLabel = (data) => {
    setPackageData(data);
  };

  return (
    <div className="App" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerText}>GENERADOR DE ETIQUETAS</h1>
      </header>
      <main style={styles.main}>
        <div style={styles.column}>
          <PackageForm onGenerateLabel={handleGenerateLabel} />
        </div>
        <div style={styles.column}>
          {packageData && <PackageLabel packageData={packageData} />}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    margin: 0,
    padding: 0,
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    backgroundColor: "#000000",
    color: "white",
    padding: "1rem",
    textAlign: "center",
  },
  headerText: {
    margin: 0,
    fontSize: "1.8rem",
  },
  main: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "2rem",
    flexWrap: "wrap", // Ajuste para dispositivos móviles
  },
  column: {
    flex: 1,
    padding: "1rem",
    maxWidth: "100%", // Cambia al 100% en dispositivos móviles
    boxSizing: "border-box",
  },
};

export default App;
