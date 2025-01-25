import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

const PackageLabel = ({ packageData }) => {
  const barcodeCanvasRef = useRef(); // Cambiado de SVG a canvas

  // Genera un código único basado en la información del paquete
  const uniqueCode = packageData ? generateUniqueCode(packageData) : "";

  // Renderiza el código de barras cuando uniqueCode cambia
  useEffect(() => {
    if (barcodeCanvasRef.current && uniqueCode) {
      JsBarcode(barcodeCanvasRef.current, uniqueCode, {
        format: "CODE128",
        lineColor: "#000",
        width: 4, // Más ancho
        height: 80, // Más alto
        displayValue: true,
      });
    }
  }, [uniqueCode]);

  // Manejar la generación de PDF
  const handleGeneratePDF = () => {
    if (!packageData) {
      alert("No hay datos para generar un PDF.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 30; // Posición inicial vertical

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16); // Texto más grande
    doc.text("ETIQUETA GENERADA", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    doc.setFontSize(14); // Ajuste de tamaño del texto
    doc.text(`REMITE: ${packageData.sender.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`CALLE Y NÚMERO: ${packageData.street.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`CÓDIGO POSTAL: ${packageData.postalCode.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(
      `CIUDAD: ${
        packageData.city === "otro"
          ? packageData.customCity.toUpperCase()
          : packageData.city.toUpperCase()
      }`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 10;
    doc.text(
      `DIMENSIONES: ${
        packageData.dimensions === "otro"
          ? packageData.customDimensions.toUpperCase()
          : packageData.dimensions.toUpperCase()
      }`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 10;
    doc.text(`PESO: ${packageData.weight} LB`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`CANTIDAD: ${packageData.quantity}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`CÓDIGO ÚNICO: ${uniqueCode}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // Agregar el código de barras como imagen
    const barcodeImage = barcodeCanvasRef.current.toDataURL("image/png");
    doc.addImage(barcodeImage, "PNG", pageWidth / 2 - 50, yPosition, 100, 30); // Código de barras centrado
    yPosition += 50;

    // Nombre automático del PDF: Remitente + Fecha de creación
    const date = new Date().toLocaleDateString("es-MX").replace(/\//g, "-"); // Fecha con formato dd-mm-yyyy
    const pdfName = `${packageData.sender.toUpperCase()}-${date}.pdf`;

    doc.save(pdfName);
  };

  // Manejar la impresión directa
  const handlePrint = () => {
    window.print();
  };

  if (!packageData) {
    return <p>No hay datos para mostrar. Completa el formulario para generar una etiqueta.</p>;
  }

  return (
    <div>
      <h2>Etiqueta Generada</h2>
      <p><strong>Remitente:</strong> {packageData.sender.toUpperCase()}</p>
      <p><strong>Calle y número:</strong> {packageData.street.toUpperCase()}</p>
      <p><strong>Código postal:</strong> {packageData.postalCode.toUpperCase()}</p>
      <p>
        <strong>Ciudad:</strong>{" "}
        {packageData.city === "otro"
          ? packageData.customCity.toUpperCase()
          : packageData.city.toUpperCase()}
      </p>
      <p>
        <strong>Dimensiones:</strong>{" "}
        {packageData.dimensions === "otro"
          ? packageData.customDimensions.toUpperCase()
          : packageData.dimensions.toUpperCase()}
      </p>
      <p><strong>Peso:</strong> {packageData.weight} LB</p>
      <p><strong>Cantidad:</strong> {packageData.quantity}</p>

      {/* Código único y código de barras */}
      <div>
        <p><strong>Código único:</strong> {uniqueCode}</p>
        <canvas ref={barcodeCanvasRef}></canvas>
      </div>

      {/* Botones para descargar PDF e imprimir */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleGeneratePDF} style={{ marginRight: "10px" }}>
          Descargar como PDF
        </button>
        <button onClick={handlePrint}>
          Imprimir Etiqueta
        </button>
      </div>
    </div>
  );
};

// Función para generar un código único basado en la información del paquete
function generateUniqueCode(packageData) {
  const timestamp = Date.now().toString(36); // Marca de tiempo en base 36
  const clientPrefix = packageData.sender.slice(0, 3).toUpperCase(); // Primeras 3 letras del remitente
  const cityPrefix =
    packageData.city === "otro"
      ? packageData.customCity.slice(0, 3).toUpperCase() // Primeras 3 letras de la ciudad personalizada
      : packageData.city.slice(0, 3).toUpperCase(); // Primeras 3 letras de la ciudad seleccionada
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 caracteres aleatorios

  return `${clientPrefix}-${cityPrefix}-${timestamp}-${randomString}`;
}

export default PackageLabel;
