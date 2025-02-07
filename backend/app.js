/******************************************************
 * BACKEND: app.js
 ******************************************************/
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const path = require('path');
const express = require('express');
// ...the rest of your setup code

// Serve the frontend build folder
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all route to serve index.html for any non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Then start your server
app.listen(process.env.PORT || 4000, () => {
  console.log('Server running...');
});

// PDF & Excel
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory data and weights
let scoresData = [];
let weights = {
  productivity: 0.5,
  quality: 0.3,
  timeliness: 0.2
};

// Calculate score based on current weights
function calculateScore({ productivity, quality, timeliness }) {
  let total = 0;
  if (weights.productivity !== undefined) {
    total += (parseFloat(productivity) || 0) * weights.productivity;
  }
  if (weights.quality !== undefined) {
    total += (parseFloat(quality) || 0) * weights.quality;
  }
  if (weights.timeliness !== undefined) {
    total += (parseFloat(timeliness) || 0) * weights.timeliness;
  }
  return +total.toFixed(2);
}

// -----------------------------
// 1) Add Score Manually
// -----------------------------
app.post('/api/scores', (req, res) => {
  const { entityId, productivity, quality, timeliness } = req.body;
  if (!entityId || productivity == null || quality == null || timeliness == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const score = calculateScore({ productivity, quality, timeliness });
  const record = {
    entityId,
    productivity: parseFloat(productivity),
    quality: parseFloat(quality),
    timeliness: parseFloat(timeliness),
    score,
    date: new Date().toISOString()
  };
  scoresData.push(record);
  return res.status(201).json(record);
});

// -----------------------------
// 2) File Upload (CSV)
// -----------------------------
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const filePath = path.join(__dirname, req.file.path);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContents.trim().split('\n');
    const headers = lines[0].split(',');

    const entityIdIndex = headers.indexOf('entityId');
    const prodIndex = headers.indexOf('productivity');
    const qualIndex = headers.indexOf('quality');
    const timeIndex = headers.indexOf('timeliness');

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const entityId = cols[entityIdIndex] || '';
      const productivity = parseFloat(cols[prodIndex] || 0);
      const quality = parseFloat(cols[qualIndex] || 0);
      const timeliness = parseFloat(cols[timeIndex] || 0);

      const score = calculateScore({ productivity, quality, timeliness });

      scoresData.push({
        entityId,
        productivity,
        quality,
        timeliness,
        score,
        date: new Date().toISOString()
      });
    }
    fs.unlinkSync(filePath); // cleanup
    return res.status(200).json({ message: 'File processed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to parse CSV file' });
  }
});

// -----------------------------
// 3) Get Scores
// -----------------------------
app.get('/api/scores', (req, res) => {
  const { entityId } = req.query;
  if (entityId) {
    const filtered = scoresData.filter((s) => s.entityId === entityId);
    return res.json(filtered);
  }
  return res.json(scoresData);
});

// -----------------------------
// 4) Weights
// -----------------------------
app.get('/api/weights', (req, res) => {
  return res.json(weights);
});

app.post('/api/weights', (req, res) => {
  const updated = req.body;
  for (const key in updated) {
    if (weights[key] !== undefined) {
      weights[key] = parseFloat(updated[key]) || weights[key];
    }
  }
  return res.json(weights);
});

// -----------------------------
// 5) Export CSV
// -----------------------------
app.get('/api/export/csv', (req, res) => {
  if (scoresData.length === 0) {
    return res.status(200).send('No data available');
  }
  const headers = 'entityId,productivity,quality,timeliness,score,date';
  const csvRows = [headers];
  scoresData.forEach((item) => {
    const row = [
      item.entityId,
      item.productivity,
      item.quality,
      item.timeliness,
      item.score,
      item.date
    ].join(',');
    csvRows.push(row);
  });
  const csvString = csvRows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="scores_export.csv"');
  res.status(200).send(csvString);
});

// -----------------------------
// 6) Export PDF
// -----------------------------
app.get('/api/export/pdf', (req, res) => {
  try {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="scores_export.pdf"');
    doc.pipe(res);

    doc.fontSize(18).text('Score Report', { underline: true });
    doc.moveDown();
    scoresData.forEach((item) => {
      doc.fontSize(12).text(`Entity: ${item.entityId}, Score: ${item.score}, Date: ${item.date}`);
    });
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// -----------------------------
// 7) Export Excel
// -----------------------------
app.get('/api/export/excel', (req, res) => {
  try {
    const worksheetData = [
      ['entityId', 'productivity', 'quality', 'timeliness', 'score', 'date'],
      ...scoresData.map((item) => [
        item.entityId,
        item.productivity,
        item.quality,
        item.timeliness,
        item.score,
        item.date
      ])
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Scores');
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="scores_export.xlsx"');
    return res.send(excelBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
