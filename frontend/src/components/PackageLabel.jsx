import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

const PackageLabel = ({ packageData }) => {
  const barcodeCanvasRef = useRef();

  // ✅ Validación robusta de datos recibidos
  if (!packageData?.paquete_id) {
    return <p>No hay datos para mostrar. Completa el formulario para generar una etiqueta.</p>;
  }

  // ✅ Usar EXCLUSIVAMENTE el código generado por el backend
  const uniqueCode = packageData.paquete_id;

  // 🔍 Diagnóstico: Verificar coincidencia de códigos
  useEffect(() => {
    console.log("Código único recibido para etiqueta:", uniqueCode);
  }, [uniqueCode]);

  // 🔹 Generar código de barras con el ID real
  useEffect(() => {
    if (barcodeCanvasRef.current && uniqueCode) {
      JsBarcode(barcodeCanvasRef.current, uniqueCode, {
        format: "CODE128",
        lineColor: "#000",
        width: 4,
        height: 80,
        displayValue: true,
        fontOptions: "bold",
      });
    }
  }, [uniqueCode]);

  // 🔹 Generar PDF con datos consistentes
  const handleGeneratePDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 30;

    // Encabezado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ETIQUETA OFICIAL", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Datos del paquete
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

    fields.forEach(({ label, value }) => {
      doc.setFontSize(12);
      doc.text(
        `${label}: ${value.toUpperCase()}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 10;
    });

    // Código de barras
    const barcodeImage = barcodeCanvasRef.current.toDataURL("image/png");
    doc.addImage(
      barcodeImage,
      "PNG",
      pageWidth / 2 - 50,
      yPosition + 10,
      100,
      30
    );

    // Nombre del archivo
    const timestamp = new Date()
      .toLocaleString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
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
        {/* Detalles del paquete */}
        {[
          { label: "Remitente", value: packageData.sender },
          { label: "Calle y número", value: packageData.street },
          { label: "Código postal", value: packageData.postalCode },
          { label: "Ciudad", value: packageData.city },
          { label: "Dimensiones", value: packageData.dimensions },
          { label: "Peso", value: `${packageData.weight} LB` },
          { label: "Cantidad", value: packageData.quantity },
        ].map(({ label, value }) => (
          <p key={label} style={{ margin: "8px 0" }}>
            <strong>{label}:</strong> {value.toUpperCase()}
          </p>
        ))}

        {/* Sección de código único */}
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Identificador único:
          </p>
          <div style={{ fontSize: "1.2em", letterSpacing: "2px", margin: "10px 0" }}>
            {uniqueCode}
          </div>
          <canvas ref={barcodeCanvasRef} style={{ maxWidth: "100%" }}></canvas>
        </div>

        {/* Botones de acción */}
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