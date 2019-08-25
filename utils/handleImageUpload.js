const util = require('util');
const multer = require('multer');


const multerStorage = multer.memoryStorage();
const fileFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith('image/')){
        return cb(null , true);
    }else{
        return cb(new AppError('Only accept image', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: fileFilter,
});

exports.handleImage = (fieldName)=>{
    return util.promisify(upload.single(fieldName))
};

exports.handleMultipleImages = util.promisify( upload.fields([
    {name: 'albums', maxCount: 8}
]))