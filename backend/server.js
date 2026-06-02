// server.js - Complete backend with MySQL, Express, JWT Authentication, and CRUD APIs
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT =5000;
const JWT_SECRET ='your_secret_key_change_this';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password: '',
    database:'SRMS',
   
});

// ==================== DATABASE SCHEMA INITIALIZATION ====================
async function initializeDatabase() {
    try {
        // Create database if not exists
        await pool.query(`CREATE DATABASE IF NOT EXISTS SRMS`);
        await pool.query(`USE SRMS`);

        // 1. Customer Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Customer (
                customerNumber INT PRIMARY KEY AUTO_INCREMENT,
                firstName VARCHAR(50) NOT NULL,
                lastName VARCHAR(50) NOT NULL,
                telephone VARCHAR(20),
                address TEXT
            )
        `);

        // 2. Product Table (extended with quantityInStock for inventory management)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Product (
                productCode VARCHAR(20) PRIMARY KEY,
                productName VARCHAR(100) NOT NULL,
                quantitySold INT DEFAULT 0,
                unitPrice DECIMAL(10,2) NOT NULL,
                quantityInStock INT DEFAULT 0
            )
        `);

        // 3. Sale Table (Foreign Key to Customer)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Sale (
                invoiceNumber VARCHAR(20) PRIMARY KEY,
                salesDate DATE NOT NULL,
                paymentMethod ENUM('Cash', 'Credit Card', 'Debit Card', 'Online') NOT NULL,
                totalAmountPaid DECIMAL(10,2) DEFAULT 0,
                customerNumber INT NOT NULL,
                FOREIGN KEY (customerNumber) REFERENCES Customer(customerNumber) ON DELETE RESTRICT
            )
        `);

        // 4. SaleItem Table (Junction table for many-to-many between Sale and Product)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS SaleItem (
                invoiceNumber VARCHAR(20),
                productCode VARCHAR(20),
                quantity INT NOT NULL,
                priceAtSale DECIMAL(10,2) NOT NULL,
                PRIMARY KEY (invoiceNumber, productCode),
                FOREIGN KEY (invoiceNumber) REFERENCES Sale(invoiceNumber) ON DELETE CASCADE,
                FOREIGN KEY (productCode) REFERENCES Product(productCode) ON DELETE RESTRICT
            )
        `);

        // 5. Users Table for authentication
        await pool.query(`
            CREATE TABLE IF NOT EXISTS User (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                passwordHash VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Database tables initialized successfully');

        // ==================== RELATIONSHIP ANALYSIS ====================
        console.log(`
        ========== RELATIONSHIP ANALYSIS ==========
        1. Customer (1) ----< (N) Sale
           - One customer can have many sales
           - Foreign key: Sale.customerNumber references Customer.customerNumber
        
        2. Sale (1) ----< (N) SaleItem
           - One sale can contain many product line items
           - Foreign key: SaleItem.invoiceNumber references Sale.invoiceNumber
        
        3. Product (1) ----< (N) SaleItem
           - One product can appear in many sale items
           - Foreign key: SaleItem.productCode references Product.productCode
        
        * Sale and Product have a Many-to-Many relationship through SaleItem
        * Product.quantitySold is updated automatically based on SaleItem quantities
        * Sale.totalAmountPaid is calculated as sum of (quantity * priceAtSale) for all SaleItems
        =============================================
        `);
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

// ==================== MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// ==================== AUTHENTICATION APIs ====================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO User (username, passwordHash) VALUES (?, ?)',
            [username, passwordHash]
        );
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Username already exists' });
        } else {
            res.status(500).json({ message: 'Registration failed', error: error.message });
        }
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await pool.query('SELECT * FROM User WHERE username = ?', [username]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// ==================== CUSTOMER APIs ====================
app.get('/api/customers', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Customer ORDER BY customerNumber DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
});

app.post('/api/customers', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, telephone, address } = req.body;
        const [result] = await pool.query(
            'INSERT INTO Customer (firstName, lastName, telephone, address) VALUES (?, ?, ?, ?)',
            [firstName, lastName, telephone, address]
        );
        const [newCustomer] = await pool.query('SELECT * FROM Customer WHERE customerNumber = ?', [result.insertId]);
        res.status(201).json(newCustomer[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer', error: error.message });
    }
});

app.put('/api/customers/:customerNumber', authenticateToken, async (req, res) => {
    try {
        const { customerNumber } = req.params;
        const { firstName, lastName, telephone, address } = req.body;
        await pool.query(
            'UPDATE Customer SET firstName = ?, lastName = ?, telephone = ?, address = ? WHERE customerNumber = ?',
            [firstName, lastName, telephone, address, customerNumber]
        );
        const [updated] = await pool.query('SELECT * FROM Customer WHERE customerNumber = ?', [customerNumber]);
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
});

app.delete('/api/customers/:customerNumber', authenticateToken, async (req, res) => {
    try {
        const { customerNumber } = req.params;
        await pool.query('DELETE FROM Customer WHERE customerNumber = ?', [customerNumber]);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error: error.message });
    }
});

// ==================== PRODUCT APIs ====================
app.get('/api/products', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Product ORDER BY productCode');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        const { productCode, productName, quantitySold, unitPrice, quantityInStock } = req.body;
        const [result] = await pool.query(
            'INSERT INTO Product (productCode, productName, quantitySold, unitPrice, quantityInStock) VALUES (?, ?, ?, ?, ?)',
            [productCode, productName, quantitySold || 0, unitPrice, quantityInStock || 0]
        );
        const [newProduct] = await pool.query('SELECT * FROM Product WHERE productCode = ?', [productCode]);
        res.status(201).json(newProduct[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

app.put('/api/products/:productCode', authenticateToken, async (req, res) => {
    try {
        const { productCode } = req.params;
        const { productName, quantitySold, unitPrice, quantityInStock } = req.body;
        await pool.query(
            'UPDATE Product SET productName = ?, quantitySold = ?, unitPrice = ?, quantityInStock = ? WHERE productCode = ?',
            [productName, quantitySold, unitPrice, quantityInStock, productCode]
        );
        const [updated] = await pool.query('SELECT * FROM Product WHERE productCode = ?', [productCode]);
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

app.delete('/api/products/:productCode', authenticateToken, async (req, res) => {
    try {
        const { productCode } = req.params;
        await pool.query('DELETE FROM Product WHERE productCode = ?', [productCode]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// ==================== SALE APIs ====================
// Get all sales with customer info
app.get('/api/sales', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, CONCAT(c.firstName, ' ', c.lastName) as customerName 
            FROM Sale s
            JOIN Customer c ON s.customerNumber = c.customerNumber
            ORDER BY s.salesDate DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales', error: error.message });
    }
});

// Get single sale with items
app.get('/api/sales/:invoiceNumber', authenticateToken, async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const [saleRows] = await pool.query(`
            SELECT s.*, CONCAT(c.firstName, ' ', c.lastName) as customerName 
            FROM Sale s
            JOIN Customer c ON s.customerNumber = c.customerNumber
            WHERE s.invoiceNumber = ?
        `, [invoiceNumber]);
        
        if (saleRows.length === 0) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        
        const [items] = await pool.query(`
            SELECT si.*, p.productName, p.unitPrice as currentPrice
            FROM SaleItem si
            JOIN Product p ON si.productCode = p.productCode
            WHERE si.invoiceNumber = ?
        `, [invoiceNumber]);
        
        res.json({ ...saleRows[0], items });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sale', error: error.message });
    }
});

// Create sale with items
app.post('/api/sales', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { invoiceNumber, salesDate, paymentMethod, customerNumber, items } = req.body;
        
        if (!items || items.length === 0) {
            throw new Error('Sale must have at least one item');
        }
        
        // Calculate total amount
        let totalAmount = 0;
        for (const item of items) {
            const [product] = await connection.query(
                'SELECT unitPrice, quantityInStock FROM Product WHERE productCode = ?',
                [item.productCode]
            );
            if (product.length === 0) {
                throw new Error(`Product ${item.productCode} not found`);
            }
            if (product[0].quantityInStock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.productCode}`);
            }
            const price = item.priceAtSale || product[0].unitPrice;
            totalAmount += price * item.quantity;
        }
        
        // Insert sale
        await connection.query(
            'INSERT INTO Sale (invoiceNumber, salesDate, paymentMethod, totalAmountPaid, customerNumber) VALUES (?, ?, ?, ?, ?)',
            [invoiceNumber, salesDate, paymentMethod, totalAmount, customerNumber]
        );
        
        // Insert sale items and update product stock/sold
        for (const item of items) {
            const [product] = await connection.query(
                'SELECT unitPrice FROM Product WHERE productCode = ?',
                [item.productCode]
            );
            const priceAtSale = item.priceAtSale || product[0].unitPrice;
            
            await connection.query(
                'INSERT INTO SaleItem (invoiceNumber, productCode, quantity, priceAtSale) VALUES (?, ?, ?, ?)',
                [invoiceNumber, item.productCode, item.quantity, priceAtSale]
            );
            
            // Update product: decrease stock, increase quantitySold
            await connection.query(
                'UPDATE Product SET quantityInStock = quantityInStock - ?, quantitySold = quantitySold + ? WHERE productCode = ?',
                [item.quantity, item.quantity, item.productCode]
            );
        }
        
        await connection.commit();
        res.status(201).json({ message: 'Sale created successfully', invoiceNumber });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error creating sale', error: error.message });
    } finally {
        connection.release();
    }
});

