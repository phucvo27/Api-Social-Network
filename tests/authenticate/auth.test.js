const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../app');
const { User } = require('../../models/User');

const userOneId = new mongoose.Types.ObjectId();
console.log(userOneId);

const userOne = {
    _id: userOneId,
    username: 'PhucVo',
    email: 'phuc@gmail.com',
    password: 'passwordfortest',
    passwordConfirm: 'passwordfortest',
    tokens: [
        {
            token: jwt.sign({_id: userOneId}, process.env.SECRET_KEY)
        }
    ]
}

beforeEach(async ()=>{
    await User.deleteMany(); // delete all Documents of User Collection
    await new User(userOne).save();
});

test('should login successfully', async ()=>{
    const { email, password } = userOne;
    await request(app)
            .post('/api/user/signin')
            .send({email, password})
            .expect(200)
});

test('should not login successfully', async ()=>{
    const { email } = userOne;
    await request(app)
            .post('/api/user/signin')
            .send({email, password: 'kajsdhlkjxnb'})
            .expect(400)
})

test('should logout successfully', async()=>{
    await request(app)
            .get('/api/user/signout')
            .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
            .expect(200);
})

test('should not logout without login', async()=>{
    await request(app)
            .get('/api/user/signout')
            .set('Cookie', [`jwt=123456789`])
            .expect(400);
})