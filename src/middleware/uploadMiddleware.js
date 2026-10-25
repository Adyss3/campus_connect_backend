const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// ─────────────────────────────────────────────
// Cloudinary check — use Cloudinary if configured, else fallback to disk
// ─────────────────────────────────────────────
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// ─── Disk storage (fallback) ────────────────
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';

    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'verificationDocument') {
      uploadPath += 'verifications/';
    } else if (file.fieldname === 'productImage') {
      uploadPath += 'products/';
    } else if (file.fieldname === 'storeLogo' || file.fieldname === 'storeBanner') {
      uploadPath += 'stores/';
    } else {
      uploadPath += 'misc/';
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// ─── Memory storage (for Cloudinary) ────────
const memoryStorage = multer.memoryStorage();

// ─── File filter ────────────────────────────
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images (JPEG, PNG, WEBP) and PDFs only!'));
  }
}

// ─── Multer instance ────────────────────────
const upload = multer({
  storage: useCloudinary ? memoryStorage : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// ─── Cloudinary upload helper ───────────────
const uploadToCloudinary = (fileBuffer, folder = 'campus_connect') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * Middleware: after multer parses the file, upload to Cloudinary if configured.
 * Attaches `req.fileUrl` with the final URL (Cloudinary or local path).
 */
const processUpload = (fieldName, folder) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) return next();

        if (useCloudinary) {
          const result = await uploadToCloudinary(req.file.buffer, folder);
          req.fileUrl = result.secure_url;
          req.filePublicId = result.public_id;
        } else {
          // Disk path — make it a URL relative to the server
          req.fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
        }

        next();
      } catch (error) {
        console.error('Upload processing error:', error);
        next(error);
      }
    },
  ];
};

module.exports = { upload, uploadToCloudinary, processUpload, useCloudinary };
