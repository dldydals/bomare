import express from 'express';
import cors from 'cors';
import db from './db.js';
import dotenv from 'dotenv';
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-token';

const authenticateAdmin = (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
        req.admin = decoded;
        next();
    } catch (err) { return res.status(401).json({ error: 'Invalid token' }); }
};

const app = express();
const port = 3001;

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
        password VARCHAR(255) NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Ensure password column exists
        try { await connection.query("ALTER TABLE users ADD COLUMN password VARCHAR(255)"); } catch (e) { }
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

        // Schema Migration for Reservations
        try { await connection.query("ALTER TABLE reservations ADD COLUMN type VARCHAR(50)"); } catch (e) { }
        try { await connection.query("ALTER TABLE reservations ADD COLUMN deck VARCHAR(50)"); } catch (e) { }
        try { await connection.query("ALTER TABLE reservations ADD COLUMN request_content TEXT"); } catch (e) { }


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

        // Reviews Table (always ensure exists)
        await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(100) NOT NULL,
        rating INT DEFAULT 5,
        comment TEXT,
        product VARCHAR(100) DEFAULT 'tarrot',
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

            // Create a default admin user if not exists
            try {
                const [adminRows] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
                if (adminRows[0].count === 0) {
                    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'adminpass', 10);
                    await connection.query("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'admin')", ['Admin', process.env.ADMIN_EMAIL || 'admin@local', '010-0000-0000', hashed]);
                    console.log('Seeded default admin user (email:', process.env.ADMIN_EMAIL || 'admin@local', ')');
                }
            } catch (e) {
                console.warn('Failed to seed admin user:', e.message);
            }

            await connection.query(`
                INSERT INTO settlements (vendor_id, amount, status, due_date) VALUES
                (1, 1500000, 'pending', '2025-01-15'),
                (2, 2000000, 'paid', '2024-12-30')
            `);


        }

        // Seed reviews if none exist
        try {
            const [revRows] = await connection.query('SELECT COUNT(*) as count FROM reviews');
            if (revRows[0].count === 0) {
                await connection.query(`
                    INSERT INTO reviews (name, rating, comment, product) VALUES
                    ('익명 고객 01', 5, '상담으로 큰 도움이 되었습니다. 감사합니다!', 'tarrot'),
                    ('익명 고객 02', 4, '해석이 좋았어요. 예약 UX만 개선되면 더 좋습니다.', 'tarrot')
                `);
            }
        } catch (e) {
            console.warn('Review seeding skipped (table missing?):', e.message);
        }


        // Reservations Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        date DATE,
        time VARCHAR(20),
        type VARCHAR(50),
        deck VARCHAR(50),
        request_content TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // FAQs Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Seed FAQs if empty
        const [faqRows] = await connection.query('SELECT COUNT(*) as count FROM faqs');
        if (faqRows[0].count === 0) {
            await connection.query(`
                INSERT INTO faqs (question, answer) VALUES
                ('상담 전 미리 준비해야 할 것이 있나요?', '특별히 준비할 것은 없지만, 상담받고 싶은 질문을 명확하게 2~3가지 정도 미리 정리해두시면 더욱 심도 있는 상담이 가능합니다.'),
                ('예약 후 취소 및 환불 규정은 어떻게 되나요?', '상담 24시간 전 취소 시 전액 환불이 가능합니다. 이후 취소 시에는 예약 상품에 따라 수수료가 발생할 수 있습니다.'),
                ('여러 명이 같이 상담받을 수 있나요?', '네, 방문 상담 시 최대 2인까지 가능합니다. 다만, 상담 시간이 추가될 수 있으므로 예약 시 미리 말씀해주시기 바랍니다.')
            `);
        }

        connection.release();
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};

initDB();

// --- APIs ---

// ... (Existing stats/customers endpoints) ...

// Login API
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password || '');
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        if (user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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


// Reservations API
app.get('/api/reservations', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, phone, DATE_FORMAT(date, \'%Y-%m-%d\') date, time, type, status, created_at, deck, request_content FROM reservations ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reservations', async (req, res) => {
    const { name, phone, date, time, type, deck, requestContent } = req.body;
    try {
        await db.query('INSERT INTO reservations (name, phone, date, time, type, deck, request_content) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, phone, date, time, type, deck || '', requestContent || '']);
        res.json({ message: 'Reservation created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reservations/availability', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });
    try {
        // Find all times reserved on this date, excluding cancelled ones (if any)
        const [rows] = await db.query('SELECT time FROM reservations WHERE date = ? AND status != "cancelled"', [date]);
        const reservedTimes = rows.map(r => r.time);
        res.json(reservedTimes);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/reservations/:id/status', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// FAQs API
app.get('/api/faqs', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM faqs ORDER BY id ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/faqs', authenticateAdmin, async (req, res) => {
    const { question, answer } = req.body;
    try {
        await db.query('INSERT INTO faqs (question, answer) VALUES (?, ?)', [question, answer]);
        res.json({ message: 'FAQ created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/faqs/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;
    try {
        await db.query('UPDATE faqs SET question = ?, answer = ? WHERE id = ?', [question, answer, id]);
        res.json({ message: 'FAQ updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/faqs/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM faqs WHERE id = ?', [id]);
        res.json({ message: 'FAQ deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
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
