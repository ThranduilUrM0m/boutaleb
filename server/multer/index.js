import express from 'express'; // Import express
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import sanitize from 'sanitize-filename';

// Initialize Express app
const app = express();

// Initialize Firebase Storage
const storage = new Storage({
    projectId: 'boutaleb-82980',
    credentials: {
        client_email:
            'firebase-adminsdk-voyst@boutaleb-82980.iam.gserviceaccount.com',
        private_key: process.env.PRIVATE_KEY,
    },
});

// Set up a bucket reference
const bucket = storage.bucket('boutaleb-82980.appspot.com');

// Create a rate limiter
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many upload requests from this IP, please try again later.',
});

// Middleware for file upload
const uploadImage = (req, res, next) => {
    const multerUpload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed.'));
            }
        },
    }).single('_user_picture');

    multerUpload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        // Skip further execution if no file is uploaded
        if (!req.file) {
            return next();
        }

        // Proceed to the next middleware after image upload
        next();
    });
};

// Function to upload image to Firebase Storage
const uploadToStorage = async (req, res, next) => {
    if (!req.file) {
        // Skip further execution if no file is uploaded
        return next();
    }

    const file = req.file;

    // Sanitize the original file name
    const sanitizedFileName = sanitize(file.originalname);

    // Validate that the sanitized file name does not contain path traversal characters
    if (sanitizedFileName.includes('..') || sanitizedFileName.includes('/')) {
        return res.status(400).send('Invalid file name');
    }

    const fileName = `${uuidv4()}-${Date.now()}-${sanitizedFileName}`;

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).send('Invalid file type');
    }

    // Create a reference to the blob using the safe filename
    const blob = bucket.file(fileName); // No local path, just use blob

    const blobStream = blob.createWriteStream({
        contentType: file.mimetype,
        metadata: {
            /* Your metadata */
        },
    });

    blobStream.on('error', (err) => {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ message: 'Error uploading image' });
    });

    blobStream.on('finish', () => {
        // Construct the public URL for the uploaded image
        req.imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(
            blob.name,
        )}?alt=media`;

        next();
    });

    // End the stream with the file buffer
    blobStream.end(file.buffer);
};

// Apply the rate limiter and the upload image middleware to the upload endpoint
app.post('/upload', uploadLimiter, uploadImage, uploadToStorage);

// Export the middleware for use in other parts of your application if needed
export default [uploadImage, uploadToStorage];
