const mongoose = require('mongoose');


mongoose.connect(
    process.env.MONGO_URL,
    {
        useNewUrlParser:true,
    },
    (err) => {
        if (!err) console.log('connecting successfully');
        else console.log('connection fails')
    }
);

