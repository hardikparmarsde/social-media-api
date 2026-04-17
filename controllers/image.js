import multer from "multer";

// Use memory storage so files stay in buffer — no disk writes.
// This is critical for Render's ephemeral filesystem.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
}

export const upload = multer({ storage: storage, fileFilter: fileFilter });
