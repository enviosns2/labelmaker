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

  const [isLoading, setIsLoading] = useState(false); // Indicador de carga
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error

  // URL del backend desplegado
  const API_URL = "https://labelmaker.onrender.com/api/packages";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage(""); // Limpia el mensaje de error al escribir
  };

  const generateUniqueCode = (data) => {
    const timestamp = Date.now().toString(36);
    const clientPrefix = data.sender.slice(0, 3).toUpperCase();
    const cityPrefix =
      data.city === "otro"
        ? data.customCity.slice(0, 3).toUpperCase()
        : data.city.slice(0, 3).toUpperCase();
    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${clientPrefix}-${cityPrefix}-${timestamp}-${randomString}`;
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
      setErrorMessage("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const uniqueCode = generateUniqueCode(formData);

    const packageData = {
      paquete_id: uniqueCode,
      uniqueCode,
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

    console.log("[DEBUG] Enviando datos al backend:", packageData);
    setIsLoading(true);

    try {
      const response = await axios.post(API_URL, packageData);
      console.log("[DEBUG] Respuesta del backend:", response.data);

      alert("Paquete guardado con éxito.");
      onGenerateLabel(packageData); // Mostrar en el frontend
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
    } catch (error) {
      console.error("[DEBUG] Error en la solicitud POST:", error.response || error.message);
      setErrorMessage(
        "Hubo un error al guardar el paquete. Por favor, revisa la consola para más detalles."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h2>Generar Etiqueta</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
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
          Dimensiones:
          <select
            name="dimensions"
            value={formData.dimensions}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="14x14x14">14x14x14</option>
            <option value="16x16x16">16x16x16</option>
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
      <button type="submit" disabled={isLoading} style={{ marginTop: "10px" }}>
        {isLoading ? "Guardando..." : "Generar Etiqueta"}
      </button>
    </form>
  );
};

export default PackageForm;
