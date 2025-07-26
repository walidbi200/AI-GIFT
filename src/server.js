// src/server.js

const express = require('express');
const productsRouter = require('./routes/products');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the products router
app.use(productsRouter);

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 