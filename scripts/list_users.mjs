import db from '../server/db.js';

(async () => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();