import multer, { Multer } from "multer";

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, "./uploads")
    },
    filename:function(req, file, cb){
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

const upload:Multer = multer({storage});
















//// Set storage engine
//const storage = multer.diskStorage({
//  destination: './uploads/', // Temporary storage location
//  filename: (req, file, cb) => {
//    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//  }
//});

//// Initialize upload
//const upload = multer({
//  storage: storage,
//  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//  fileFilter: (req, file, cb) => {
//    checkFileType(file, cb);
//  }
//}).array('images', 5); // Allow up to 5 images

//// Check file type
//function checkFileType(file, cb) {
//  const filetypes = /jpeg|jpg|png/;
//  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//  const mimetype = filetypes.test(file.mimetype);

//  if (mimetype && extname) {
//    return cb(null, true);
//  } else {
//    cb('Error: Images Only!');
//  }
//}

export default upload;
