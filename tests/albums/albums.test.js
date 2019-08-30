const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { app } = require('../../app');
const { User } = require('../../models/User');
const { Album } = require('../../models/Albums');

const userId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const baseUrl = '/api/albums';

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

const albumTest = {
    _id: new mongoose.Types.ObjectId(),
    name: 'This is an album for testing',
    owner: userOne._id,
    images: ['img/albums/albums-testing-img-0-1567141468659.jpeg','img/albums/albums-testing-img-1-1567141468659.jpeg']
}

beforeEach(async()=>{
    // await new User(userOne).save();
    // await new Album(albumTest).save();
    try{
        await Promise.all([new User(userOne).save(), new User(userTwo).save(), new Album(albumTest).save()]);
        //done();
    }catch(e){
        console.log('Something wrong when init data', e.message);
        //done();
    }
    
})

afterEach(async()=>{
    try{
        await Promise.all([User.deleteMany(), Album.deleteMany()]);
        //done();
    }catch(e){
        console.log('Something wrong when delete data', e.message)
    }
});

test('Should get all albums', async()=>{
    const response = await request(app)
        .get(baseUrl)
        .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
        .expect(200);
    //console.log(response.body);
    expect(response.body.length).toBe(1);
    //done();
});

test('Should create a new albums with single image', async()=>{
    const response = await request(app)
        .post(baseUrl)
        .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
        .field('name','New-Album-is-created-by-testing')
        .attach('albums', 'tests/fixtures/post-image.jpeg')
        .expect(200);
    //console.log(response.body);
    const newAlbum = await Album.findOne({name: 'New-Album-is-created-by-testing'});
    expect(newAlbum).not.toBeNull();
    expect(newAlbum.images.length).toBe(1);
    //done();
});

test('Should create a new albums with multiples image', async()=>{
    const response = await request(app)
        .post(baseUrl)
        .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
        .field('name','New-Album-is-created-by-testing')
        .attach('albums', 'tests/fixtures/post-image.jpeg')
        .attach('albums', 'tests/fixtures/post-image.jpeg')
        .expect(200);
    //console.log(response.body);
    const newAlbum = await Album.findOne({name: 'New-Album-is-created-by-testing'});
    expect(newAlbum).not.toBeNull();
    expect(newAlbum.images.length).toBe(2);
    //done();
})

test('Should add an image to specific album', async()=>{
    await request(app)
            .patch(`${baseUrl}/${albumTest._id}/add`)
            .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
            .field('name','New-Album-is-created-by-testing')
            .attach('albums', 'tests/fixtures/post-image.jpeg')
            .expect(200);
    const album = await Album.findById(albumTest._id);
    expect(album.images.length).toBe(3);
})

test('Should add multiples image to specific album', async()=>{
    await request(app)
            .patch(`${baseUrl}/${albumTest._id}/add`)
            .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
            .field('name','New-Album-is-created-by-testing')
            .attach('albums', 'tests/fixtures/post-image.jpeg')
            .attach('albums', 'tests/fixtures/post-image.jpeg')
            .expect(200);
    const album = await Album.findById(albumTest._id);
    expect(album.images.length).toBe(4);
})

test('Should not add image when wrong id', async()=>{
    await request(app)
            .patch(`${baseUrl}/12345678/add`)
            .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
            .field('name','New-Album-is-created-by-testing')
            .attach('albums', 'tests/fixtures/post-image.jpeg')
            .expect(400);
})

test('Should not add image by other user', async()=>{
    await request(app)
            .patch(`${baseUrl}/12345678/add`)
            .set('Cookie',[`jwt=${userTwo.tokens[0].token}`])
            .field('name','New-Album-is-created-by-testing')
            .attach('albums', 'tests/fixtures/post-image.jpeg')
            .expect(400);
});

test('Should delete an image in album', async ()=>{
    const imgForDelete = 'img/albums/albums-testing-img-0-1567141468659.jpeg'
    await request(app)
            .delete(`${baseUrl}/${albumTest._id}/delete`)
            .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
            .send({
                listImages: [imgForDelete]
            })
            .expect(200);
    const album = await Album.findById(albumTest._id);
    const isImageExist = album.images.findIndex(item => item === imgForDelete);
    expect(isImageExist).toBe(-1);
    expect(album.images.length).toBe(1);
})

test('Should not delete an image by other user', async ()=>{
    const imgForDelete = 'img/albums/albums-testing-img-0-1567141468659.jpeg'
    await request(app)
            .delete(`${baseUrl}/${albumTest._id}/delete`)
            .set('Cookie',[`jwt=${userTwo.tokens[0].token}`])
            .send({
                listImages: [imgForDelete]
            })
            .expect(400);
    const album = await Album.findById(albumTest._id);
    expect(album).not.toBeNull();
})

test('Should delete multiples image in album', async ()=>{
    const imgForDelete = ['img/albums/albums-testing-img-0-1567141468659.jpeg', 'img/albums/albums-testing-img-1-1567141468659.jpeg']
    await request(app)
            .delete(`${baseUrl}/${albumTest._id}/delete`)
            .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
            .send({
                listImages: imgForDelete
            })
            .expect(200);
    const album = await Album.findById(albumTest._id);
    expect(album.images.length).toBe(0);

})


test('Should get specific album', async()=>{
    const response = await request(app)
                        .get(`${baseUrl}/${albumTest._id}`)
                        .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
                        .expect(200);

    expect(response.body.data.album.name).toBe(albumTest.name);
})

test("Should update the album's name", async()=>{
    await request(app)
            .patch(`${baseUrl}/${albumTest._id}`)
            .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
            .send({
                name: 'Updated the name of album'
            })
            .expect(200);
    const oldAlbum = await Album.findOne({name: albumTest.name});
    const newAlbum = await Album.findOne({name: 'Updated the name of album'});
    expect(oldAlbum).toBeNull();
    expect(newAlbum).not.toBeNull();
})

test("Should not update the album's name by other user", async()=>{
    await request(app)
            .patch(`${baseUrl}/${albumTest._id}`)
            .set('Cookie',[`jwt=${userTwo.tokens[0].token}`])
            .send({
                name: 'Updated the name of album'
            })
            .expect(400);
    const oldAlbum = await Album.findOne({name: albumTest.name});
    const newAlbum = await Album.findOne({name: 'Updated the name of album'});
    expect(newAlbum).toBeNull();
    expect(oldAlbum).not.toBeNull();
})

test("Should delete the album", async()=>{
    await request(app)
            .delete(`${baseUrl}/${albumTest._id}`)
            .set('Cookie',[`jwt=${userOne.tokens[0].token}`])
            .expect(200);
    const oldAlbum = await Album.findOne({name: albumTest.name});
    expect(oldAlbum).toBeNull();
})

test("Should not delete the album by other user", async()=>{
    await request(app)
            .delete(`${baseUrl}/${albumTest._id}`)
            .set('Cookie',[`jwt=${userTwo.tokens[0].token}`])
            .expect(400);
    const oldAlbum = await Album.findOne({name: albumTest.name});
    expect(oldAlbum).not.toBeNull();
})