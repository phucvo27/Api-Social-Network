const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('./models/connection');

const { userRouter } = require('./routes/userRouters');
const { postRouter } = require('./routes/postRouters');
const { albumRouter } = require('./routes/albumRouters');
const { commentRouters } = require('./routes/commentRouters')
const { globalErrorHandler } = require('./controllers/errorHandlers');

const app = express();
app.use(express.static(`${__dirname}/public`))
app.use(cors());

app.use(express.json({ limit: '10kB'})); // only accept 10kb for data that sent from client
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());
app.use((req, res, next)=>{
    next();
})

// Route

app.use('/api/user', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/albums', albumRouter);
app.use('/api/comments', commentRouters)
app.get('/error', (req, res, next)=>{
    next(new AppError('Something wrong', 400));
})

app.use(globalErrorHandler)

module.exports = { app };