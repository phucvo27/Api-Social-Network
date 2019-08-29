const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../app');
const { User } = require('../../models/User');
const { Post } = require('../../models/Post')

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const postId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    username: 'PhucVoPost',
    email: 'phucvopost@gmail.com',
    password: 'passwordfortest',
    passwordConfirm: 'passwordfortest',
    tokens: [
        {
            token: jwt.sign({_id: userOneId}, process.env.SECRET_KEY)
        }
    ]
}

const userTwo = {
    _id: userTwoId,
    username: 'bushjdo',
    email: 'bushjdo@gmail.com',
    password: 'passwordfortest',
    passwordConfirm: 'passwordfortest',
    tokens: [
        {
            token: jwt.sign({_id: userTwoId}, process.env.SECRET_KEY)
        }
    ]
}

const post = {
    _id: postId,
    content: 'This post is used for testing purpose',
    owner: userOne._id
}

beforeAll(async ()=>{
    await User.deleteMany();
    //await new User(userOne).save();
    //await new User(userTwo).save();
    await Promise.all([new User(userOne).save(), new User(userTwo).save(), new Post(post).save()])
})

afterAll(async()=>{
    await User.deleteMany();
})

test('should get specific post', async()=>{
    const response = await request(app).get(`/api/posts/${post._id}`).set('Cookie', [`jwt=${userOne.tokens[0].token}`]).expect(200);
    
    expect(response.body.data.data.content).toBe(post.content)
})


test('should not get specific post with wrong id', async()=>{
    const response = await request(app)
                                .get(`/api/posts/123456`)
                                .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
                                .expect(400);
    console.log(response.body)
    //expect(response.body.message).toBe('Your id is not valid');
})

test('should update the post', async()=>{
    const response = await request(app).patch(`/api/posts/${post._id}`)
                    .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
                    .send({
                        content: 'Update new content'
                    })
                    .expect(200);
    console.log(response.body)
    const currentPost = await Post.findById(post._id);
    expect(currentPost.content).toBe('Update new content');
})