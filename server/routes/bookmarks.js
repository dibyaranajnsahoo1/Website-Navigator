const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Bookmark = require('../models/Bookmark');
const { validateUrl, extractDomain, getFaviconUrl } = require('../utils/urlValidator');

const router = express.Router();


router.get(
  '/',
  [
    query('sessionId').optional().isString().trim().escape(),
    query('search').optional().isString().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const filter = {};
      if (req.query.sessionId) filter.sessionId = req.query.sessionId;
      if (req.query.search) {
        const rx = new RegExp(req.query.search, 'i');
        filter.$or = [{ url: rx }, { domain: rx }, { title: rx }];
      }

      const bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 }).lean();
      res.json(bookmarks);
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
    body('notes').optional().isString().trim().escape(),
    body('tags').optional().isArray(),
    body('sessionId').optional().isString().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { url, title, notes, tags, sessionId } = req.body;
      const validUrl = validateUrl(url);
      if (!validUrl) return res.status(400).json({ error: 'Invalid URL.' });

      const existing = await Bookmark.findOne({ url: validUrl, sessionId: sessionId || null });
      if (existing) return res.status(409).json({ error: 'Already bookmarked.', bookmark: existing });

      const bookmark = await Bookmark.create({
        url: validUrl,
        domain: extractDomain(validUrl),
        favicon: getFaviconUrl(validUrl),
        title: title || extractDomain(validUrl),
        notes: notes || '',
        tags: tags || [],
        sessionId: sessionId || null,
      });

      res.status(201).json(bookmark);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Bookmark.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Bookmark not found.' });
    res.json({ message: 'Bookmark removed.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
