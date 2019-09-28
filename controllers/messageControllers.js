const { Message } = require('../models/Message');
const { Chat } = require('../models/Chat');

exports.createMessage = async (data)=>{
    // destruct data box 
    const { to , text} = data;
    let roomName = '';
    let chatRoom = null;
    if(data.from < to){
        roomName = `${data.from}-${to}`;
    }else{
        roomName = `${to}-${data.from}`;
    }
    // find chat room
    chatRoom = await Chat.findOne({room: roomName});
    console.log("In message controller")
    console.log(roomName)
    if(!chatRoom){
        chatRoom = await Chat.create({ room: roomName});
    }
    console.log(chatRoom._id.toString() === "5d7d04e0e3d5840d7b87aa8f")
    try{
        const newMessage = await Message.create({
            chatID: chatRoom._id,
            text,
            from: data.from,
            to,
        })
        console.log(newMessage)
        return newMessage.toObject();
    }catch(e) {
        console.log(e.message)
        return false;
    }
    
}