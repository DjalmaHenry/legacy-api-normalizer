import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.db');

class Database {
  private static instance: Database;
  private db: DatabaseSync;

  private constructor() {
    this.db = new DatabaseSync(DB_PATH);
    this.initTables();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getConnection(): DatabaseSync {
    return this.db;
  }

  private initTables(): void {
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          name TEXT
        )
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY,
          user_id INTEGER,
          total TEXT,
          date TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          product_id INTEGER,
          value TEXT,
          FOREIGN KEY (order_id) REFERENCES orders(id)
        )
      `);

      console.log('✅ Tabelas SQLite inicializadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar tabelas SQLite:', error);
      throw error;
    }
  }

  public insertUser(userId: number, name: string): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)
    `);
    stmt.run(userId, name);
  }

  public insertOrder(orderId: number, userId: number, total: string, date: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO orders (id, user_id, total, date) VALUES (?, ?, ?, ?)
    `);
    stmt.run(orderId, userId, total, date);
  }

  public insertProduct(orderId: number, productId: number, value: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO products (order_id, product_id, value) VALUES (?, ?, ?)
    `);
    stmt.run(orderId, productId, value);
  }

  public clearProductsForOrder(orderId: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM products WHERE order_id = ?
    `);
    stmt.run(orderId);
  }
}

export default Database;