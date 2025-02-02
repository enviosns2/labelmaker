import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

const PackageLabel = ({ packageData }) => {
  const barcodeCanvasRef = useRef();

  // ✅ Validar datos antes de renderizar
  if (!packageData || typeof packageData.paquete_id !== "string") {
    return <p>No hay datos para mostrar. Completa el formulario para generar una etiqueta.</p>;
  }

  const uniqueCode = packageData.paquete_id;

  useEffect(() => {
    console.log("Código único recibido:", uniqueCode);
  }, [uniqueCode]);

  useEffect(() => {
    if (barcodeCanvasRef.current && uniqueCode) {
      try {
        JsBarcode(barcodeCanvasRef.current, uniqueCode, {
          format: "CODE128",
          lineColor: "#000",
          width: 4,
          height: 80,
          displayValue: true,
          fontOptions: "bold",
        });
      } catch (error) {
        console.error("Error generando código de barras:", error);
      }
    }
  }, [uniqueCode]);

  // ✅ Declarar fields antes de su uso
  const fields = [
    { label: "REMITE", value: packageData.sender },
    { label: "CALLE Y NÚMERO", value: packageData.street },
    { label: "CÓDIGO POSTAL", value: packageData.postalCode },
    { label: "CIUDAD", value: packageData.city },
    { label: "DIMENSIONES", value: packageData.dimensions },
    { label: "PESO", value: `${packageData.weight} LB` },
    { label: "CANTIDAD", value: packageData.quantity },
    { label: "CÓDIGO ÚNICO", value: uniqueCode },
  ];

  const handleGeneratePDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ETIQUETA OFICIAL", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    fields.forEach(({ label, value }) => {
      if (typeof value === "string" || typeof value === "number") {
        doc.setFontSize(12);
        doc.text(
          `${label}: ${String(value).toUpperCase()}`,
          pageWidth / 2,
          yPosition,
          { align: "center" }
        );
        yPosition += 10;
      }
    });

    try {
      const barcodeImage = barcodeCanvasRef.current.toDataURL("image/png");
      doc.addImage(barcodeImage, "PNG", pageWidth / 2 - 50, yPosition + 10, 100, 30);
    } catch (error) {
      console.error("Error agregando código de barras al PDF:", error);
    }

    const timestamp = new Date()
      .toLocaleString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .replace(/[/:,]/g, "-");
    doc.save(`${uniqueCode}-${timestamp}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Etiqueta Generada</h2>

      <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
        {fields.map(({ label, value }) => (
          <p key={label} style={{ margin: "8px 0" }}>
            <strong>{label}:</strong> {typeof value === "string" ? value.toUpperCase() : value}
          </p>
        ))}

        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>Identificador único:</p>
          <div style={{ fontSize: "1.2em", letterSpacing: "2px", margin: "10px 0" }}>{uniqueCode}</div>
          <canvas ref={barcodeCanvasRef} style={{ maxWidth: "100%" }}></canvas>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={handleGeneratePDF}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Descargar PDF
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: "10px 20px",
              backgroundColor: "#27ae60",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageLabel;
