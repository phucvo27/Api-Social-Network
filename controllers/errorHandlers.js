const { AppError } = require('../utils/AppError')

const handleCastErrorDb = ()=>{
    let message = 'Your id is invalid';
    return new AppError(message, 400)
}
const sendProdError = (err, res)=>{
    console.log(err)
    res.status(err.statusCode).send({
        status: 'Fail',
        message: err.message
    })
}

const sendDevError= (err, res)=>{
    res.status(err.statusCode).send({
        status: 'Fail',
        message: err.message
    })
}

const globalErrorHandler = (err, req, res, next)=>{
    let error = {...err};
    console.log(err)
    if(process.env.NODE_ENV === 'production'){
        sendProdError(error, res)
    }else{
        
        if(error.name === 'CastError'){
            console.log('in error casting')
            error = handleCastErrorDb(error)
        }

        sendDevError(error, res)
    }

    
}


module.exports = { globalErrorHandler }