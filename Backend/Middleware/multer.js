import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';

// Get the current file's path
const __filename = fileURLToPath(import.meta.url);

// Get the directory of the current file
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
   

   
      // Construct the absolute path for destination
      const destinationPath = path.join(__dirname, "..", "public");

      cb(null, destinationPath);
   
  },
  filename: function (req, file, cb) {
    // Use the original filename for the uploaded file
    // console.log(file)
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });