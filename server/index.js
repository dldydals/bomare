import express from 'express';
import cors from 'cors';
import db from './db.js';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/assets/uploads/';
        // Create directory if it doesn't exist (though we did it with mkdir)
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp + random number + extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload Endpoint
app.post('/api/upload', upload.array('files'), (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        // Return paths relative to public root (accessible via web)
        const filePaths = files.map(file => `/assets/uploads/${file.filename}`);
        res.json({ paths: filePaths });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Root endpoint to check server status
app.get('/', (req, res) => {
    res.send('Bomare Wedding API Server is Running. Please access the frontend at the Vite URL (e.g., http://localhost:5173).');
});

// Initialize Database Tables
const initDB = async () => {
    try {
        const connection = await db.getConnection();
        console.log('Connected to Database');

        // Users Table (Customers)
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        role ENUM('user', 'admin') DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Vendors Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        contact VARCHAR(50),
        location VARCHAR(100),
        image VARCHAR(255),
        gallery_images TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'partner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Schema Migration: Add columns if they don't exist
        try { await connection.query("ALTER TABLE vendors ADD COLUMN image VARCHAR(255)"); } catch (e) { }
        try { await connection.query("ALTER TABLE vendors ADD COLUMN gallery_images TEXT"); } catch (e) { }
        try { await connection.query("ALTER TABLE vendors ADD COLUMN is_featured BOOLEAN DEFAULT FALSE"); } catch (e) { }
        try { await connection.query("ALTER TABLE vendors ADD COLUMN status VARCHAR(20) DEFAULT 'partner'"); } catch (e) { }


        // Settlements Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS settlements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_id INT,
        amount DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'pending',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Insert Mock Data if empty
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM vendors');
        if (rows[0].count === 0) {
            console.log('Seeding initial data...');
            await connection.query(`
                INSERT INTO vendors (name, category, contact, location, image, is_featured) VALUES
                ('House of Amy', 'Dress', '02-111-2222', 'Gangnam', 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80', true),
                ('Lamuse Studio', 'Studio', '02-333-4444', 'Cheongdam', '/assets/lamuse_studio.jpg', true),
                ('Bittersweet', 'Makeup', '02-555-6666', 'Sinsa', '/assets/bittersweet.jpg', true),
                ('Theography', 'Snap', '010-1234-5678', 'Seoul', '/assets/theography.jpg', true),
                ('Rose Rosa', 'Dress', '02-777-8888', 'Gangnam', '/assets/roserosa.jpg', true),
                ('Terrace Studio', 'Studio', '02-999-0000', 'Gangnam', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000', true),
                ('Bonita Bailey', 'Dress', '02-121-3434', 'Cheongdam', '/assets/bonita_bailey.jpg', true)
            `);

            await connection.query(`
                INSERT INTO users (name, email, phone) VALUES
                ('Kim Minji', 'minji@example.com', '010-1111-2222'),
                ('Lee Junho', 'junho@example.com', '010-3333-4444')
            `);

            await connection.query(`
                INSERT INTO settlements (vendor_id, amount, status, due_date) VALUES
                (1, 1500000, 'pending', '2025-01-15'),
                (2, 2000000, 'paid', '2024-12-30')
            `);
        }

        connection.release();
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};

initDB();

// --- APIs ---

// Dashboard Stats
app.get('/api/stats', async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(*) as count FROM users');
        const [vendors] = await db.query('SELECT COUNT(*) as count FROM vendors');
        const [revenue] = await db.query("SELECT SUM(amount) as total FROM settlements WHERE status = 'paid'"); // Mock revenue logic

        res.json({
            userCount: users[0].count,
            vendorCount: vendors[0].count,
            revenue: revenue[0].total || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Customers
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        await db.query('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone]);
        res.json({ message: 'Customer created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vendors
app.get('/api/vendors', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vendors ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper for file logging
const logError = (error, context = '', payload = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${context}\nPayload: ${JSON.stringify(payload)}\nError: ${error.message}\nStack: ${error.stack}\n-----------------------------------\n`;
    try {
        fs.appendFileSync('server_error.log', logMessage);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
};

app.put('/api/vendors/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, contact, location, status, image, gallery_images, is_featured } = req.body;

    console.log('Update Vendor Request:', { id, body: req.body });

    try {
        await db.query(
            'UPDATE vendors SET name = ?, category = ?, contact = ?, location = ?, status = ?, image = ?, gallery_images = ?, is_featured = ? WHERE id = ?',
            [
                name || '',
                category || '',
                contact || '',
                location || '',
                status || 'partner',
                image || null,
                gallery_images || '[]',
                is_featured ? 1 : 0,
                id
            ]
        );
        res.json({ message: 'Vendor updated' });
    } catch (err) {
        console.error('Update Vendor Error:', err);
        logError(err, `Failed to update vendor ${id}`, req.body);
        res.status(500).json({ error: err.message });
    }
});

// Settlements
app.get('/api/settlements', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT s.*, v.name as vendor_name 
      FROM settlements s 
      JOIN vendors v ON s.vendor_id = v.id 
      ORDER BY s.created_at DESC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
