import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("saving to public/uploads/");
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        console.log(uniqueName);
        cb(null, uniqueName);
    }
});

export const upload = multer({storage});