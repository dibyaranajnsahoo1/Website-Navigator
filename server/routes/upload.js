const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const Papa = require('papaparse');
const fetch = require('node-fetch');
const { validateUrl, extractDomain, getFaviconUrl, deduplicateUrls } = require('../utils/urlValidator');

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'text/plain',
      'application/csv',
    ];
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (allowed.includes(file.mimetype) || ['xlsx', 'xls', 'csv', 'txt'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx, .xls, and .csv files are allowed'));
    }
  },
});

function extractUrlsFromValues(values) {
  const urls = [];
  for (const val of values) {
    if (!val) continue;
    const str = String(val).trim();
    const validated = validateUrl(str);
    if (validated) {
      urls.push({
        url: validated,
        domain: extractDomain(validated),
        favicon: getFaviconUrl(validated),
        title: extractDomain(validated),
      });
    }
  }
  return urls;
}

function parseXlsx(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const allValues = [];
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    for (const row of rows) {
      for (const cell of row) {
        allValues.push(cell);
      }
    }
  }
  return allValues;
}

function parseCsv(text) {
  const result = Papa.parse(text, { skipEmptyLines: true });
  const values = [];
  for (const row of result.data) {
    for (const cell of row) {
      values.push(cell);
    }
  }
  return values;
}


router.post('/file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let rawValues = [];

    if (ext === 'xlsx' || ext === 'xls') {
      rawValues = parseXlsx(req.file.buffer);
    } else {
      rawValues = parseCsv(req.file.buffer.toString('utf-8'));
    }

    const urlObjects = extractUrlsFromValues(rawValues);
    const unique = deduplicateUrls(urlObjects.map((u) => u.url));
    const final = unique.map((u) => urlObjects.find((o) => o.url === u));

    if (final.length === 0) {
      return res.status(422).json({ error: 'No valid URLs found in the uploaded file.' });
    }

    res.json({ urls: final, count: final.length });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process file: ' + err.message });
  }
});


router.post('/sheets', async (req, res) => {
  try {
    const { link } = req.body;
    if (!link || typeof link !== 'string') {
      return res.status(400).json({ error: 'Google Sheets link is required.' });
    }


    const match = link.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid Google Sheets URL.' });
    }

    const sheetId = match[1];
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    const response = await fetch(csvUrl, { timeout: 10000 });
    if (!response.ok) {
      return res.status(400).json({
        error: 'Could not fetch Google Sheet. Make sure the sheet is publicly accessible.',
      });
    }

    const text = await response.text();
    const rawValues = parseCsv(text);
    const urlObjects = extractUrlsFromValues(rawValues);
    const unique = deduplicateUrls(urlObjects.map((u) => u.url));
    const final = unique.map((u) => urlObjects.find((o) => o.url === u));

    if (final.length === 0) {
      return res.status(422).json({ error: 'No valid URLs found in the Google Sheet.' });
    }

    res.json({ urls: final, count: final.length });
  } catch (err) {
    console.error('Sheets error:', err);
    res.status(500).json({ error: 'Failed to fetch Google Sheet: ' + err.message });
  }
});

module.exports = router;
