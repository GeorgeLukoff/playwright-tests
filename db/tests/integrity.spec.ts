import { test, expect } from "@playwright/test";
import { Pool, PoolConfig } from "pg";
import { config } from 'dotenv';

config();

const poolConfig: PoolConfig = {
  connectionString:
    process.env.DATABASE_URL || "postgres://user:pass@localhost/db",
};

// Initialize pool outside describe to share across tests
let pool: Pool;

// Setup: Create database connection before all tests
test.beforeAll(async () => {
  pool = new Pool(poolConfig);
});

// Teardown: Close database connection after all tests
test.afterAll(async () => {
  await pool.end();
});

test.describe("Database Integrity", () => {
  test("should detect no orphaned order_items", async () => {
    const result = await pool.query(`
      SELECT oi.order_item_id
      FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE o.order_id IS NULL OR p.product_id IS NULL
    `);
    expect(result.rows.length).toBe(0); // No orphans
  });

  test("should ensure order totals match calculated sums", async () => {
    const result = await pool.query(`
      SELECT o.order_id
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id, o.total_amount
      HAVING o.total_amount != ROUND(SUM(oi.price * oi.quantity), 2)
    `);
    expect(result.rows.length).toBe(0); // No mismatches
  });

  test("should detect invalid price formats", async () => {
    const result = await pool.query(`
      SELECT product_id
      FROM products
      WHERE price IS NOT NULL
      AND price::TEXT !~ '^[0-9]+\\.?[0-9]*$'
    `);
    expect(result.rows.length).toBe(0); // No invalid prices
  });

  test("should detect no duplicate emails", async () => {
    const result = await pool.query(`
      SELECT email
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `);
    expect(result.rows.length).toBe(0); // No duplicates
  });
});
