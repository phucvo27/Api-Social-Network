const { AppError } = require('./AppError');

exports.catchAsync = fn => {
    return (req, res, next)=>{
        fn(req, res, next).catch(e=> { next(e)})
    }
}