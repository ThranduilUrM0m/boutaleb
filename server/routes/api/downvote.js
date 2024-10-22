import mongoose from 'mongoose';
import express from 'express';

const Downvote = mongoose.model('Downvote');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._downvoter) {
        return res.status(422).json({
            errors: {
                _downvoter: 'is required',
            },
        });
    }

    const finalDownvote = new Downvote(body);
    return finalDownvote.save()
        .then(() => {
            res.json({ _downvote: finalDownvote.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Downvote.find()
        .sort({ createdAt: 'descending' })
        .then((_downvotes) => res.json({ _downvotes: _downvotes.map(_downvote => _downvote.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Downvote.findById(id)
        .then(_downvote => {
            if (!_downvote) {
                return res.sendStatus(404);
            }
            req._downvote = _downvote;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _downvote: req._downvote.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._downvoter !== 'undefined') {
        req._downvote._downvoter = body._downvoter;
    }

    return req._downvote.save()
        .then(() => res.json({ _downvote: req._downvote.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Downvote.findByIdAndRemove(req._downvote._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;