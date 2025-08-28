const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Product Service',
        timestamp: new Date().toISOString()
    });
});

// Sample products data
const products = [
    { id: 1, name: 'Laptop', price: 50000, category: 'electronics', stock: 10 },
    { id: 2, name: 'Smartphone', price: 25000, category: 'electronics', stock: 25 },
    { id: 3, name: 'Book', price: 500, category: 'books', stock: 100 },
    { id: 4, name: 'Desk', price: 15000, category: 'furniture', stock: 5 }
];

// Get all products
app.get('/products', (req, res) => {
    const { category, minPrice, maxPrice } = req.query;
    let filteredProducts = [...products];
    
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice));
    }
    
    if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice));
    }
    
    res.json(filteredProducts);
});

// Get product by ID
app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
});

// Create new product
app.post('/products', (req, res) => {
    const { name, price, category, stock } = req.body;
    
    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Name, price and category are required' });
    }
    
    const newProduct = {
        id: products.length + 1,
        name,
        price: parseFloat(price),
        category,
        stock: stock || 0
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Update product
app.put('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const { name, price, category, stock } = req.body;
    products[productIndex] = { 
        ...products[productIndex], 
        name, 
        price: parseFloat(price), 
        category, 
        stock: parseInt(stock) 
    };
    
    res.json(products[productIndex]);
});

// Delete product
app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    products.splice(productIndex, 1);
    res.status(204).send();
});

// Get categories
app.get('/categories', (req, res) => {
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories);
});

app.listen(PORT, () => {
    console.log(`🛍️ Product Service running on http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
