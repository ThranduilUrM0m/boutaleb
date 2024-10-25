import mongoose from 'mongoose';
import express from 'express';

const Priority = mongoose.model('Priority');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._priority_level) {
        return res.status(422).json({
            errors: {
                _priority_level: 'is required',
            },
        });
    }

    const finalPriority = new Priority(body);
    return finalPriority
        .save()
        .then(() => {
            res.json({ _priority: finalPriority.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Priority.find()
        .sort({ createdAt: 'descending' })
        .then((_prioritys) =>
            res.json({
                _prioritys: _prioritys.map((_priority) => _priority.toJSON()),
            }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Priority.findById(id)
        .then((_priority) => {
            if (!_priority) {
                return res.sendStatus(404);
            }
            req._priority = _priority;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _priority: req._priority.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._priority_level !== 'undefined') {
        req._priority._priority_level = body._priority_level;
    }

    if (typeof body._priority_description !== 'undefined') {
        req._priority._priority_description = body._priority_description;
    }

    return req._priority
        .save()
        .then(() => res.json({ _priority: req._priority.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Priority.findByIdAndRemove(req._priority._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
