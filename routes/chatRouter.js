const chatRouter = require('express').Router();
const chatControllers = require('../controllers/chatControllers');

chatRouter.get('/:chatWith', chatControllers.getChat);

module.exports = { chatRouter }