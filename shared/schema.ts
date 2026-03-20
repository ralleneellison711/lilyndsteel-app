import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  numerologyNumber: integer("numerology_number"),
});

export const braceletStyles = pgTable("bracelet_styles", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  symbol: text("symbol").notNull(),
  motion: text("motion").notNull(),
  shortDesc: text("short_desc").notNull(),
  imageUrl: text("image_url"),
  price: integer("price").notNull().default(4500),
});

export const crystals = pgTable("crystals", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  motions: text("motions").array().notNull(),
  tags: text("tags").array().notNull(),
  shortDesc: text("short_desc").notNull(),
  imageUrl: text("image_url"),
  price: integer("price").notNull().default(1800),
});

export const motionStates = pgTable("motion_states", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  whenToChoose: text("when_to_choose").array().notNull(),
  affirmation: text("affirmation").notNull(),
  recommendedBraceletStyleId: text("recommended_bracelet_style_id").notNull(),
  recommendedCrystalIds: text("recommended_crystal_ids").array().notNull(),
});

export const lifePaths = pgTable("life_paths", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  meaning: text("meaning").notNull(),
  meAffirmation: text("me_affirmation").notNull(),
  coreCrystalIds: text("core_crystal_ids").array().notNull(),
  coreCrystalNote: text("core_crystal_note"),
});

export const numerologyMeanings = pgTable("numerology_meanings", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  meaning: text("meaning").notNull(),
  crystalName: text("crystal_name").notNull(),
  description: text("description").notNull(),
  crystalImageUrl: text("crystal_image_url").notNull().default(""),
  bibleVerse: text("bible_verse").default(""),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  items: jsonb("items").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, approved: true, createdAt: true });

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertBraceletStyleSchema = createInsertSchema(braceletStyles);
export const insertCrystalSchema = createInsertSchema(crystals);
export const insertMotionStateSchema = createInsertSchema(motionStates);
export const insertLifePathSchema = createInsertSchema(lifePaths).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type BraceletStyle = typeof braceletStyles.$inferSelect;
export type InsertBraceletStyle = z.infer<typeof insertBraceletStyleSchema>;
export type Crystal = typeof crystals.$inferSelect;
export type InsertCrystal = z.infer<typeof insertCrystalSchema>;
export type MotionState = typeof motionStates.$inferSelect;
export type InsertMotionState = z.infer<typeof insertMotionStateSchema>;
export type LifePath = typeof lifePaths.$inferSelect;
export type InsertLifePath = z.infer<typeof insertLifePathSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type NumerologyMeaning = typeof numerologyMeanings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
