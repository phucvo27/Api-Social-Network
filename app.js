const express = require('express');


const app = express();


console.log(process.env.MONGO_URL)

module.exports = { app };