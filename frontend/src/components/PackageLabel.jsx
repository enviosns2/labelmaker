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
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    let yPosition = margin;

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80); // #2c3e50
    doc.text("ETIQUETA OFICIAL", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 12;

    // Línea separadora
    doc.setDrawColor(224, 224, 224); // #e0e0e0
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Campos
    doc.setFontSize(10);
    fields.slice(0, -1).forEach(({ label, value }) => {
      if (typeof value === "string" || typeof value === "number") {
        // Label en rojo
        doc.setFont("helvetica", "bold");
        doc.setTextColor(217, 83, 79); // #d9534f
        doc.text(`${label}:`, margin, yPosition);

        // Valor en gris oscuro
        doc.setFont("helvetica", "normal");
        doc.setTextColor(44, 62, 80); // #2c3e50
        const valueText = String(value).toUpperCase();
        const valueHeight = doc.getTextDimensions(valueText, { maxWidth: contentWidth - 80 }).h;
        doc.text(valueText, margin + 80, yPosition, { maxWidth: contentWidth - 80 });

        yPosition += Math.max(7, valueHeight + 2);
      }
    });

    // Línea separadora antes del código
    yPosition += 3;
    doc.setDrawColor(224, 224, 224);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Código único - sección especial
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(217, 83, 79); // #d9534f
    doc.text("IDENTIFICADOR ÚNICO", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;

    // Código con fondo
    doc.setFillColor(245, 245, 245); // #f5f5f5
    doc.rect(margin + 10, yPosition, contentWidth - 20, 10, "F");
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text(uniqueCode, pageWidth / 2, yPosition + 6, { align: "center" });
    yPosition += 15;

    // Código de barras
    try {
      const barcodeImage = barcodeCanvasRef.current.toDataURL("image/png");
      const barcodeWidth = 80;
      const barcodeHeight = 40;
      doc.addImage(
        barcodeImage,
        "PNG",
        pageWidth / 2 - barcodeWidth / 2,
        yPosition,
        barcodeWidth,
        barcodeHeight
      );
      yPosition += barcodeHeight + 5;
    } catch (error) {
      console.error("Error agregando código de barras al PDF:", error);
    }

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
      fontSize: "1.5rem",
      marginBottom: "1.5rem",
      fontWeight: "700",
      margin: "0 0 1.5rem 0",
      letterSpacing: "0.5px",
    },
    labelBox: {
      backgroundColor: "#ffffff",
      padding: "1.5rem",
      borderRadius: "4px",
      maxWidth: "100%",
      boxSizing: "border-box",
      width: "100%",
      border: "1px solid #e0e0e0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    fieldLabel: {
      fontWeight: 700,
      color: "#d9534f",
      marginRight: "8px",
      display: "block",
    },
    fieldValue: {
      color: "#2c3e50",
      wordBreak: "break-word",
      whiteSpace: "pre-wrap",
      fontWeight: "500",
      display: "block",
      marginTop: "4px",
    },
    fieldItem: {
      margin: "12px 0",
      fontSize: "0.95rem",
      lineHeight: "1.6",
      wordBreak: "break-word",
      borderBottom: "1px solid #f0f0f0",
      paddingBottom: "10px",
    },
    fieldItemLast: {
      borderBottom: "none",
    },
    barcodeSection: {
      margin: "20px 0 0 0",
      textAlign: "center",
      paddingTop: "15px",
      borderTop: "2px solid #f0f0f0",
    },
    barcodeSectionTitle: {
      fontWeight: 700,
      marginBottom: "10px",
      fontSize: "0.95rem",
      margin: "0 0 15px 0",
      color: "#d9534f",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    barcodeCode: {
      fontSize: "1rem",
      letterSpacing: "3px",
      margin: "12px 0",
      fontFamily: "'Courier New', monospace",
      padding: "12px",
      backgroundColor: "#f9f9f9",
      borderRadius: "4px",
      border: "1px solid #ddd",
      wordBreak: "break-all",
      fontWeight: "600",
      color: "#2c3e50",
    },
    barcodeCanvas: {
      maxWidth: "100%",
      height: "auto",
      display: "block",
      margin: "10px auto",
    },
    buttonContainer: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      marginTop: "20px",
      flexWrap: "wrap",
      padding: "0 1rem",
      boxSizing: "border-box",
    },
    button: {
      padding: "12px 20px",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: "700",
      minHeight: "44px",
      minWidth: "44px",
      transition: "all 0.3s ease",
      flex: "1 1 calc(50% - 6px)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
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
          {fields.map(({ label, value }, index) => (
            <p
              key={label}
              style={{
                ...labelStyles.fieldItem,
                ...(index === fields.length - 1 ? labelStyles.fieldItemLast : {}),
              }}
            >
              <span style={labelStyles.fieldLabel}>{label}:</span>
              <span style={labelStyles.fieldValue}>{typeof value === "string" ? value : value}</span>
            </p>
          ))}
          <div style={labelStyles.barcodeSection}>
            <p style={labelStyles.barcodeSectionTitle}>Identificador único</p>
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
