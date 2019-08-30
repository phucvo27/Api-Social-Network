const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { app } = require('../../app');
const { User } = require('../../models/User');
const { Like } = require('../../models/Like');
const { Post } = require('../../models/Post');

const userId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const postId = new mongoose.Types.ObjectId();
const likeId = new mongoose.Types.ObjectId();

const userOne = {
    _id : userId,
    username: 'user-test-like',
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
    username: 'user-two-test-like',
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

const likeTest = {
    _id: likeId,
    post: postTest._id,
    owner: userTwo._id
}

beforeEach(async()=>{
    try{
        await Promise.all([
            new User(userOne).save(),
            new User(userTwo).save(),
            new Post(postTest).save(),
            new Like(likeTest).save()
        ]);
        console.log('init success')
    }catch(e){
        console.log('Error when init database for testing')
    }
});

afterEach(async()=>{
    try{
        await Promise.all([
            User.deleteMany(),
            Like.deleteMany(),
            Post.deleteMany()
        ])
        console.log('clean success')
    }catch(e){
        console.log('Error when clean up database for testing comment')
    }
});

test('Should create a like for specific post', async ()=>{
    await request(app)
            .get(`/api/posts/${postTest._id}/likes/like`)
            .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
            .expect(200);
    
    const post = await Post.findById(postTest._id).populate('likes', {lean: true}).lean();
    const userLiked = post.likes.findIndex(item => item.owner.username === userOne.username)
    expect(post.likes.length).toBe(2);
    expect(userLiked).not.toBe(-1);
    
})

test('Should dislike for specific post', async ()=>{
    await request(app)
                .get(`/api/posts/${postTest._id}/likes/dislike`)
                .set('Cookie', [`jwt=${userTwo.tokens[0].token}`])
                .expect(200);
    
    const post = await Post.findById(postTest._id).populate('likes', {lean: true}).lean();
    expect(post.likes).toBeNull();
})


test('Should get list liked for specific post', async()=>{
    const response = await request(app)
                            .get(`/api/posts/${postTest._id}/list-liked`)
                            .set('Cookie', [`jwt=${userTwo.tokens[0].token}`])
                            .expect(200);
    // because we only have one like for the post test <=> likes will be object type
    // if more than on -> likes will be an array
    expect(response.body.data.data.likes.owner.username).toBe(userTwo.username);
})

test('Should delete all like when deleting a post', async()=>{
    await request(app)
            .delete(`/api/posts/${postTest._id}`)
            .set('Cookie', [`jwt=${userOne.tokens[0].token}`])
            .expect(200);
    const like = await Like.findById(likeTest._id);
    expect(like).toBeNull();
})