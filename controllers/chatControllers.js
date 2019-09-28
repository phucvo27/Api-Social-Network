const { Chat } = require('../models/Chat');

exports.getChat = async (req, res, next)=>{
    //req.user = "5d7d044d0ba3340d72f5a55c";
    const { chatWith } = req.params;
    let roomName = '';
    if(chatWith){
        req.user = "5d7d044d0ba3340d72f5a55c" === chatWith ? "5d7d044d0ba3340d72f5a55d" : "5d7d044d0ba3340d72f5a55c"
        if(req.user < chatWith){
            console.log("in req.user < chatWith")
            roomName = `${req.user}-${chatWith}`
        }else{
            roomName = `${chatWith}-${req.user}`
        }
        console.log(roomName)
        const chat = await Chat.findOne({room: roomName}).populate('messages');
        console.log(chat)
        res.status(200).send({
            chat
        })
    }else{
        res.status(400).send({
            status: 'Fail',
            message: 'Missing required field'
        })
    }
}