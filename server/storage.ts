import { db } from "./db";
import {
  products,
  numerologyMeanings,
  orders,
  braceletStyles,
  crystals,
  motionStates,
  lifePaths,
  reviews,
  type Product,
  type InsertProduct,
  type NumerologyMeaning,
  type InsertOrder,
  type Order,
  type BraceletStyle,
  type Crystal,
  type MotionState,
  type LifePath,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  getNumerologyMeanings(): Promise<NumerologyMeaning[]>;
  getNumerologyMeaning(number: number): Promise<NumerologyMeaning | undefined>;
  updateNumerologyMeaning(number: number, update: Partial<NumerologyMeaning>): Promise<NumerologyMeaning | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getBraceletStyles(): Promise<BraceletStyle[]>;
  getBraceletStyle(id: string): Promise<BraceletStyle | undefined>;
  updateBraceletStyle(id: string, data: { price: number }): Promise<BraceletStyle | undefined>;
  getCrystals(): Promise<Crystal[]>;
  getCrystal(id: string): Promise<Crystal | undefined>;
  updateCrystal(id: string, data: { price: number }): Promise<Crystal | undefined>;
  getMotionStates(): Promise<MotionState[]>;
  getMotionState(id: string): Promise<MotionState | undefined>;
  getLifePaths(): Promise<LifePath[]>;
  getLifePath(number: number): Promise<LifePath | undefined>;
  getReviews(): Promise<Review[]>;
  getApprovedReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  approveReview(id: number): Promise<Review | undefined>;
  deleteReview(id: number): Promise<void>;
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  async getNumerologyMeanings(): Promise<NumerologyMeaning[]> {
    return await db.select().from(numerologyMeanings).orderBy(numerologyMeanings.number);
  }

  async getNumerologyMeaning(number: number): Promise<NumerologyMeaning | undefined> {
    const [meaning] = await db.select().from(numerologyMeanings).where(eq(numerologyMeanings.number, number));
    return meaning;
  }

  async updateNumerologyMeaning(number: number, update: Partial<NumerologyMeaning>): Promise<NumerologyMeaning | undefined> {
    const [meaning] = await db.update(numerologyMeanings)
      .set(update)
      .where(eq(numerologyMeanings.number, number))
      .returning();
    return meaning;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getBraceletStyles(): Promise<BraceletStyle[]> {
    return await db.select().from(braceletStyles);
  }

  async getBraceletStyle(id: string): Promise<BraceletStyle | undefined> {
    const [style] = await db.select().from(braceletStyles).where(eq(braceletStyles.id, id));
    return style;
  }

  async getCrystals(): Promise<Crystal[]> {
    return await db.select().from(crystals);
  }

  async getCrystal(id: string): Promise<Crystal | undefined> {
    const [crystal] = await db.select().from(crystals).where(eq(crystals.id, id));
    return crystal;
  }

  async updateBraceletStyle(id: string, data: { price: number }): Promise<BraceletStyle | undefined> {
    const [updated] = await db.update(braceletStyles).set(data).where(eq(braceletStyles.id, id)).returning();
    return updated;
  }

  async updateCrystal(id: string, data: { price: number }): Promise<Crystal | undefined> {
    const [updated] = await db.update(crystals).set(data).where(eq(crystals.id, id)).returning();
    return updated;
  }

  async getMotionStates(): Promise<MotionState[]> {
    return await db.select().from(motionStates);
  }

  async getMotionState(id: string): Promise<MotionState | undefined> {
    const [state] = await db.select().from(motionStates).where(eq(motionStates.id, id));
    return state;
  }

  async getLifePaths(): Promise<LifePath[]> {
    return await db.select().from(lifePaths).orderBy(lifePaths.number);
  }

  async getLifePath(number: number): Promise<LifePath | undefined> {
    const [path] = await db.select().from(lifePaths).where(eq(lifePaths.number, number));
    return path;
  }

  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(reviews.createdAt);
  }

  async getApprovedReviews(): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.approved, true)).orderBy(reviews.createdAt);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async approveReview(id: number): Promise<Review | undefined> {
    const [updated] = await db.update(reviews).set({ approved: true }).where(eq(reviews.id, id)).returning();
    return updated;
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async seedData(): Promise<void> {
    // Seed Bracelet Styles
    const braceletImageMap: Record<string, string> = {
      tulip_root: "/assets/IMG_3234_1769137835687.jpeg",
      lily_witness: "/assets/B9EFC9AF-FFFE-4AAB-9085-F44CF7C1717D_1769291078545.png",
      doublelily_integration: "/assets/507F5AAF-3E05-4EF8-8A89-85F100262F51_1769138066892.png",
      bloom_bloom: "/assets/1F8D1295-D882-4F33-8E70-4C1CD693FCB1_1769138127734.png",
    };
    const existingStyles = await this.getBraceletStyles();
    if (existingStyles.length === 0) {
      await db.insert(braceletStyles).values([
        { id: "tulip_root", displayName: "The Root", symbol: "Tulip", motion: "contraction", shortDesc: "For grounding, protection, and inner holding.", imageUrl: braceletImageMap.tulip_root, price: 4000 },
        { id: "lily_witness", displayName: "The Witness", symbol: "Lily", motion: "stillness", shortDesc: "For clarity, reflection, and calm awareness.", imageUrl: braceletImageMap.lily_witness, price: 4500 },
        { id: "doublelily_integration", displayName: "The Integration", symbol: "Double Lily", motion: "harmonizing", shortDesc: "For balance, wholeness, and embodied healing.", imageUrl: braceletImageMap.doublelily_integration, price: 4500 },
        { id: "bloom_bloom", displayName: "The Bloom", symbol: "Bloom", motion: "expansion", shortDesc: "For joy, confidence, and forward growth.", imageUrl: braceletImageMap.bloom_bloom, price: 4500 },
      ]);
    } else {
      for (const style of existingStyles) {
        if (!style.imageUrl && braceletImageMap[style.id]) {
          await db.update(braceletStyles).set({ imageUrl: braceletImageMap[style.id] }).where(eq(braceletStyles.id, style.id));
        }
      }
    }

    // Seed Crystals
    const crystalImageMap: Record<string, string> = {
      black_obsidian: "/crystals/black_obsidian.jpg",
      smoky_quartz: "/crystals/smoky_quartz.jpg",
      hematite: "/crystals/hematite.jpg",
      red_jasper: "/crystals/red_jasper.jpg",
      black_tourmaline: "/crystals/black_tourmaline.jpg",
      amethyst: "/crystals/amethyst.jpg",
      selenite: "/crystals/selenite.jpg",
      clear_quartz: "/crystals/clear_quartz.jpg",
      lepidolite: "/crystals/lepidolite.jpg",
      moonstone: "/crystals/moonstone.jpg",
      lapis_lazuli: "/crystals/lapis_lazuli.jpg",
      rose_quartz: "/crystals/rose_quartz.jpg",
      rhodonite: "/crystals/rhodonite.jpg",
      amazonite: "/crystals/amazonite.jpg",
      green_aventurine: "/crystals/green_aventurine.jpg",
      pink_opal: "/crystals/pink_opal.png",
      labradorite: "/crystals/labradorite.jpg",
      citrine: "/crystals/citrine.jpg",
      carnelian: "/crystals/carnelian.jpg",
      sunstone: "/crystals/sunstone.png",
      tigers_eye: "/crystals/tigers_eye.png",
      yellow_jade: "/crystals/yellow_jade.png",
      pyrite: "/crystals/pyrite.jpg",
    };
    const existingCrystals = await this.getCrystals();
    if (existingCrystals.length === 0) {
      await db.insert(crystals).values([
        { id: "black_obsidian", displayName: "Black Obsidian", motions: ["contraction"], tags: ["protection", "release", "grounding"], shortDesc: "Supports emotional release while keeping ME grounded.", imageUrl: crystalImageMap.black_obsidian, price: 1800 },
        { id: "smoky_quartz", displayName: "Smoky Quartz", motions: ["contraction"], tags: ["grounding", "stress_support"], shortDesc: "Supports stress relief and stabilizing energy.", imageUrl: crystalImageMap.smoky_quartz, price: 1800 },
        { id: "hematite", displayName: "Hematite", motions: ["contraction"], tags: ["stability", "embodiment"], shortDesc: "Supports stability and body-based grounding.", imageUrl: crystalImageMap.hematite, price: 1800 },
        { id: "red_jasper", displayName: "Red Jasper", motions: ["contraction"], tags: ["endurance", "strength"], shortDesc: "Supports steady resilience and emotional strength.", imageUrl: crystalImageMap.red_jasper, price: 1800 },
        { id: "black_tourmaline", displayName: "Black Tourmaline", motions: ["contraction"], tags: ["boundaries", "grounding"], shortDesc: "Supports emotional boundaries and a sense of safety.", imageUrl: crystalImageMap.black_tourmaline, price: 1800 },
        { id: "amethyst", displayName: "Amethyst", motions: ["stillness"], tags: ["calm", "clarity", "intuition"], shortDesc: "Supports calm clarity and inner awareness.", imageUrl: crystalImageMap.amethyst, price: 1800 },
        { id: "selenite", displayName: "Selenite", motions: ["stillness"], tags: ["clarity", "softness"], shortDesc: "Supports clarity and quiet inner space.", imageUrl: crystalImageMap.selenite, price: 1800 },
        { id: "clear_quartz", displayName: "Clear Quartz", motions: ["stillness"], tags: ["clarity", "amplify", "integration"], shortDesc: "Supports clarity and integration; amplifies intention.", imageUrl: crystalImageMap.clear_quartz, price: 1800 },
        { id: "lepidolite", displayName: "Lepidolite", motions: ["stillness"], tags: ["soothing", "regulation"], shortDesc: "Supports emotional regulation and nervous-system calm.", imageUrl: crystalImageMap.lepidolite, price: 1800 },
        { id: "moonstone", displayName: "Moonstone", motions: ["stillness"], tags: ["intuition", "softness"], shortDesc: "Supports intuitive listening and emotional softness.", imageUrl: crystalImageMap.moonstone, price: 1800 },
        { id: "lapis_lazuli", displayName: "Lapis Lazuli", motions: ["stillness"], tags: ["truth", "wisdom", "perception"], shortDesc: "Supports inner truth, wisdom, and self-knowing.", imageUrl: crystalImageMap.lapis_lazuli, price: 1800 },
        { id: "rose_quartz", displayName: "Rose Quartz", motions: ["harmonizing"], tags: ["self_love", "compassion"], shortDesc: "Supports compassion and a gentle self-relationship.", imageUrl: crystalImageMap.rose_quartz, price: 1800 },
        { id: "rhodonite", displayName: "Rhodonite", motions: ["harmonizing"], tags: ["healing", "forgiveness"], shortDesc: "Supports emotional healing and integration of the past.", imageUrl: crystalImageMap.rhodonite, price: 1800 },
        { id: "amazonite", displayName: "Amazonite", motions: ["harmonizing"], tags: ["balance", "honest_expression"], shortDesc: "Supports balanced communication and emotional steadiness.", imageUrl: crystalImageMap.amazonite, price: 1800 },
        { id: "green_aventurine", displayName: "Green Aventurine", motions: ["harmonizing"], tags: ["renewal", "heart"], shortDesc: "Supports heart renewal and gentle, steady growth.", imageUrl: crystalImageMap.green_aventurine, price: 1800 },
        { id: "pink_opal", displayName: "Pink Opal", motions: ["harmonizing"], tags: ["soothing", "self_connection"], shortDesc: "Supports emotional soothing and inner tenderness.", imageUrl: crystalImageMap.pink_opal, price: 1800 },
        { id: "labradorite", displayName: "Labradorite", motions: ["harmonizing"], tags: ["transformation", "intuition"], shortDesc: "Supports identity shifts and integrating intuitive insight.", imageUrl: crystalImageMap.labradorite, price: 1800 },
        { id: "citrine", displayName: "Citrine", motions: ["expansion"], tags: ["optimism", "growth"], shortDesc: "Supports optimism and opening to possibility.", imageUrl: crystalImageMap.citrine, price: 1800 },
        { id: "carnelian", displayName: "Carnelian", motions: ["expansion"], tags: ["creativity", "vitality"], shortDesc: "Supports creativity, confidence, and life force.", imageUrl: crystalImageMap.carnelian, price: 1800 },
        { id: "sunstone", displayName: "Sunstone", motions: ["expansion"], tags: ["joy", "confidence"], shortDesc: "Supports joy, warmth, and empowered momentum.", imageUrl: crystalImageMap.sunstone, price: 1800 },
        { id: "tigers_eye", displayName: "Tiger's Eye", motions: ["expansion"], tags: ["courage", "focus"], shortDesc: "Supports grounded courage and confident forward steps.", imageUrl: crystalImageMap.tigers_eye, price: 1800 },
        { id: "yellow_jade", displayName: "Yellow Jade", motions: ["expansion"], tags: ["optimism", "strength"], shortDesc: "Supports emotional strength with gentle optimism.", imageUrl: crystalImageMap.yellow_jade, price: 1800 },
        { id: "pyrite", displayName: "Pyrite", motions: ["expansion"], tags: ["will", "confidence", "power"], shortDesc: "Supports confidence, will, and embodied direction.", imageUrl: crystalImageMap.pyrite, price: 1800 },
      ]);
    } else {
      for (const crystal of existingCrystals) {
        if (crystalImageMap[crystal.id] && crystal.imageUrl !== crystalImageMap[crystal.id]) {
          await db.update(crystals).set({ imageUrl: crystalImageMap[crystal.id] }).where(eq(crystals.id, crystal.id));
        }
      }
    }

    // Seed Motion States
    const existingMotions = await this.getMotionStates();
    if (existingMotions.length === 0) {
      await db.insert(motionStates).values([
        { id: "contraction", displayName: "Contraction", subtitle: "The Root", description: "ME is protecting, grounding, and gathering inward.", whenToChoose: ["healing seasons", "recovery and rebuilding", "overwhelm or emotional tenderness", "needing boundaries and grounding"], affirmation: "ME is allowed to hold itself.", recommendedBraceletStyleId: "tulip_root", recommendedCrystalIds: ["black_obsidian", "smoky_quartz", "hematite", "red_jasper", "black_tourmaline"] },
        { id: "stillness", displayName: "Stillness", subtitle: "The Witness", description: "ME is resting, observing, and remembering.", whenToChoose: ["reflection and prayer", "seeking clarity", "nervous-system calming", "intuition and inner listening"], affirmation: "In stillness, ME remembers itself.", recommendedBraceletStyleId: "lily_witness", recommendedCrystalIds: ["amethyst", "selenite", "clear_quartz", "lepidolite", "moonstone", "lapis_lazuli"] },
        { id: "harmonizing", displayName: "Harmonizing", subtitle: "The Integration", description: "ME is balancing, integrating, and becoming whole.", whenToChoose: ["emotional balance work", "self-relationship healing", "rebuilding after survival", "integrating lessons into daily life"], affirmation: "ME is allowed to become whole.", recommendedBraceletStyleId: "doublelily_integration", recommendedCrystalIds: ["rose_quartz", "rhodonite", "amazonite", "green_aventurine", "pink_opal", "labradorite"] },
        { id: "expansion", displayName: "Expansion", subtitle: "The Bloom", description: "ME is opening, expressing, and engaging life.", whenToChoose: ["new beginnings", "creative seasons", "confidence building", "growth and celebration"], affirmation: "ME is allowed to open to life.", recommendedBraceletStyleId: "bloom_bloom", recommendedCrystalIds: ["citrine", "carnelian", "sunstone", "tigers_eye", "yellow_jade", "pyrite"] },
      ]);
    }

    // Seed Life Paths
    const existingPaths = await this.getLifePaths();
    if (existingPaths.length === 0) {
      await db.insert(lifePaths).values([
        { number: 1, title: "Identity", subtitle: "The Origin of ME", meaning: "ME learns itself as an origin point—through courage, choice, and self-definition.", meAffirmation: "ME is the beginning. ME is allowed to emerge and choose.", coreCrystalIds: ["pyrite", "tigers_eye"] },
        { number: 2, title: "Connection", subtitle: "The Reflective ME", meaning: "ME learns itself through feeling and relationship—without disappearing in others.", meAffirmation: "ME is safe to feel, sense, and reflect.", coreCrystalIds: ["moonstone", "amazonite"] },
        { number: 3, title: "Expression", subtitle: "The Expressive ME", meaning: "ME learns itself through expression—through creativity, emotion, and voice.", meAffirmation: "What flows from ME teaches ME who I am.", coreCrystalIds: ["carnelian"] },
        { number: 4, title: "Stability", subtitle: "The Stabilizing ME", meaning: "ME learns itself through grounding—building what can hold my becoming.", meAffirmation: "ME creates safety through presence and consistency.", coreCrystalIds: ["hematite", "red_jasper"] },
        { number: 5, title: "Freedom", subtitle: "The Liberating ME", meaning: "ME learns itself through movement and change—expanding through experience.", meAffirmation: "ME expands through movement and change.", coreCrystalIds: ["citrine"] },
        { number: 6, title: "Love", subtitle: "The Harmonizing ME", meaning: "ME learns itself through love—balanced care, compassion, and self-relationship.", meAffirmation: "ME is the source of the love I give.", coreCrystalIds: ["rose_quartz", "green_aventurine"] },
        { number: 7, title: "Awareness", subtitle: "The Observing ME", meaning: "ME learns itself through awareness—stillness, reflection, and inner truth.", meAffirmation: "In stillness, ME remembers itself.", coreCrystalIds: ["amethyst", "lapis_lazuli"] },
        { number: 8, title: "Power", subtitle: "The Directing ME", meaning: "ME learns itself through responsible power—value, leadership, and embodiment.", meAffirmation: "ME directs energy with clarity and worth.", coreCrystalIds: ["pyrite"] },
        { number: 9, title: "Compassion", subtitle: "The Transcending ME", meaning: "ME learns itself through compassion—release, completion, and expansion beyond self.", meAffirmation: "ME honors what has completed its teaching.", coreCrystalIds: ["clear_quartz"] },
        { number: 11, title: "Illumination", subtitle: "The Illuminating ME", meaning: "ME learns itself through subtle awareness—intuition, sensitivity, and inner light.", meAffirmation: "ME trusts inner light.", coreCrystalIds: ["labradorite", "selenite"] },
        { number: 22, title: "Creation", subtitle: "The Architecting ME", meaning: "ME learns itself through creation—bringing vision into grounded form.", meAffirmation: "ME grounds vision into form.", coreCrystalIds: ["clear_quartz", "tigers_eye"] },
        { number: 33, title: "Service", subtitle: "The Compassionate ME", meaning: "ME learns itself through embodied love—compassion without self-abandonment.", meAffirmation: "ME is the channel, not the burden.", coreCrystalIds: ["rose_quartz", "amethyst"] },
      ]);
    }

    // Keep legacy data for backwards compatibility
    const existingProducts = await this.getProducts();
    if (existingProducts.length === 0) {
      await db.insert(products).values([
        { name: "Classic Lily Charm Bracelet", description: "Sterling silver bracelet with delicate Lily charm.", price: 4500, imageUrl: JSON.stringify(["https://images.unsplash.com/photo-1611591437281-460bfbe1220a"]), category: "bracelet" },
        { name: "Double Lily Silver Bangle", description: "Elegant silver bangle featuring two entwined Lily charms.", price: 6500, imageUrl: JSON.stringify(["https://images.unsplash.com/photo-1573408301185-9146fe634ad0"]), category: "bracelet" },
      ]);
    }

    const existingMeanings = await this.getNumerologyMeanings();
    if (existingMeanings.length === 0) {
      await db.insert(numerologyMeanings).values([
        { number: 1, meaning: "The Leader", crystalName: "Garnet", description: "Independent, original, and ambitious.", bibleVerse: "I can do all things through Christ who strengthens me. (Philippians 4:13)" },
        { number: 2, meaning: "The Mediator", crystalName: "Moonstone", description: "Intuitive, supportive, and diplomatic.", bibleVerse: "Blessed are the peacemakers, for they shall be called sons of God. (Matthew 5:9)" },
        { number: 3, meaning: "The Communicator", crystalName: "Amethyst", description: "Creative, expressive, and inspiring.", bibleVerse: "Let your speech always be with grace, seasoned with salt. (Colossians 4:6)" },
        { number: 4, meaning: "The Teacher", crystalName: "Jade", description: "Practical, reliable, and disciplined.", bibleVerse: "Whatever you do, work at it with all your heart. (Colossians 3:23)" },
        { number: 5, meaning: "The Freedom Seeker", crystalName: "Tiger's Eye", description: "Adventurous, dynamic, and adaptable.", bibleVerse: "Where the Spirit of the Lord is, there is freedom. (2 Corinthians 3:17)" },
        { number: 6, meaning: "The Nurturer", crystalName: "Rose Quartz", description: "Responsible, caring, and protective.", bibleVerse: "Let all that you do be done in love. (1 Corinthians 16:14)" },
        { number: 7, meaning: "The Seeker", crystalName: "Lapis Lazuli", description: "Analytical, spiritual, and intuitive.", bibleVerse: "Ask, and it will be given to you; seek, and you will find. (Matthew 7:7)" },
        { number: 8, meaning: "The Powerhouse", crystalName: "Citrine", description: "Ambitious, efficient, and successful.", bibleVerse: "The blessing of the Lord makes one rich, and He adds no sorrow with it. (Proverbs 10:22)" },
        { number: 9, meaning: "The Humanitarian", crystalName: "Hematite", description: "Compassionate, generous, and wise.", bibleVerse: "Be kind to one another, tenderhearted, forgiving one another. (Ephesians 4:32)" },
        { number: 11, meaning: "The Illuminator", crystalName: "Clear Quartz", description: "Intuitive, visionary, and enlightened.", bibleVerse: "Thy word is a lamp unto my feet, and a light unto my path. (Psalm 119:105)" },
        { number: 22, meaning: "The Master Builder", crystalName: "Pyrite", description: "Powerful, practical, and manifesting.", bibleVerse: "For every house is built by someone, but God is the builder of everything. (Hebrews 3:4)" },
        { number: 33, meaning: "The Master Teacher", crystalName: "Selenite", description: "Compassionate, spiritual, and guiding.", bibleVerse: "Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another. (Colossians 3:16)" },
      ]);
    }

    // Seed first review
    const existingReviews = await this.getReviews();
    if (existingReviews.length === 0) {
      await db.insert(reviews).values([
        { name: "Happy Customer", rating: 5, comment: "I LOOOVEE MY BRACELET!", approved: true },
      ]);
    }
  }
}

export const storage = new DatabaseStorage();
