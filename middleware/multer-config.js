const multer = require('multer');
const SharpMulter  =  require("sharp-multer");

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

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

module.exports = multer({storage: storage}).single('image');