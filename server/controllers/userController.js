import account from './account/lib.js';

const userController = (app) => {
    app.post('/login', account.login);
    app.post('/signup', account.signup);
    app.post('/confirmation', account.confirmation);
    app.patch('/update', account.update);
    app.post('/get_user', account.get_user);
    app.post('/get_users', account.get_users);
};

export default userController;