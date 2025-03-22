const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios"); // ✅ Requerido para el webhook
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/1ebc7t08rlh3o04hy9du0ryz6uxjmbco'; // ✅ URL de tu Webhook de Make

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
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conexión exitosa a MongoDB"))
  .catch((err) => {
    console.error("Error al conectar con MongoDB:", err.message);
    process.exit(1);
  });

// Esquema y modelo de MongoDB
const EstadoSchema = new mongoose.Schema({
  paquete_id: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const randomSegment = Array.from({ length: 8 }, () =>
        characters[Math.floor(Math.random() * characters.length)]
      ).join("");

      const senderPrefix = this.sender ? this.sender.substring(0, 3).toUpperCase() : "XXX";
      const cityPrefix = this.city ? this.city.substring(0, 3).toUpperCase() : "YYY";

      return `${senderPrefix}-${cityPrefix}-${randomSegment}`;
    },
  },
  estado_actual: { type: String, default: "Recibido" },
  historial: [
    {
      estado: { type: String, required: true },
      fecha: { type: Date, default: Date.now },
    },
  ],
  sender: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
  dimensions: { type: String, required: true },
  weight: { type: String, required: true },
  quantity: { type: Number, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Estado = mongoose.model("Estado", EstadoSchema, "estados");

// Rutas de la API
app.get("/api", (req, res) => res.send("API funcionando correctamente"));

app.post("/api/packages", async (req, res) => {
  try {
    console.log("Datos recibidos en el backend:", req.body);

    const requiredFields = ["sender", "street", "postalCode", "city", "dimensions", "weight", "quantity"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `El campo ${field} es obligatorio.` });
      }
    }

    const newEstado = new Estado({
      ...req.body,
      estado_actual: "Recibido",
      historial: [{ estado: "Recibido", fecha: new Date() }],
    });

    const savedEstado = await newEstado.save();
    console.log("Paquete guardado exitosamente con ID:", savedEstado.paquete_id);

    // ✅ Enviar webhook a Make
    await axios.post(MAKE_WEBHOOK_URL, {
      paquete_id: savedEstado.paquete_id,
      ...req.body,
      createdAt: savedEstado.createdAt
    });

    res.status(201).json({
      success: true,
      paquete_id: savedEstado.paquete_id,
      ...savedEstado.toObject(),
    });
  } catch (err) {
    console.error("Error al crear paquete:", err.message);
    res.status(500).json({ error: "Error al guardar el paquete" });
  }
});

// ✅ NUEVO ENDPOINT /api/packages/extended SIN ALTERAR NADA DE LO ANTERIOR
app.post("/api/packages/extended", async (req, res) => {
  try {
    console.log("Datos recibidos en /api/packages/extended:", req.body);

    const { sender, street, postalCode, city, dimensions, weight, quantity, email, phone } = req.body;

    const requiredFields = ["sender", "street", "postalCode", "city", "dimensions", "weight", "quantity"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `El campo ${field} es obligatorio.` });
      }
    }

    if (!email) {
      return res.status(400).json({ error: "El campo email es obligatorio." });
    }

    const newEstado = new Estado({
      sender,
      street,
      postalCode,
      city,
      dimensions,
      weight,
      quantity,
      email,
      phone: phone || null,
      estado_actual: "Recibido",
      historial: [{ estado: "Recibido", fecha: new Date() }],
    });

    const savedEstado = await newEstado.save();
    console.log("Paquete (extended) guardado con ID:", savedEstado.paquete_id);

    res.status(201).json({
      success: true,
      paquete_id: savedEstado.paquete_id,
      ...savedEstado.toObject(),
    });
  } catch (err) {
    console.error("Error al crear paquete (extended):", err.message);
    res.status(500).json({ error: "Error al guardar el paquete en extended" });
  }
});

// Ruta de verificación de salud
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

// Configuración del frontend
if (process.env.NODE_ENV === "production") {
  console.log("Servidor en modo producción. Sirviendo archivos estáticos...");
  const staticPath = path.join(__dirname, "frontend", "dist");
  app.use(express.static(staticPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(staticPath, "index.html"), (err) => {
      if (err) {
        console.error("Error al servir index.html:", err.message);
        res.status(500).send("Error al servir el archivo estático.");
      }
    });
  });
} else {
  console.log("Servidor en modo desarrollo.");
  app.get("/", (req, res) => res.send("Servidor en desarrollo"));
}

// Iniciar el servidor
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
