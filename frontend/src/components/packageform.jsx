import React, { useState } from "react";
import axios from "axios";

const PackageForm = ({ onGenerateLabel }) => {
  const [formData, setFormData] = useState({
    sender: "",
    street: "",
    postalCode: "",
    city: "",
    customCity: "",
    dimensions: "",
    customDimensions: "",
    weight: "",
    quantity: "",
  });

  const [statusMessage, setStatusMessage] = useState(""); // Mensajes de estado
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de envío

  // URL del backend desplegado en Render
  const API_URL =
    process.env.NODE_ENV === "production"
      ? "https://labelmaker.onrender.com/api/packages"
      : "http://localhost:3000/api/packages";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      sender: "",
      street: "",
      postalCode: "",
      city: "",
      customCity: "",
      dimensions: "",
      customDimensions: "",
      weight: "",
      quantity: "",
    });
    setStatusMessage(""); // Limpia el mensaje de estado
  };

  const isFormValid = () => {
    const {
      sender,
      street,
      postalCode,
      city,
      customCity,
      dimensions,
      customDimensions,
      weight,
      quantity,
    } = formData;

    return (
      sender &&
      street &&
      postalCode &&
      weight &&
      quantity &&
      (city !== "otro" || customCity) &&
      (dimensions !== "otro" || customDimensions)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setStatusMessage("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const packageData = {
      sender: formData.sender,
      street: formData.street,
      postalCode: formData.postalCode,
      city: formData.city === "otro" ? formData.customCity : formData.city,
      dimensions:
        formData.dimensions === "otro"
          ? formData.customDimensions
          : formData.dimensions,
      weight: formData.weight,
      quantity: formData.quantity,
    };

    setStatusMessage("Enviando datos...");
    setIsSubmitting(true);

    try {
      const response = await axios.post(API_URL, packageData);
      console.log("✅ Respuesta del servidor:", response.data);

      if (response.data && response.data.paquete_id) {
        setStatusMessage("Paquete guardado con éxito.");
        onGenerateLabel(response.data); // 🔹 Enviar paquete completo con ID generado por MongoDB
        resetForm();
      } else {
        setStatusMessage("Error: La respuesta del servidor no contiene un paquete_id.");
      }
    } catch (error) {
      console.error("❌ Error al guardar el paquete:", error.response || error.message);
      setStatusMessage("Error al guardar el paquete. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "10px" }}
    >
      <div>
        <label>
          Remitente:
          <input
            type="text"
            name="sender"
            value={formData.sender}
            onChange={handleChange}
            placeholder="Nombre del remitente"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Calle y número:
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Calle y número"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Código postal:
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Código postal"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Ciudad:
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="Jalisco">Jalisco</option>
            <option value="Michoacán">Michoacán</option>
            <option value="Guanajuato">Guanajuato</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        {formData.city === "otro" && (
          <input
            type="text"
            name="customCity"
            value={formData.customCity}
            onChange={handleChange}
            placeholder="Especifica la ciudad"
            style={{ marginTop: "5px" }}
            required
          />
        )}
      </div>
      <div>
        <label>
          Dimensiones (LxWxH en pulgadas):
          <select
            name="dimensions"
            value={formData.dimensions}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="14x14x14">14x14x14</option>
            <option value="16x16x16">16x16x16</option>
            <option value="18x18x18">18x18x18</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        {formData.dimensions === "otro" && (
          <input
            type="text"
            name="customDimensions"
            value={formData.customDimensions}
            onChange={handleChange}
            placeholder="Ejemplo: 25x25x25"
            style={{ marginTop: "5px" }}
            required
          />
        )}
      </div>
      <div>
        <label>
          Peso (lb):
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Peso en libras"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Cantidad:
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Cantidad de paquetes"
            required
          />
        </label>
      </div>
      <button type="submit" style={{ marginTop: "10px" }} disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Generar Etiqueta"}
      </button>
      {/* Mostrar mensajes de estado */}
      {statusMessage && <p>{statusMessage}</p>}
    </form>
  );
};

export default PackageForm;
