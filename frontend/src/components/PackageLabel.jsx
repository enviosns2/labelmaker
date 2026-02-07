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
    { label: "DESTINATARIO", value: packageData.recipient },
    { label: "AGENCIA", value: packageData.agency },
    { label: "CORREO ELECTRÓNICO", value: packageData.email },
    { label: "TELÉFONO", value: packageData.phone }, // Añadido el número telefónico
    { label: "PAÍS DESTINO", value: packageData.destinationCountry },
    { label: "ESTADO", value: packageData.city },
    { label: "CALLE Y NÚMERO", value: packageData.street },
    { label: "COLONIA", value: packageData.colonia },
    { label: "CÓDIGO POSTAL", value: packageData.postalCode },
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

  // Imprimir solo la etiqueta
  const handlePrint = () => {
    const printContents = document.getElementById("print-label").innerHTML;
    const barcodeCanvas = barcodeCanvasRef.current;

    let barcodeImageHTML = "";
    if (barcodeCanvas) {
      const barcodeImage = barcodeCanvas.toDataURL("image/png");
      barcodeImageHTML = `<img src="${barcodeImage}" alt="Código de barras" style="max-width:100%; margin:20px 0;"/>`;
    }

    const win = window.open("", "", "height=700,width=700");
    win.document.write("<html><head><title>Etiqueta Oficial</title>");
    win.document.write(`
      <style>
        @page {
          margin: 10mm;
          size: A4;
        }
        body {
          margin: 0;
          padding: 10px;
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
        p {
          margin: 8px 0;
          line-height: 1.4;
        }
        .barcode {
          margin: 20px 0;
          text-align: center;
        }
        h2 {
          margin: 10px 0;
          font-size: 18px;
        }
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
        }
      </style>
    `);
    win.document.write("</head><body>");
    win.document.write(printContents);
    win.document.write(barcodeImageHTML);
    win.document.write("</body></html>");
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  // Estilos optimizados para móvil
  const labelStyles = {
    container: {
      padding: "0 1rem 1rem 1rem",
      width: "100%",
      boxSizing: "border-box",
    },
    title: {
      textAlign: "center",
      color: "#2c3e50",
      fontSize: "1.3rem",
      marginBottom: "1rem",
      fontWeight: "bold",
      margin: "0 0 1rem 0",
    },
    labelBox: {
      backgroundColor: "#f8f9fa",
      padding: "1.25rem",
      borderRadius: "8px",
      maxWidth: "100%",
      boxSizing: "border-box",
      width: "100%",
    },
    fieldLabel: {
      fontWeight: "bold",
      color: "#333",
      marginRight: "0.5rem",
    },
    fieldValue: {
      color: "#666",
      wordBreak: "break-word",
      whiteSpace: "pre-line",
    },
    fieldItem: {
      margin: "10px 0",
      fontSize: "0.95rem",
      lineHeight: "1.4",
      wordBreak: "break-word",
    },
    barcodeSection: {
      margin: "20px 0 0 0",
      textAlign: "center",
      paddingTop: "15px",
      borderTop: "1px solid #ddd",
    },
    barcodeSectionTitle: {
      fontWeight: "bold",
      marginBottom: "10px",
      fontSize: "0.9rem",
      margin: "0 0 10px 0",
    },
    barcodeCode: {
      fontSize: "1.1rem",
      letterSpacing: "2px",
      margin: "10px 0",
      fontFamily: "monospace",
      padding: "10px",
      backgroundColor: "#fff",
      borderRadius: "4px",
      border: "1px solid #ddd",
      wordBreak: "break-all",
    },
    barcodeCanvas: {
      maxWidth: "100%",
      height: "auto",
      display: "block",
    },
    buttonContainer: {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      marginTop: "15px",
      flexWrap: "wrap",
      padding: "0 1rem",
      boxSizing: "border-box",
    },
    button: {
      padding: "12px 20px",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: "600",
      minHeight: "44px",
      minWidth: "44px",
      transition: "all 0.3s ease",
      flex: "1 1 calc(50% - 5px)",
    },
    pdfButton: {
      backgroundColor: "#3498db",
    },
    printButton: {
      backgroundColor: "#27ae60",
    },
  };

  return (
    <div style={labelStyles.container}>
      <div id="print-label" style={labelStyles.labelBox}>
        <h2 style={labelStyles.title}>Etiqueta Oficial</h2>
        <div>
          {fields.map(({ label, value }) => (
            <p
              key={label}
              style={labelStyles.fieldItem}
            >
              <span style={labelStyles.fieldLabel}>{label}:</span>
              <span style={labelStyles.fieldValue}> {typeof value === "string" ? value : value}</span>
            </p>
          ))}
          <div style={labelStyles.barcodeSection}>
            <p style={labelStyles.barcodeSectionTitle}>Identificador único:</p>
            <div style={labelStyles.barcodeCode}>{uniqueCode}</div>
            <canvas ref={barcodeCanvasRef} style={labelStyles.barcodeCanvas}></canvas>
          </div>
        </div>
      </div>
      <div style={labelStyles.buttonContainer}>
        <button
          onClick={handleGeneratePDF}
          style={{
            ...labelStyles.button,
            ...labelStyles.pdfButton,
          }}
        >
          📥 Descargar PDF
        </button>
        <button
          onClick={handlePrint}
          style={{
            ...labelStyles.button,
            ...labelStyles.printButton,
          }}
        >
          🖨️ Imprimir
        </button>
      </div>
    </div>
  );
};

export default PackageLabel;
