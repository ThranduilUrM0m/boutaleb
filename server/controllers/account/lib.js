import dotenv from 'dotenv';
import User from '../../models/User.js';
import Token from '../../models/Token.js';
import passwordHash from 'password-hash';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import crypto from 'crypto';

dotenv.config();

const login = async (req, res) => {
    const { _userEmailValue, _userPasswordValue } = req.body;
    try {
        if (!_userEmailValue || !_userPasswordValue) {
            // Le cas où l'email ou bien le password ne serait pas soumit ou nul
            return res.status(400).json({
                text: 'Please fill out both email and password.'
            });
        }

        // On check si l'utilisateur existe en base
        const findUser = await User.findOne({
            _userEmailValue
        });

        if (!findUser)
            return res.status(401).json({
                text: 'Verify your email, this account is not registred.'
            });
        if (!findUser._user_isVerified)
            return res.status(401).json({
                text: 'Your account has not been verified. Please check your inbox for a verification email that was sent to you.'
            });
        if (!findUser.authenticate(_userPasswordValue, findUser))
            return res.status(401).json({
                text: 'Incorrect Password Inserted.'
            });

        const findUserUpdated = await User.findOneAndUpdate(
            { _user_email: _userEmailValue },
            {
                $set: {
                    _user_toDelete: false,
                    _user_isActive: true
                },
                $push: {
                    _user_logindate: new Date()
                }
            },
            { upsert: true }
        );

        return res.status(200).json({
            _user: findUserUpdated,
            text: 'Authentification successful.'
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
}
const signup = async (req, res) => {
    const { _userEmailValue, _userUsernameValue, _userPasswordValue, _fingerprint } = req.body;
    try {
        if (!_userEmailValue || !_userUsernameValue || !_userPasswordValue || !_fingerprint) {
            return res.status(400).json({
                text: 'It looks like some information about u, wasn\'t correctly submitted, please retry.'
            });
        }

        const findUserByEmail = await User.findOne({
            _user_email: _userEmailValue
        });
        const findUserByUsername = await User.findOne({
            _user_username: _userUsernameValue
        });
        if (findUserByEmail) {
            return res.status(400).json({
                text: 'This Email exists already can u, please submit another Email.'
            });
        }
        if (findUserByUsername) {
            return res.status(400).json({
                text: 'This Username exists already can u, please submit another Username.'
            });
        }

        const _newUser = {
            _user_email: _userEmailValue,
            _user_username: _userUsernameValue,
            _user_password: passwordHash.generate(_userPasswordValue),
            _user_fingerprint: _fingerprint,
            _user_isVerified: false,
            _user_toDelete: false
        };

        // Sauvegarde de l'utilisateur en base
        const userData = new User(_newUser);
        await userData.save();

        // Create a verification token for this user
        let token = new Token({ _userId: userData._id, token: crypto.randomBytes(16).toString('hex') });
        await token.save();

        //send a verification mail to the user's email
        SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.API_KEY;
        new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
            'sender': { 'email': process.env.EMAIL, 'name': 'Boutaleb.' },
            'subject': 'Hello ✔ and Welcome',
            'htmlContent': '<!DOCTYPE html><html><body><h1>We are happy to be working with you</h1><p>' + 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' + '</p></body></html>',
            'messageVersions': [
                {
                    'to': [
                        {
                            'email': userData._user_email
                        }
                    ]
                }
            ]
        }).then((data) => {
            return res.status(200).json({
                _user: userData,
                text: 'And that\'s it, only thing left is verify your email. \nWe have sent you an email verification.'
            });
        }, (error) => {
            return res.status(200).json({
                error: error,
            });
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
}
const confirmation = async (req, res, next) => {
    Token.findOne({ token: req.body.token }, (err, token) => {
        if (!token) return res.status(400).json({ text: 'We were unable to find a valid token. Your token my have expired.' });
        User.findOne({ _id: token._userId }, (err, _user) => {
            if (!_user) return res.status(400).json({ text: 'We were unable to find a user for this token.' });
            if (_user._user_isVerified) return res.status(400).json({ text: 'This user has already been verified.' });
            _user._user_isVerified = true;
            _user.save((err) => {
                if (err) { return res.status(500).json({ text: err.message }); }
                return res.status(200).json({
                    _user: _user,
                    text: 'And that\'s it, Ur account has been verified. \nU\'r part of us now. \nYou will be redirected to the login page upon closing this message.'
                });
            });
        });
    });
}
const sendMessage = async (req, res) => {
    const { _userNameValue, _userPhoneValue, _userEmailValue, _userNewsletterValue, _userMessageValue } = req.body;

    //send a verification mail to the user's email
    SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.API_KEY;
    new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
        'sender': { 'email': _userEmailValue, 'name': _userNameValue, 'phone': _userPhoneValue, 'newsletter': _userNewsletterValue },
        'subject': 'Feedback',
        'htmlContent': '<!DOCTYPE html><html><body><p>' + _userMessageValue + '</p></body></html>',
        'messageVersions': [
            {
                'to': [
                    {
                        'email': process.env.EMAIL
                    }
                ]
            }
        ]
    }).then((data) => {
        return res.status(200).json({
            _message: data
        });
    }, (error) => {
        return res.status(200).json({
            _message: error
        });
    });
}
const update = async (req, res) => {
    const { _new_user, _user, _user_password, _user_password_new, _user_password_new_confirm } = req.body;
    try {
        if (_user_password_new)
            if (_user_password && _user_password_new === _user_password_new_confirm)
                if (!passwordHash.verify(_user_password, _user._user_password)) {
                    return res.status(400).json({
                        text: 'Password Invalid'
                    });
                }

        // Sauvegarde de l'utilisateur en base
        await User.findOneAndUpdate(
            {
                _user_email: _user ? _user._user_email : _new_user._user_email
            }, {
            $set: {
                _user_email: _user ? _user._user_email : _new_user._user_email,
                _user_username: _user ? _user._user_username : _new_user._user_username,
                _user_password: _user ? (_user_password_new ? passwordHash.generate(_user_password_new) : _user._user_password) : (_user_password_new ? passwordHash.generate(_user_password_new) : _new_user._user_password),
                _user_passwordResetToken: _user ? _user._user_passwordResetToken : _new_user._user_passwordResetToken,
                _user_passwordResetExpires: _user ? _user._user_passwordResetExpires : _new_user._user_passwordResetExpires,
                _user_fingerprint: _user ? _user._user_fingerprint : _new_user._user_fingerprint,
                _user_isVerified: _user ? _user._user_isVerified : _new_user._user_isVerified,
                _user_toDelete: _user ? _user._user_toDelete : _new_user._user_toDelete,
                _user_logindate: _user ? _user._user_logindate : _new_user._user_logindate,
                Permission: _user ? _user.Permission : _new_user.Permission
            }
        },
            { upsert: true }
        );

        return res.status(200).json({
            _user_username: _user ? _user._user_username : _new_user._user_username,
            _user_email: _user ? _user._user_email : _new_user._user_email,
            text: 'User updated successfully.',
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
}
const getUser = async (req, res) => {
    const { _user_email } = req.body;
    if (!_user_email) {
        // Le cas où l'email ne serait pas soumit ou nul
        return res.status(400).json({
            text: 'Please provide a valid email.'
        });
    }
    try {
        // On check si l'utilisateur existe en base
        const findUser = await User
            .findOne({
                _user_email
            })
            .populate('Permission');
        if (!findUser)
            return res.status(401).json({
                text: 'This email is not registered.'
            });
        return res.status(200).json({
            _user: findUser
        });
    } catch (error) {
        return res.status(500).json({
            error
        });
    }
}
const getUsers = async (req, res) => {
    try {
        const findUsers = await User
            .find()
            .populate('Permission');
        if (!findUsers)
            return res.status(401).json({
                text: 'We found no users.'
            });
        return res.status(200).json({
            _users: findUsers
        });
    } catch (error) {
        return res.status(500).json({
            error
        });
    }
}
const logout = async (req, res) => {
    const { _user } = req.body;
    try {
        const findUserUpdated = await User.findOneAndUpdate(
            { _user_email: _user._user_email },
            {
                $set: {
                    _user_isActive: false
                }
            },
            { upsert: true }
        );
        return res.status(200).json({
            _user: findUserUpdated,
            text: 'Disconnected.'
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
}

export default {
    login,
    signup,
    confirmation,
    sendMessage,
    update,
    getUser,
    getUsers,
    logout
};