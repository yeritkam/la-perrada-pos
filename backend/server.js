const express = require("express");
const cors = require("cors");
const products = require("./products");

const app = express();
app.use(cors());
app.use(express.json());

// Ruta para obtener los productos del archivo products.js
app.get("/products", (req, res) => {
  res.json(products);
});

app.listen(3001, () => {
  console.log("Backend funcionando en http://localhost:3001");
});
