const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { app } = require('../../app');
const { User } = require('../../models/User');
const { Comment } = require('../../models/Comment');
const { Post } = require('../../models/Post');

const userId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const postId = new mongoose.Types.ObjectId();
const commentId = new mongoose.Types.ObjectId();

const baseUrl = '/api/comments';

const userOne = {
    _id : userId,
    username: 'user-test-album',
    email: 'userTestAlbum@gmail.com',
    password: 'passwordfortesting',
    passwordConfirm: 'passwordfortesting',
    tokens: [
        {
            token: jwt.sign({_id: userId}, process.env.SECRET_KEY)
        }
    ]
};

const userTwo = {
    _id : userTwoId,
    username: 'user-two-test-album',
    email: 'userTwoTestAlbum@gmail.com',
    password: 'passwordfortesting',
    passwordConfirm: 'passwordfortesting',
    tokens: [
        {
            token: jwt.sign({_id: userTwoId}, process.env.SECRET_KEY)
        }
    ]
};

const postTest = {
    _id: postId,
    content: 'This is a post for testing comment',
    owner: userOne._id
};

const commentTest = {
    _id: commentId,
    content: 'This is testing comment from user 2',
    post: postTest._id,
    owner: userTwo._id
}

beforeEach(async()=>{
    try{
        await Promise.all([
            new User(userOne).save(),
            new User(userTwo).save(),
            new Post(postTest).save(),
            new Comment(commentTest).save(),
        ]);
        console.log('init success')
    }catch(e){
        console.log('Error when init database comment for testing')
    }
});

afterEach(async()=>{
    try{
        await Promise.all([
            User.deleteMany(),
            Comment.deleteMany(),
            Post.deleteMany()
        ])
        console.log('clean success')
    }catch(e){
        console.log('Error when clean up database for testing comment')
    }
});

test('Should create a comment for specific post', async ()=>{
    await request(app)
                .post(`/api/posts/${postTest._id}/comments`)
                .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
                .send({content: 'Hi , tks for comment to our post'})
                .expect(200);
    
    const comment = await Comment.findOne({content: 'Hi , tks for comment to our post'});
    expect(comment).not.toBeNull();
    expect(comment.post._id).toEqual(postTest._id);
})
test('Should get specific comment', async()=>{
    const response = await request(app)
                        .get(`${baseUrl}/${commentTest._id}`)
                        .expect(200);
    expect(response.body.data.comment.content).toBe(commentTest.content);
})

test('Should not get comment with wrong id', async()=>{
    const response = await request(app)
                        .get(`${baseUrl}/123456`)
                        .expect(400);
    expect(response.body.status).toBe('Fail');
});


test('Should update content of comment', async()=>{
    const newContent = 'This comment has been updated';
    await request(app)
        .patch(`${baseUrl}/${commentTest._id}`)
        .set('Cookie', [`jwt=${userTwo.tokens[0].token}`])
        .send({content: newContent})
        .expect(200);
    const oldComment = await Comment.findOne({content: commentTest.content});
    const newComment = await Comment.findOne({content: newContent});
    expect(oldComment).toBeNull();
    expect(newComment).not.toBeNull();
    
})

test('Should not update content of comment by other user', async()=>{
    const newContent = 'This comment has been updated';
    await request(app)
                .patch(`${baseUrl}/${commentTest._id}`)
                .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
                .send({content: newContent})
                .expect(400);

    const oldComment = await Comment.findOne({content: commentTest.content});
    const newComment = await Comment.findOne({content: newContent});
    expect(oldComment).not.toBeNull();
    expect(newComment).toBeNull();
})


test('Should delete comment', async ()=>{
    await request(app)
                .delete(`${baseUrl}/${commentTest._id}`)
                .set('Cookie', [`jwt=${userTwo.tokens[0].token}`])
                .expect(200);

    const oldComment = await Comment.findOne({content: commentTest.content});
    expect(oldComment).toBeNull();
})

test('Should not delete by other user', async ()=>{
    await request(app)
                .delete(`${baseUrl}/${commentTest._id}`)
                .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
                .expect(400);

    const oldComment = await Comment.findOne({content: commentTest.content});
    expect(oldComment).not.toBeNull();
})

test('Should delete all comment when deleting a post', async()=>{
    await request(app)
            .delete(`/api/posts/${postTest._id}`)
            .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
            .expect(200);
    const comment = await Comment.findById(commentTest._id);
    expect(comment).toBeNull();
})