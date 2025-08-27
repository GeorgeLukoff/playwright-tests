import { test, expect } from "@playwright/test";
import { Pool, PoolConfig } from "pg";

const poolConfig: PoolConfig = {
  connectionString:
    process.env.DATABASE_URL || "postgres://user:pass@localhost/db",
};

let pool: Pool;

test.beforeAll(async () => {
  pool = new Pool(poolConfig);
});

test.afterAll(async () => {
  await pool.end();
});

test.describe("Database Validation", () => {
  test("should have valid foreign keys in order_items", async () => {
    const result = await pool.query(`
      SELECT oi.order_item_id
      FROM order_items oi
      WHERE NOT EXISTS (
        SELECT 1 FROM orders o WHERE o.order_id = oi.order_id
      )
      OR NOT EXISTS (
        SELECT 1 FROM products p WHERE p.product_id = oi.product_id
      )
    `);
    expect(result.rows.length).toBe(0); // No invalid foreign keys
  });

  test("should have non-negative quantities and prices", async () => {
    const result = await pool.query(`
      SELECT oi.order_item_id
      FROM order_items oi
      WHERE oi.quantity < 0
      UNION
      SELECT p.product_id
      FROM products p
      WHERE p.price < 0
    `);
    expect(result.rows.length).toBe(0); // No negative quantities or prices
  });

  test("should have unique order IDs", async () => {
    const result = await pool.query(`
      SELECT order_id
      FROM orders
      GROUP BY order_id
      HAVING COUNT(*) > 1
    `);
    expect(result.rows.length).toBe(0); // No duplicate order IDs
  });

  test("should have no future order dates", async () => {
    const result = await pool.query(`
      SELECT order_id
      FROM orders
      WHERE order_date > NOW()
    `);
    expect(result.rows.length).toBe(0); // No future dates
  });

  test("should not exceed product stock in order_items", async () => {
    const result = await pool.query(`
      SELECT oi.order_item_id, oi.quantity, p.stock
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.quantity > p.stock
    `);
    expect(result.rows.length).toBe(0); // No orders exceed stock
  });

  test("should have valid email formats", async () => {
    const result = await pool.query(`
      SELECT email
      FROM users
      WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
    `);
    expect(result.rows.length).toBe(0); // No invalid email formats
  });

  test("should execute order summary query within 1 second", async () => {
    const start = Date.now();
    const result = await pool.query(`
      SELECT o.order_id, COUNT(oi.order_item_id) as item_count, SUM(oi.price * oi.quantity) as total
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id
    `);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // Query runs in < 1s
    expect(result.rows.length).toBeGreaterThanOrEqual(0); // Query executes successfully
  });
});
