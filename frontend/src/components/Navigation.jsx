import React from "react";

const Navigation = ({ activeTab, onTabChange, hasPackageData }) => {
  const navStyles = {
    nav: {
      display: "flex",
      backgroundColor: "#000000",
      borderBottom: "3px solid #014235",
      marginBottom: "1rem",
      gap: "0.25rem",
      padding: "0.5rem",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      justifyContent: "flex-start",
      flexWrap: "nowrap",
    },
    tab: {
      padding: "0.75rem 1.25rem",
      border: "none",
      backgroundColor: "#333333",
      color: "white",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "600",
      whiteSpace: "nowrap",
      borderRadius: "4px 4px 0 0",
      transition: "all 0.3s ease",
      minWidth: "fit-content",
      minHeight: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderBottom: "3px solid transparent",
    },
    tabActive: {
      backgroundColor: "#014235",
      color: "white",
      borderBottom: "3px solid #fff",
      boxShadow: "0 -2px 4px rgba(0,0,0,0.2)",
    },
    tabDisabled: {
      opacity: "0.5",
      cursor: "not-allowed",
    },
  };

  const tabs = [
    { id: "form", label: "📋 Formulario", enabled: true },
    { id: "label", label: "🏷️ Etiqueta", enabled: hasPackageData },
  ];

  return (
    <nav style={navStyles.nav} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          style={{
            ...navStyles.tab,
            ...(activeTab === tab.id ? navStyles.tabActive : {}),
            ...(tab.enabled ? {} : navStyles.tabDisabled),
          }}
          onClick={() => tab.enabled && onTabChange(tab.id)}
          disabled={!tab.enabled}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
