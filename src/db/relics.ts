import { db } from './index.ts';
import { relics, generationSessions } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function saveRelic(data: {
  uid: string;
  title: string;
  description?: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  archetype?: string;
  loreFragment?: string;
  imageUrl?: string;
  tags?: string[];
  isPublic?: number;
}) {
  try {
    const result = await db.insert(relics)
      .values({
        uid: data.uid,
        title: data.title,
        description: data.description || null,
        prompt: data.prompt,
        negativePrompt: data.negativePrompt || null,
        aspectRatio: data.aspectRatio || '16:9',
        archetype: data.archetype || null,
        loreFragment: data.loreFragment || null,
        imageUrl: data.imageUrl || null,
        tags: data.tags || [],
        isPublic: data.isPublic ?? 0,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database save relic failed:", error);
    throw new Error("Failed to save relic.", { cause: error });
  }
}

export async function getUserRelics(uid: string) {
  try {
    return await db.select()
      .from(relics)
      .where(eq(relics.uid, uid))
      .orderBy(desc(relics.createdAt));
  } catch (error) {
    console.error("Database get user relics failed:", error);
    throw new Error("Failed to fetch user relics.", { cause: error });
  }
}

export async function getPublicRelics() {
  try {
    return await db.select()
      .from(relics)
      .where(eq(relics.isPublic, 1))
      .orderBy(desc(relics.createdAt));
  } catch (error) {
    console.error("Database get public relics failed:", error);
    throw new Error("Failed to fetch public relics.", { cause: error });
  }
}

export async function saveSession(data: {
  uid: string;
  theme: string;
  relicCount?: number;
  sessionData?: any;
}) {
  try {
    const result = await db.insert(generationSessions)
      .values({
        uid: data.uid,
        theme: data.theme,
        relicCount: data.relicCount || 1,
        sessionData: data.sessionData || null,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database save session failed:", error);
    throw new Error("Failed to save session.", { cause: error });
  }
}

export async function getUserSessions(uid: string) {
  try {
    return await db.select()
      .from(generationSessions)
      .where(eq(generationSessions.uid, uid))
      .orderBy(desc(generationSessions.createdAt));
  } catch (error) {
    console.error("Database get user sessions failed:", error);
    throw new Error("Failed to fetch user sessions.", { cause: error });
  }
}
