import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table keyed by Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relics collection table
export const relics = pgTable('relics', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull(), // User's Firebase UID
  title: text('title').notNull(),
  description: text('description'),
  prompt: text('prompt').notNull(),
  negativePrompt: text('negative_prompt'),
  aspectRatio: text('aspect_ratio').default('16:9'),
  archetype: text('archetype'),
  loreFragment: text('lore_fragment'),
  imageUrl: text('image_url'),
  tags: jsonb('tags').$type<string[]>(),
  isPublic: integer('is_public').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Generation sessions table
export const generationSessions = pgTable('generation_sessions', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull(), // User's Firebase UID
  theme: text('theme').notNull(),
  relicCount: integer('relic_count').default(1),
  status: text('status').default('completed'),
  sessionData: jsonb('session_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  relics: many(relics),
  sessions: many(generationSessions),
}));
