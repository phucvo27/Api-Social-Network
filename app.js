const express = require('express');
const cookieParser = require('cookie-parser');
require('./models/connection');

const { userRouter } = require('./routes/userRouters');
const { postRouter } = require('./routes/postRouters');
const { globalErrorHandler } = require('./controllers/errorHandlers');

const app = express();


app.use(express.json({ limit: '10kB'})); // only accept 10kb for data that sent from client
app.use(cookieParser())
app.use((req, res, next)=>{
    console.log(req.cookies);
    next();
})

// Route

app.use('/api/user', userRouter);
app.use('/api/posts', postRouter);

app.get('/error', (req, res, next)=>{
    next(new AppError('Something wrong', 400));
})

app.use(globalErrorHandler)

module.exports = { app };