import account from './account/lib.js';

const userController = (app) => {
    app.post('/login', account.login);
    app.post('/signup', account.signup);
    app.post('/confirmation', account.confirmation);
    app.post('/sendMessage', account.sendMessage);
    app.patch('/update', account.update);
    app.post('/getUser', account.getUser);
    app.post('/getUsers', account.getUsers);
    app.post('/logout', account.logout);
};

export default userController;