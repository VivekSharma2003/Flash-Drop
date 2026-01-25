const fs = require('fs');
const path = require('path');

// Map<code, { filename, originalName, mimeType, size, uploadTime, path }>
const fileStore = new Map();

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Auto-cleanup every minute
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
const FILE_LIFETIME = 60 * 60 * 1000; // 1 hour

setInterval(() => {
  const now = Date.now();
  let deletedCount = 0;
  
  for (const [code, metadata] of fileStore.entries()) {
    if (now - metadata.uploadTime > FILE_LIFETIME) {
      // Remove file from disk
      try {
        if (fs.existsSync(metadata.path)) {
          fs.unlinkSync(metadata.path);
        }
      } catch (err) {
        console.error(`Failed to delete expired file ${code}:`, err);
      }
      // Remove from store
      fileStore.delete(code);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} expired files.`);
  }
}, CLEANUP_INTERVAL);

module.exports = {
  fileStore,
  UPLOAD_DIR
};
