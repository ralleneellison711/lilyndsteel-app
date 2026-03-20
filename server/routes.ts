import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { getUncachableStripeClient } from "./stripeClient";
import { insertReviewSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
  await storage.seedData();

  // Admin authentication
  app.post(api.admin.verify.path, async (req, res) => {
    try {
      const input = api.admin.verify.input.parse(req.body);
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        return res.status(401).json({ message: 'Admin password not configured' });
      }
      
      if (input.password === adminPassword) {
        res.json({ success: true });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.patch(api.products.update.path, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.get(api.numerology.list.path, async (req, res) => {
    const meanings = await storage.getNumerologyMeanings();
    res.json(meanings);
  });

  app.get(api.numerology.get.path, async (req, res) => {
    const meaning = await storage.getNumerologyMeaning(Number(req.params.number));
    if (!meaning) {
      return res.status(404).json({ message: 'Numerology meaning not found' });
    }
    res.json(meaning);
  });

  app.patch('/api/numerology/:number', async (req, res) => {
    try {
      const number = Number(req.params.number);
      const { crystalImageUrl, bibleVerse } = req.body;
      const meaning = await storage.updateNumerologyMeaning(number, { 
        crystalImageUrl,
        bibleVerse
      });
      if (!meaning) {
        return res.status(404).json({ message: 'Numerology meaning not found' });
      }
      res.json(meaning);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update numerology meaning' });
    }
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json({ id: order.id, status: order.status });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  // Bracelet Styles
  app.get('/api/bracelet-styles', async (req, res) => {
    const styles = await storage.getBraceletStyles();
    res.json(styles);
  });

  app.get('/api/bracelet-styles/:id', async (req, res) => {
    const style = await storage.getBraceletStyle(req.params.id);
    if (!style) {
      return res.status(404).json({ message: 'Bracelet style not found' });
    }
    res.json(style);
  });

  // Crystals
  app.get('/api/crystals', async (req, res) => {
    const crystalsList = await storage.getCrystals();
    res.json(crystalsList);
  });

  app.get('/api/crystals/:id', async (req, res) => {
    const crystal = await storage.getCrystal(req.params.id);
    if (!crystal) {
      return res.status(404).json({ message: 'Crystal not found' });
    }
    res.json(crystal);
  });

  // Update bracelet style (admin)
  app.patch('/api/bracelet-styles/:id', async (req, res) => {
    const { price } = req.body;
    const updated = await storage.updateBraceletStyle(req.params.id, { price });
    if (!updated) {
      return res.status(404).json({ message: 'Bracelet style not found' });
    }
    res.json(updated);
  });

  // Update crystal (admin)
  app.patch('/api/crystals/:id', async (req, res) => {
    const { price } = req.body;
    const updated = await storage.updateCrystal(req.params.id, { price });
    if (!updated) {
      return res.status(404).json({ message: 'Crystal not found' });
    }
    res.json(updated);
  });

  // Motion States
  app.get('/api/motion-states', async (req, res) => {
    const states = await storage.getMotionStates();
    res.json(states);
  });

  app.get('/api/motion-states/:id', async (req, res) => {
    const state = await storage.getMotionState(req.params.id);
    if (!state) {
      return res.status(404).json({ message: 'Motion state not found' });
    }
    res.json(state);
  });

  // Life Paths
  app.get('/api/life-paths', async (req, res) => {
    const paths = await storage.getLifePaths();
    res.json(paths);
  });

  app.get('/api/life-paths/:number', async (req, res) => {
    const path = await storage.getLifePath(Number(req.params.number));
    if (!path) {
      return res.status(404).json({ message: 'Life path not found' });
    }
    res.json(path);
  });

  // Stripe checkout session
  app.post('/api/stripe/create-checkout-session', async (req, res) => {
    try {
      const { items, customerEmail, customerName } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No items provided' });
      }

      const stripe = await getUncachableStripeClient();
      
      // Fetch all bracelet styles and crystals to validate prices server-side
      const allBracelets = await storage.getBraceletStyles();
      const allCrystals = await storage.getCrystals();
      
      // Create a price lookup map
      const braceletPriceMap = new Map(allBracelets.map(b => [b.displayName, { price: b.price, imageUrl: b.imageUrl }]));
      const crystalPriceMap = new Map(allCrystals.map(c => [c.displayName, { price: c.price, imageUrl: c.imageUrl }]));
      
      // Validate and create line items with server-verified prices
      const lineItems = items.map((item: any) => {
        let serverPrice = item.price;
        let serverImage = item.imageUrl;
        
        // Check if this is a bracelet
        const braceletData = braceletPriceMap.get(item.name);
        if (braceletData) {
          serverPrice = braceletData.price;
          serverImage = braceletData.imageUrl || serverImage;
        }
        
        // Check if this is a crystal
        const crystalData = crystalPriceMap.get(item.name);
        if (crystalData) {
          serverPrice = crystalData.price;
          serverImage = crystalData.imageUrl || serverImage;
        }
        
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: item.description || undefined,
            },
            unit_amount: serverPrice,
          },
          quantity: item.quantity || 1,
        };
      });

      // Use request host as fallback for base URL
      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      const baseUrl = replitDomain 
        ? `https://${replitDomain}` 
        : `${req.protocol}://${req.get('host')}`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cart`,
        customer_email: customerEmail || undefined,
        metadata: {
          customerName: customerName || '',
          items: JSON.stringify(items.map((i: any) => ({ name: i.name, quantity: i.quantity }))),
        },
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
  });

  // Reviews - public (approved only)
  app.get('/api/reviews', async (req, res) => {
    const reviewsList = await storage.getApprovedReviews();
    res.json(reviewsList);
  });

  // Reviews - submit new (pending approval)
  app.post('/api/reviews', async (req, res) => {
    try {
      const input = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  function requireAdmin(req: any, res: any, next: any) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const provided = req.headers['x-admin-password'];
    if (!adminPassword || provided !== adminPassword) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }

  // Reviews - admin: get all (including unapproved)
  app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
    const reviewsList = await storage.getReviews();
    res.json(reviewsList);
  });

  // Reviews - admin: approve
  app.patch('/api/reviews/:id/approve', requireAdmin, async (req, res) => {
    const review = await storage.approveReview(Number(req.params.id));
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  });

  // Reviews - admin: delete
  app.delete('/api/reviews/:id', requireAdmin, async (req, res) => {
    await storage.deleteReview(Number(req.params.id));
    res.json({ success: true });
  });

  app.get('/download-backup/:filename', (req, res) => {
    const allowedFiles = ['lilyndsteel-code.tar.gz', 'lilyndsteel-images.tar.gz', 'backup.tar.gz', 'lilyndsteel-code.zip', 'lilyndsteel-images.zip'];
    const filename = req.params.filename;
    if (!allowedFiles.includes(filename)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const filePath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    const isZip = filename.endsWith('.zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', isZip ? 'application/zip' : 'application/gzip');
    res.setHeader('Content-Length', fs.statSync(filePath).size.toString());
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });

  return httpServer;
}
