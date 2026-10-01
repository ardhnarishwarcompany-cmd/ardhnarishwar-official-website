const Media = require('../models/Media');

async function upload(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    // Prefer relative path so images work on any domain (local + live).
    // Set UPLOADS_URL_BASE only when using a CDN or absolute public URL.
    const base = (process.env.UPLOADS_URL_BASE || '/uploads').replace(/\/$/, '');
    const url = `${base}/${req.file.filename}`;

    const media = await Media.create({
      filename: req.file.filename,
      url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });

    res.status(201).json(media);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed.', details: err.message });
  }
}

async function list(req, res) {
  try {
    const items = await Media.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Could not load media.', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const item = await Media.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Media not found.' });
    await item.destroy();
    // Note: this removes the database record; deleting the physical file
    // from disk can be added here later if needed.
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete media.', details: err.message });
  }
}

module.exports = { upload, list, remove };
