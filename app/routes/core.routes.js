'use strict';
module.exports = (app, db) => {


    const UserController = require('../controllers/user')(db);

    const AuthMiddleware = require('../middlewares/AuthMiddleware')(db);


    app.get('/', (req, res) => {
        res.send('API works');
    });


    // User routes
    app.post('/user/register', UserController.register)
    app.post('/user/login', UserController.login)
    app.post('/user/logout', UserController.logout)
    app.get('/user/all', UserController.allUser)

};
