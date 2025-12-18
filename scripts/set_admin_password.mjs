import db from '../server/db.js';
import bcrypt from 'bcrypt';

(async () => {
  try {
    const hashed = await bcrypt.hash('adminpass', 10);
    const [res] = await db.query("UPDATE users SET password = ? WHERE role = 'admin'", [hashed]);
    console.log('Updated admin password, affectedRows:', res.affectedRows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();