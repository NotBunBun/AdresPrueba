const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
const dataFilePath = __dirname + "/acquisitions.json";

function readData() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

// GET - Listar todas las adquisiciones
app.get("/adquisiciones", (req, res) => {
  const acquisitions = readData();
  res.json(acquisitions);
});

// GET - Obtener una adquisición por ID
app.get("/adquisiciones/:id", (req, res) => {
  const { id } = req.params;
  const acquisitions = readData();
  const acquisition = acquisitions.find((a) => a.id === parseInt(id));
  if (acquisition) {
    res.json(acquisition);
  } else {
    res.status(404).json({ message: "Adquisición no encontrada" });
  }
});

// POST - Crear una nueva adquisición
app.post("/adquisiciones", (req, res) => {
  const acquisitions = readData();
  const newId =
    acquisitions.length > 0 ? acquisitions[acquisitions.length - 1].id + 1 : 1;

  const newAcquisition = {
    id: newId,
    budget: req.body.budget,
    unit: req.body.unit,
    type: req.body.type,
    quantity: req.body.quantity,
    unitValue: req.body.unitValue,
    totalValue: req.body.totalValue,
    acquisitionDate: req.body.acquisitionDate,
    provider: req.body.provider,
    documentation: req.body.documentation,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  acquisitions.push(newAcquisition);
  writeData(acquisitions);
  res.status(201).json(newAcquisition);
});

// PUT - Actualizar una adquisición
app.put("/adquisiciones/:id", (req, res) => {
  const { id } = req.params;
  const acquisitions = readData();
  const index = acquisitions.findIndex((a) => a.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: "Adquisición no encontrada" });
  }

  acquisitions[index] = {
    ...acquisitions[index],
    budget: req.body.budget,
    unit: req.body.unit,
    type: req.body.type,
    quantity: req.body.quantity,
    unitValue: req.body.unitValue,
    totalValue: req.body.totalValue,
    acquisitionDate: req.body.acquisitionDate,
    provider: req.body.provider,
    documentation: req.body.documentation,
    updatedAt: new Date().toISOString(),
  };

  writeData(acquisitions);
  res.json(acquisitions[index]);
});

// PATCH - Desactivar una adquisición
app.patch("/adquisiciones/:id", (req, res) => {
  const { id } = req.params;
  const acquisitions = readData();
  const index = acquisitions.findIndex((a) => a.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: "Adquisición no encontrada" });
  }

  // Solo actualiza las propiedades enviadas
  for (const prop in req.body) {
    acquisitions[index][prop] = req.body[prop];
  }
  acquisitions[index].updatedAt = new Date().toISOString();

  writeData(acquisitions);
  res.json(acquisitions[index]);
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
