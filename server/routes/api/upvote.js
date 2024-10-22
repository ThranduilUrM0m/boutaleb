import mongoose from 'mongoose';
import express from 'express';

const Upvote = mongoose.model('Upvote');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._upvoter) {
        return res.status(422).json({
            errors: {
                _upvoter: 'is required',
            },
        });
    }

    const finalUpvote = new Upvote(body);
    return finalUpvote.save()
        .then(() => {
            res.json({ _upvote: finalUpvote.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Upvote.find()
        .sort({ createdAt: 'descending' })
        .then((_testimonies) => res.json({ _testimonies: _testimonies.map(_upvote => _upvote.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Upvote.findById(id)
        .then(_upvote => {
            if (!_upvote) {
                return res.sendStatus(404);
            }
            req._upvote = _upvote;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _upvote: req._upvote.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;
    
    if (typeof body._upvoter !== 'undefined') {
        req._upvote._upvoter = body._upvoter;
    }

    return req._upvote.save()
        .then(() => res.json({ _upvote: req._upvote.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Upvote.findByIdAndRemove(req._upvote._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;