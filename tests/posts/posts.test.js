const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../app');
const { User } = require('../../models/User');
const { Post } = require('../../models/Post')

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const postId = new mongoose.Types.ObjectId();

const baseUrl = '/api/posts';

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

beforeEach(async ()=>{
    await User.deleteMany();
    //await new User(userOne).save();
    //await new User(userTwo).save();
    await Promise.all([new User(userOne).save(), new User(userTwo).save(), new Post(post).save()]);
    console.log('init success')
})

afterEach(async()=>{
    await User.deleteMany();
    await Post.deleteMany();
})

// ========== CREATE ==========

test('should create a new post without image', async ()=>{
    const res = await request(app)
            .post(`${baseUrl}/`)
            .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
            .field('content','This is new post by user one and only text')
            .expect(200);
    console.log(res.body)
    const newPost = await Post.findOne({content: 'This is new post by user one and only text'});
    //console.log(newPost);
    expect(newPost).not.toBeNull();
})

test('should create a post with only image', async()=>{
    await request(app)
            .post(`${baseUrl}/`)
            .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
            .attach('photo', 'tests/fixtures/post-image.jpeg')
            .expect(200)
})

test('should create a new post with image and text', async ()=>{
    await request(app)
            .post(`${baseUrl}/`)
            .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
            .field('content','This is new post by user one and have an image')
            .attach('photo', 'tests/fixtures/post-image.jpeg')
            .expect(200);
    //console.log(res.body)
    const newPost = await Post.findOne({content: 'This is new post by user one and have an image'});
    //console.log(newPost);
    expect(newPost.image).not.toBeNull();
})


// ========== GET ==========

test('should get specific post', async()=>{
    const response = await request(app)
        .get(`/api/posts/${post._id}`)
        .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
        .expect(200);
    
    expect(response.body.data.data.content).toBe(post.content)
})


test('should not get specific post with wrong id', async()=>{
    const response = await request(app)
                                .get(`/api/posts/123456`)
                                .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
                                .expect(400);
    //console.log(response.body)
    expect(response.body.message).toBe('Your id is invalid');
});

// ========== UPDATE ==========

test('should update the post', async()=>{
    await request(app).patch(`/api/posts/${post._id}`)
                    .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
                    .send({
                        content: 'Update new content'
                    })
                    .expect(200);
    const currentPost = await Post.findById(post._id);
    expect(currentPost.content).toBe('Update new content');
})

test('should not update if not owner', async ()=>{
    await request(app)
            .patch(`${baseUrl}/${post._id}`)
            .set('Cookie', [`jwt=${userTwo.tokens[0].token}`])
            .send({
                content: 'Update by userTwo'
            })
            .expect(400);
    const currentPost = await Post.findById(post._id);
    expect(currentPost.content).toBe(post.content);
})

// ========== DELETE ==========
test('should delete the post', async()=>{
    await request(app)
            .delete(`/api/posts/${post._id}`)
            .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
            .expect(200);
    const currentPost = await Post.findById(post._id);
    expect(currentPost).toBeNull()
})

test('should not delete if not owner', async ()=>{
    await request(app)
            .delete(`${baseUrl}/${post._id}`)
            .set('Cookie', [`jwt=${userTwo.tokens[0].token}`])
            .expect(400);
    const currentPost = await Post.findById(post._id);
    expect(currentPost.content).not.toBeNull();
})
