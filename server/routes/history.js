const express = require('express');
const { body, query, validationResult } = require('express-validator');
const History = require('../models/History');
const { validateUrl, extractDomain, getFaviconUrl } = require('../utils/urlValidator');

const router = express.Router();


router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('sessionId').optional().isString().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const limit = req.query.limit || 50;
      const page = req.query.page || 1;
      const skip = (page - 1) * limit;
      const filter = req.query.sessionId ? { sessionId: req.query.sessionId } : {};

      const [items, total] = await Promise.all([
        History.find(filter).sort({ visitedAt: -1 }).skip(skip).limit(limit).lean(),
        History.countDocuments(filter),
      ]);

      res.json({ items, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


router.post(
  '/',
  [
    body('url').isString().trim().notEmpty(),
    body('title').optional().isString().trim().escape(),
    body('sessionId').optional().isString().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { url, title, sessionId } = req.body;
      const validUrl = validateUrl(url);
      if (!validUrl) return res.status(400).json({ error: 'Invalid URL.' });

      const entry = await History.create({
        url: validUrl,
        domain: extractDomain(validUrl),
        favicon: getFaviconUrl(validUrl),
        title: title || extractDomain(validUrl),
        visitedAt: new Date(),
        sessionId: sessionId || null,
      });

      
      const filter = sessionId ? { sessionId } : { sessionId: null };
      const count = await History.countDocuments(filter);
      if (count > 500) {
        const oldest = await History.find(filter).sort({ visitedAt: 1 }).limit(count - 500);
        await History.deleteMany({ _id: { $in: oldest.map((d) => d._id) } });
      }

      res.status(201).json(entry);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete('/', async (req, res) => {
  try {
    const filter = req.query.sessionId ? { sessionId: req.query.sessionId } : {};
    await History.deleteMany(filter);
    res.json({ message: 'History cleared.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
