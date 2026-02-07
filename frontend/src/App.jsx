import React, { useState, useEffect } from "react";
import PackageForm from "./components/packageform";
import PackageLabel from "./components/PackageLabel";
import Navigation from "./components/Navigation";

function App() {
  const [packageData, setPackageData] = useState(null);
  const [activeTab, setActiveTab] = useState("form");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleGenerateLabel = (data) => {
    setPackageData(data);
    // En móvil, cambiar automáticamente a la pestaña de etiqueta
    if (isMobile) {
      setActiveTab("label");
    }
  };

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="App" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerText}>GENERADOR DE ETIQUETAS</h1>
      </header>

      {isMobile ? (
        // Diseño para móvil: navegación por pestañas
        <>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} hasPackageData={!!packageData} />
          <main style={styles.mainMobile}>
            {activeTab === "form" && (
              <div id="form-panel" style={styles.panel}>
                <PackageForm onGenerateLabel={handleGenerateLabel} />
              </div>
            )}
            {activeTab === "label" && packageData && (
              <div id="label-panel" style={styles.panel}>
                <PackageLabel packageData={packageData} />
              </div>
            )}
          </main>
        </>
      ) : (
        // Diseño desktop: lado a lado
        <main style={styles.main}>
          <div style={styles.column}>
            <PackageForm onGenerateLabel={handleGenerateLabel} />
          </div>
          <div style={styles.column}>
            {packageData && <PackageLabel packageData={packageData} />}
          </div>
        </main>
      )}
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
    display: "flex",
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#000000",
    color: "white",
    padding: "1rem",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
    flexWrap: "wrap",
    gap: "2rem",
  },
  mainMobile: {
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    flex: 1,
  },
  panel: {
    width: "100%",
    animation: "fadeIn 0.3s ease",
  },
  column: {
    flex: 1,
    padding: "1rem",
    maxWidth: "100%",
    boxSizing: "border-box",
  },
};

export default App;
