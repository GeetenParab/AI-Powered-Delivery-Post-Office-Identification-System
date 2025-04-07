import express from "express";
import { upload } from "../Middleware/multer.js";
import { extract } from "../Controllers/extract.js";




const router = express.Router();
 
router.route("/image").post(
    upload.fields([
        {
            name:"photo",
            maxCount:1
        }
    ]),

    extract
    )

  //  /api/upload/image

export default router;