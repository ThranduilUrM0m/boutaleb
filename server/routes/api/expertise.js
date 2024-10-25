import mongoose from 'mongoose';
import express from 'express';

const Expertise = mongoose.model('Expertise');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._expertise_title) {
        return res.status(422).json({
            errors: {
                _expertise_title: 'is required',
            },
        });
    }

    const finalExpertise = new Expertise(body);
    return finalExpertise
        .save()
        .then(() => {
            res.json({ _expertise: finalExpertise.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Expertise.find()
        .sort({ createdAt: 'descending' })
        .then((_expertises) =>
            res.json({
                _expertises: _expertises.map((_expertise) =>
                    _expertise.toJSON(),
                ),
            }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Expertise.findById(id)
        .then((_expertise) => {
            if (!_expertise) {
                return res.sendStatus(404);
            }
            req._expertise = _expertise;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _expertise: req._expertise.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._expertise_title !== 'undefined') {
        req._expertise._expertise_title = body._expertise_title;
    }

    if (typeof body._expertise_description !== 'undefined') {
        req._expertise._expertise_description = body._expertise_description;
    }

    return req._expertise
        .save()
        .then(() => res.json({ _expertise: req._expertise.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Expertise.findByIdAndRemove(req._expertise._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
