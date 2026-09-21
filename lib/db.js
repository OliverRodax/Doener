import path from 'path';
import Database from 'better-sqlite3';

let db;

export function getDb() {
  if (!db) {
    db = new Database(path.join(process.cwd(), 'data.db'));
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL,
        name TEXT NOT NULL,
        order_text TEXT NOT NULL,
        token TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_orders_day ON orders(day);');
  }
  return db;
}

// Everyone should see the same "today", regardless of each visitor's own
// device timezone, so the list resets at midnight in one fixed timezone.
export function todayBerlin() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
}
