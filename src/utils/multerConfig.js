const multer = require('multer');
const fs = require('fs');
const path = require('path');


const configureMulter = (directory) => {  
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, directory);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); 
      
    }
  });

  const upload = multer({ storage: storage,
    limits: { fileSize: 10*1024 * 1024 },
   });

  return upload;
};

module.exports = configureMulter;