import React, { useState } from "react";
import axios from "axios";

const PackageForm = ({ onGenerateLabel }) => {
  const [formData, setFormData] = useState({
    recipient: "",
    agency: "",
    street: "",
    colonia: "", // Nuevo campo
    postalCode: "",
    city: "",
    customCity: "",
    dimensions: "",
    customDimensions: "",
    weight: "",
    quantity: "",
    email: "",
    phone: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      recipient: "",
      agency: "",
      street: "",
      colonia: "",
      postalCode: "",
      city: "",
      customCity: "",
      dimensions: "",
      customDimensions: "",
      weight: "",
      quantity: "",
      email: "",
      phone: "",
    });
    setStatusMessage("");
  };

  const isFormValid = () => {
    const {
      recipient,
      agency,
      street,
      colonia,
      postalCode,
      city,
      customCity,
      dimensions,
      customDimensions,
      weight,
      quantity,
      email,
      phone,
    } = formData;

    return (
      recipient &&
      agency &&
      street &&
      colonia &&
      postalCode &&
      weight &&
      quantity &&
      email &&
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
      recipient: formData.recipient,
      agency: formData.agency,
      street: formData.street,
      colonia: formData.colonia,
      postalCode: formData.postalCode,
      city:
        formData.city === "otro"
          ? formData.customCity
          : formData.city,
      dimensions:
        formData.dimensions === "otro"
          ? formData.customDimensions
          : formData.dimensions,
      weight: formData.weight,
      quantity: formData.quantity,
      email: formData.email,
      phone: formData.phone,
    };

    setStatusMessage("Enviando datos...");
    setIsSubmitting(true);

    try {
      const response = await axios.post(API_URL, packageData);
      console.log("✅ Respuesta del servidor:", response.data);

      if (response.data && response.data.paquete_id) {
        setStatusMessage("Paquete guardado con éxito.");
        onGenerateLabel(response.data);
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
          Destinatario:
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="Nombre del destinatario"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Agencia:
          <input
            type="text"
            name="agency"
            value={formData.agency}
            onChange={handleChange}
            placeholder="Nombre de la agencia"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Correo electrónico:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Teléfono:
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Número telefónico"
          />
        </label>
      </div>
      <div>
        <label>
          Estado:
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
          Colonia:
          <input
            type="text"
            name="colonia"
            value={formData.colonia}
            onChange={handleChange}
            placeholder="Colonia"
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
            <option value="20x20x20">20x20x20</option>
            <option value="18x18x27">18x18x27</option>
            <option value="22x22x22">22x22x22</option>
            <option value="24x24x24">24x24x24</option>
            <option value="24x24x30">24x24x30</option>
            <option value="27x27x27">27x27x27</option>
            <option value="30x30x30">30x30x30</option>
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
      <button
        type="submit"
        style={{
          marginTop: "10px",
          backgroundColor: "#014235",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : "Generar Etiqueta"}
      </button>
      {statusMessage && <p>{statusMessage}</p>}
    </form>
  );
};

export default PackageForm;
