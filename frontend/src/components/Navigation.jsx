import React from "react";

const Navigation = ({ activeTab, onTabChange, hasPackageData }) => {
  const navStyles = {
    nav: {
      display: "flex",
      backgroundColor: "#2c3e50",
      borderBottom: "3px solid #27ae60",
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
      backgroundColor: "rgba(255,255,255,0.1)",
      color: "white",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "700",
      whiteSpace: "nowrap",
      borderRadius: "0",
      transition: "all 0.3s ease",
      minWidth: "fit-content",
      minHeight: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderBottom: "3px solid transparent",
    },
    tabActive: {
      backgroundColor: "#27ae60",
      color: "white",
      borderBottom: "3px solid #27ae60",
      boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.1)",
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
