import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

const PackageLabel = ({ packageData }) => {
  const barcodeCanvasRef = useRef(); // Se usa un <canvas> para generar el código de barras

  // ✅ Verificar si packageData contiene datos antes de acceder a ellos
  if (!packageData || !packageData.paquete_id) {
    return <p>No hay datos para mostrar. Completa el formulario para generar una etiqueta.</p>;
  }

  // ✅ Usar el código único registrado en MongoDB, sin regenerarlo
  const uniqueCode = packageData.paquete_id;

  // 🔍 Registro en consola para diagnóstico
  useEffect(() => {
    console.log("Código recibido en PackageLabel:", uniqueCode);
  }, [uniqueCode]);

  // 🔹 Generar código de barras en el <canvas>
  useEffect(() => {
    if (barcodeCanvasRef.current && uniqueCode) {
      JsBarcode(barcodeCanvasRef.current, uniqueCode, {
        format: "CODE128",
        lineColor: "#000",
        width: 4,
        height: 80,
        displayValue: true,
      });
    }
  }, [uniqueCode]);

  // 🔹 Generar PDF con la etiqueta
  const handleGeneratePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ETIQUETA GENERADA", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    doc.setFontSize(14);
    doc.text(`REMITE: ${packageData.sender.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`CALLE Y NÚMERO: ${packageData.street.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`CÓDIGO POSTAL: ${packageData.postalCode.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`CIUDAD: ${packageData.city.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`DIMENSIONES: ${packageData.dimensions.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`PESO: ${packageData.weight} LB`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`CANTIDAD: ${packageData.quantity}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    doc.text(`CÓDIGO ÚNICO: ${uniqueCode}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // 🔹 Agregar código de barras
    const barcodeImage = barcodeCanvasRef.current.toDataURL("image/png");
    doc.addImage(barcodeImage, "PNG", pageWidth / 2 - 50, yPosition, 100, 30);
    yPosition += 50;

    // 🔹 Generar nombre automático del archivo
    const date = new Date().toLocaleDateString("es-MX").replace(/\//g, "-");
    const pdfName = `${packageData.sender.toUpperCase()}-${date}.pdf`;

    doc.save(pdfName);
  };

  // 🔹 Función para imprimir directamente
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <h2>Etiqueta Generada</h2>
      <p><strong>Remitente:</strong> {packageData.sender.toUpperCase()}</p>
      <p><strong>Calle y número:</strong> {packageData.street.toUpperCase()}</p>
      <p><strong>Código postal:</strong> {packageData.postalCode.toUpperCase()}</p>
      <p><strong>Ciudad:</strong> {packageData.city.toUpperCase()}</p>
      <p><strong>Dimensiones:</strong> {packageData.dimensions.toUpperCase()}</p>
      <p><strong>Peso:</strong> {packageData.weight} LB</p>
      <p><strong>Cantidad:</strong> {packageData.quantity}</p>

      {/* Código único y código de barras */}
      <div>
        <p><strong>Código único:</strong> {uniqueCode}</p>
        <canvas ref={barcodeCanvasRef}></canvas>
      </div>

      {/* Botones de descarga e impresión */}
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

export default PackageLabel;
