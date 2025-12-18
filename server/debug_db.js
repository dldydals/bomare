import db from './db.js';

async function check() {
    try {
        const [rows] = await db.query('SELECT * FROM reservations ORDER BY id DESC LIMIT 5');
        console.log('Recent Reservations:', rows);

        // Check columns
        const [cols] = await db.query('SHOW COLUMNS FROM reservations');
        console.log('Columns:', cols.map(c => c.Field));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