// Update sale (only header info, not items)
app.put('/api/sales/:invoiceNumber', authenticateToken, async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const { salesDate, paymentMethod, customerNumber } = req.body;
        await pool.query(
            'UPDATE Sale SET salesDate = ?, paymentMethod = ?, customerNumber = ? WHERE invoiceNumber = ?',
            [salesDate, paymentMethod, customerNumber, invoiceNumber]
        );
        res.json({ message: 'Sale updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating sale', error: error.message });
    }
});

// Delete sale (cascade deletes sale items)
app.delete('/api/sales/:invoiceNumber', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { invoiceNumber } = req.params;
        
        // Get sale items to restore product stock
        const [items] = await connection.query('SELECT productCode, quantity FROM SaleItem WHERE invoiceNumber = ?', [invoiceNumber]);
        
        // Restore product stock and adjust quantitySold
        for (const item of items) {
            await connection.query(
                'UPDATE Product SET quantityInStock = quantityInStock + ?, quantitySold = quantitySold - ? WHERE productCode = ?',
                [item.quantity, item.quantity, item.productCode]
            );
        }
        
        // Delete sale (cascade deletes sale items)
        await connection.query('DELETE FROM Sale WHERE invoiceNumber = ?', [invoiceNumber]);
        
        await connection.commit();
        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error deleting sale', error: error.message });
    } finally {
        connection.release();
    }
});

// Start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});