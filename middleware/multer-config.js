const multer = require('multer');
const SharpMulter  =  require("sharp-multer");

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// const storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, 'images');
//   },
//   filename: (req, file, callback) => {
//     const name = file.originalname.split(' ').join('_');
//     const extension = MIME_TYPES[file.mimetype];
//     callback(null, name + Date.now() + '.' + extension);
//   }
// });

const newFilenameFunction = (og_filename,options,req) => {
const newname = og_filename.split(' ').join('_');
  return  newname + Date.now() + '.' + options.fileFormat
}

const storage =  
 SharpMulter ({
              destination:(req, file, callback) =>callback(null, "images"),
              imageOptions:{
                  fileFormat: "jpg",
                  quality: 80,
                  resize: { width: 206, height: 260 },
              },
              filename: newFilenameFunction
           });

           // optional function to return new File Name

module.exports = multer({storage: storage}).single('image');