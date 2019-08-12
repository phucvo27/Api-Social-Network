const { httpServer } = require('./socket');

httpServer.listen(5000, ()=>{
    console.log(`Server is starting at : 5000`)
})