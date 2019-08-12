const mongoose = require('mongoose');


mongoose.connect(
    process.env.MONGO_URL,
    {
        useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false
    }
    ).then(()=>{
        console.log('connect successfully')
    }).catch(e => {
        console.log(`Could not connect to database : ${e.message}`)
    })

