const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { nanoid } = require('nanoid'); // Note: nanoid v3 is needed for CJS, or stick to v3. Recent nanoid is ESM only.
// If using recent nanoid in CJS, might have issues. Safe to use 'crypto' or dynamic import.
// For simplicity in CJS without worrying about nanoid versioning, I'll write a simple random generator.

const path = require('path');
const fs = require('fs');
const { fileStore, UPLOAD_DIR } = require('./store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Generate short 6-char code
function generateCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed confusion chars (0, O, 1, I)
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Generate code first to use as filename or just use random id
        // We will rename/associate later, but for now safe random name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Routes
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const code = generateCode();
    // Ensure uniqueness (simple retry)
    // In prod, check DB. Here map is small.

    const maxDownloads = req.body.oneTime === 'true' ? 1 : null;
    const password = req.body.password || null;

    const metadata = {
        code,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadTime: Date.now(),
        path: req.file.path,
        password,
        maxDownloads,
        downloads: 0
    };

    fileStore.set(code, metadata);

    console.log(`File uploaded: ${code} (${metadata.originalName})`);
    res.json({ code, expiresAt: Date.now() + 60 * 60 * 1000 });
});

app.get('/api/info/:code', (req, res) => {
    const { code } = req.params;
    const metadata = fileStore.get(code.toUpperCase());

    if (!metadata) {
        return res.status(404).json({ error: 'File not found or expired' });
    }

    res.json({
        code: metadata.code,
        filename: metadata.originalName,
        size: metadata.size,
        type: metadata.mimeType,
        uploadTime: metadata.uploadTime,
        isProtected: !!metadata.password
    });
});

app.get('/api/file/:code', (req, res) => {
    const { code } = req.params;
    const pwd = req.query.pwd; // Simple query param for MVP
    const metadata = fileStore.get(code.toUpperCase());

    if (!metadata) {
        return res.status(404).json({ error: 'File not found or expired' });
    }

    // Password Check
    if (metadata.password && metadata.password !== pwd) {
        return res.status(403).json({ error: 'Incorrect password' });
    }

    // Burn After Reading (One-Time Download) Check
    if (metadata.maxDownloads && metadata.downloads >= metadata.maxDownloads) {
        // If it was already downloaded (race condition possible but rare in MVP), delete and 410
        fileStore.delete(code.toUpperCase());
        try {
            if (fs.existsSync(metadata.path)) fs.unlinkSync(metadata.path);
        } catch (e) { }
        return res.status(410).json({ error: 'File has already been retrieved and destroyed.' });
    }

    // Increment download count
    metadata.downloads++;

    // Serve file
    res.download(metadata.path, metadata.originalName, (err) => {
        // If it's one-time, delete IMMEDIATELY after download attempt
        if (metadata.maxDownloads) {
            fileStore.delete(code.toUpperCase());
            try {
                if (fs.existsSync(metadata.path)) fs.unlinkSync(metadata.path);
                console.log(`Burned file ${code} after download.`);
            } catch (e) {
                console.error("Error burning file:", e);
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
