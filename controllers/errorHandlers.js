const globalErrorHandler = (err, req, res, next)=>{
    res.status(err.statusCode).send({
        status: 'Fail',
        message: err.message
    })
}


module.exports = { globalErrorHandler }