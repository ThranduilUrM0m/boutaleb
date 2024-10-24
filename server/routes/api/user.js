import mongoose from 'mongoose';
import express from 'express';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import crypto from 'crypto';
import passwordHash from 'password-hash';
import jwt from 'jsonwebtoken';
import uploadMiddleware from '../../multer/index.js';
import _ from 'lodash';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const User = mongoose.model('User');
const Token = mongoose.model('Token');
const router = express.Router();

const sendEmail = async (sender, name, phone, newsletter, subject, message, receiver) => {
    SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.API_KEY;

    const emailData = {
        sender: {
            email: sender,
            name: name,
            ...(phone ? { phone } : {}),
            ...(newsletter ? { newsletter } : {}),
        },
        subject: subject,
        htmlContent: `<!DOCTYPE html><html><body>${message}${phone ? `<br/><p style="margin: 0;">phone: ${phone}</p>` : ''}${newsletter ? `<p style="margin: 0;">newsletter: ${newsletter}</p>` : ''}</body></html>`,
        messageVersions: [{ to: [{ email: receiver }] }],
    };

    return new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(emailData);
};

// Validate user input
const validateUserInput = (body) => {
    const errors = {};
    if (!body._user_email) errors._user_email = 'is required';
    if (!body._user_username) errors._user_username = 'is required';
    if (!body._user_password) errors._user_password = 'is required';
    if (!body._user_fingerprint) errors._user_fingerprint = 'is required';
    return errors;
};

// Check for duplicates
const checkForDuplicates = async (email, username) => {
    const emailExists = await User.findOne({ _user_email: email });
    const usernameExists = await User.findOne({ _user_username: username });
    return { emailExists, usernameExists };
};

router.post('/', uploadMiddleware, async (req, res, next) => {
    const { body } = req;
    const errors = validateUserInput(body);

    if (Object.keys(errors).length) {
        return res.status(422).json({ errors });
    }

    const { emailExists, usernameExists } = await checkForDuplicates(body._user_email, body._user_username);
    if (emailExists) return res.status(400).json({ text: 'This Email exists already, please submit another Email.' });
    if (usernameExists) return res.status(400).json({ text: 'This Username exists already, please submit another Username.' });

    const newUser = new User({
        _user_email: body._user_email,
        _user_username: body._user_username,
        _user_password: passwordHash.generate(body._user_password),
        _user_fingerprint: body._user_fingerprint,
    });

    await newUser.save();

    const token = new Token({
        _userId: newUser._id,
        _userIsVerified: false,
        _token_body: crypto.randomBytes(16).toString('hex'),
    });
    await token.save();

    try {
        await sendEmail(process.env.EMAIL, 'Boutaleb.', null, null, 'Hello ✔ and Welcome', `<h1>We are happy to be working with you ${body._user_username}</h1><br/><p style="margin: 0;">Please verify your account by clicking the link: http://${req.headers.host}/confirmation/${token._token_body}.</p><br/><p style="margin: 0;">We thank you for your faith in us.</p>`, newUser._user_email);
        return res.status(200).json({ _user: newUser, text: 'Verification email sent.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send email.' });
    }
});

// Other routes...

router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .populate({ path: '_user_teams.Team', model: 'Team' })
            .populate('Role')
            .populate('Expertise')
            .populate('Department')
            .populate('Mentor')
            .sort({ createdAt: 'descending' });

        res.json({ _users: users.map(user => user.toJSON()) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching users.' });
    }
});

// User confirmation
router.post('/_confirm', async (req, res) => {
    const { body } = req;
    const token = await Token.findOne({ _token_body: body._tokenID });

    if (!token) {
        return res.status(400).json({ text: 'Invalid or expired token.' });
    }

    const user = await User.findById(token._userId);
    if (!user) return res.status(400).json({ text: 'User not found.' });

    if (user._user_isVerified) return res.status(400).json({ text: 'User already verified.' });

    user._user_isVerified = true;
    token._userIsVerified = true;

    try {
        await user.save();
        await token.save();
        return res.status(200).json({ _user: user, _token: token, text: 'Account verified successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Verification failed.' });
    }
});

// Token check
router.get('/_checkToken', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.sub)
            .populate({ path: '_user_teams.Team', model: 'Team' })
            .populate('Role')
            .populate('Expertise')
            .populate('Department')
            .populate('Mentor');

        return user ? res.status(200).json({ _user: user }) : res.sendStatus(401);
    } catch (error) {
        console.error(error);
        res.sendStatus(401);
    }
});

// Feedback message
router.post('/_sendMessage', async (req, res) => {
    const { body } = req;

    try {
        await sendEmail(body._emailSender, body._name, body._phone, body._newsletter, 'Feedback', body._message, process.env.EMAIL);
        return res.status(200).json({ _message: 'Feedback sent successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send feedback.' });
    }
});

// Login
router.post('/_login', async (req, res) => {
    const { body } = req;

    try {
        if (!body._user_identification || !body._user_password) {
            return res.status(400).json({ text: 'Please fill out both identification and password.' });
        }

        const user = await User.findOne({
            $or: [{ _user_email: body._user_identification }, { _user_username: body._user_identification }],
        }).populate({ path: '_user_teams.Team', model: 'Team' })
            .populate('Role')
            .populate('Expertise')
            .populate('Department')
            .populate('Mentor');

        if (!user) return res.status(401).json({ text: 'User not registered.' });
        if (!user._user_isVerified) return res.status(401).json({ text: 'Account not verified.' });
        if (!user.authenticate(body._user_password, user)) return res.status(401).json({ text: 'Incorrect password.' });

        user._user_isActive = true;
        user._user_toDelete = false;
        user._user_logindate.push(new Date());
        await user.save();

        const token = user.getToken();
        return res.status(200).json({ _user: user, token, text: 'Authentication successful.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Login failed.' });
    }
});

// Logout
router.post('/_logout/:id', async (req, res) => {
    const { body } = req;

    try {
        if (!_.isEmpty(body._user_isVerified) && !_.isUndefined(body._user_isVerified)) {
            req._user._user_isVerified = false;
        }
        await req._user.save();
        return res.json({ _user: req._user.toJSON() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Logout failed.' });
    }
});

// User middleware
router.param('id', async (req, res, next, id) => {
    try {
        const user = await User.findById(id)
            .populate({ path: '_user_teams.Team', model: 'Team' })
            .populate('Role')
            .populate('Expertise')
            .populate('Department')
            .populate('Mentor');

        if (!user) return res.sendStatus(404);
        req._user = user;
        next();
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

export default router;