import mongoose from 'mongoose';
import express from 'express';

const Testimony = mongoose.model('Testimony');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._testimony_author) {
        return res.status(422).json({
            errors: {
                _testimony_author: 'is required',
            },
        });
    }

    if (!body._testimony_email) {
        return res.status(422).json({
            errors: {
                _testimony_email: 'is required',
            },
        });
    }

    if (!body._testimony_body) {
        return res.status(422).json({
            errors: {
                _testimony_body: 'is required',
            },
        });
    }

    if (!body._testimony_fingerprint) {
        return res.status(422).json({
            errors: {
                _testimony_fingerprint: 'is required',
            },
        });
    }

    const finalTestimony = new Testimony(body);
    return finalTestimony.save()
        .then(() => {
            res.json({ _testimony: finalTestimony.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Testimony.find()
        .sort({ createdAt: 'descending' })
        .then((_testimonies) => res.json({ _testimonies: _testimonies.map(_testimony => _testimony.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Testimony.findById(id)
        .then(_testimony => {
            if (!_testimony) {
                return res.sendStatus(404);
            }
            req._testimony = _testimony;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _testimony: req._testimony.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;
    
    if (typeof body._parentId !== 'undefined') {
        req._testimony._parentId = body._parentId;
    }

    if (typeof body._testimony_author !== 'undefined') {
        req._testimony._testimony_author = body._testimony_author;
    }

    if (typeof body._testimony_email !== 'undefined') {
        req._testimony._testimony_email = body._testimony_email;
    }

    if (typeof body._testimony_body !== 'undefined') {
        req._testimony._testimony_body = body._testimony_body;
    }

    if (typeof body._testimony_isPrivate !== 'undefined') {
        req._testimony._testimony_isPrivate = body._testimony_isPrivate;
    }

    if (typeof body._testimony_fingerprint !== 'undefined') {
        req._testimony._testimony_fingerprint = body._testimony_fingerprint;
    }

    if (typeof body._testimony_upvotes !== 'undefined') {
        req._testimony._testimony_upvotes = body._testimony_upvotes;
    }

    if (typeof body._testimony_downvotes !== 'undefined') {
        req._testimony._testimony_downvotes = body._testimony_downvotes;
    }

    return req._testimony.save()
        .then(() => res.json({ _testimony: req._testimony.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Testimony.findByIdAndRemove(req._testimony._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;