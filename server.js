const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Verificar variables de entorno
if (!process.env.MONGO_URI) {
  console.error("Error: La variable de entorno MONGO_URI no está configurada.");
  process.exit(1);
}

console.log("Cargando variables de entorno...");
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("NODE_ENV:", process.env.NODE_ENV || "development");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conexión exitosa a MongoDB"))
  .catch((err) => {
    console.error("Error al conectar con MongoDB:", err.message);
    process.exit(1);
  });

// Esquema y modelo de MongoDB
const PackageSchema = new mongoose.Schema({
  paquete_id: { type: String, required: true },
  estado_actual: { type: String, default: "Recibido" },
  historial: [
    { estado: { type: String, required: true }, fecha: { type: Date, default: Date.now } },
  ],
  sender: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
  dimensions: { type: String, required: true },
  weight: { type: String, required: true },
  quantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Package = mongoose.model("Package", PackageSchema);

// Rutas de la API
app.get("/api", (req, res) => res.send("API funcionando correctamente"));

app.post("/api/packages", async (req, res) => {
  try {
    const { uniqueCode, ...rest } = req.body;
    if (!uniqueCode) return res.status(400).json({ error: "El uniqueCode es obligatorio." });

    const newPackage = new Package({
      paquete_id: uniqueCode,
      estado_actual: "Recibido",
      historial: [{ estado: "Recibido", fecha: new Date() }],
      ...rest,
    });

    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (err) {
    console.error("Error al crear paquete:", err.message);
    res.status(500).json({ error: "Error al guardar el paquete" });
  }
});

// Ruta de verificación de salud
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});

// Configuración del frontend
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "dist");
  app.use(express.static(staticPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(staticPath, "index.html"), (err) => {
      if (err) {
        res.status(500).send("Error al servir el archivo estático.");
      }
    });
  });
} else {
  app.get("/", (req, res) => res.send("Servidor en desarrollo"));
}

// Iniciar el servidor
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
