const express = require('express');
require('./models/connection');

const { globalErrorHandler } = require('./controllers/errorHandlers');
const { AppError } = require('./utils/AppError');

const app = express();


app.use(express.json({ limit: '10kB'})); // only accept 10kb for data that sent from client


app.get('/error', (req, res, next)=>{
    next(new AppError('Something wrong', 400));
})

app.use(globalErrorHandler)

module.exports = { app };