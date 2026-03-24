import { pool } from "./db";

export async function ensureTablesExist(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        numerology_number INTEGER
      );

      CREATE TABLE IF NOT EXISTS bracelet_styles (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        motion TEXT NOT NULL,
        short_desc TEXT NOT NULL,
        image_url TEXT,
        price INTEGER NOT NULL DEFAULT 4500
      );

      CREATE TABLE IF NOT EXISTS crystals (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        motions TEXT[] NOT NULL,
        tags TEXT[] NOT NULL,
        short_desc TEXT NOT NULL,
        image_url TEXT,
        price INTEGER NOT NULL DEFAULT 1800
      );

      CREATE TABLE IF NOT EXISTS motion_states (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        description TEXT NOT NULL,
        when_to_choose TEXT[] NOT NULL,
        affirmation TEXT NOT NULL,
        recommended_bracelet_style_id TEXT NOT NULL,
        recommended_crystal_ids TEXT[] NOT NULL
      );

      CREATE TABLE IF NOT EXISTS life_paths (
        id SERIAL PRIMARY KEY,
        number INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        meaning TEXT NOT NULL,
        me_affirmation TEXT NOT NULL,
        core_crystal_ids TEXT[] NOT NULL,
        core_crystal_note TEXT
      );

      CREATE TABLE IF NOT EXISTS numerology_meanings (
        id SERIAL PRIMARY KEY,
        number INTEGER NOT NULL UNIQUE,
        meaning TEXT NOT NULL,
        crystal_name TEXT NOT NULL,
        description TEXT NOT NULL,
        crystal_image_url TEXT NOT NULL DEFAULT '',
        bible_verse TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_email TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        total INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        items JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        approved BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Database tables verified/created successfully");
  } finally {
    client.release();
  }
}
