import mongoose from 'mongoose';
import express from 'express';

const Benefit = mongoose.model('Benefit');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._benefit_type) {
        return res.status(422).json({
            errors: {
                _benefit_type: 'is required',
            },
        });
    }

    if (!body.User) {
        return res.status(422).json({
            errors: {
                User: 'is required',
            },
        });
    }

    const finalBenefit = new Benefit(body);
    return finalBenefit.save()
        .then(() => {
            res.json({ _benefit: finalBenefit.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Benefit.find()
        .populate('User')
        .sort({ createdAt: 'descending' })
        .then((_benefits) => res.json({ _benefits: _benefits.map(_benefit => _benefit.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Benefit.findById(id)
        .populate('User')
        .then(_benefit => {
            if (!_benefit) {
                return res.sendStatus(404);
            }
            req._benefit = _benefit;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _benefit: req._benefit.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._benefit_type !== 'undefined') {
        req._benefit._benefit_type = body._benefit_type;
    }

    if (typeof body._benefit_description !== 'undefined') {
        req._benefit._benefit_description = body._benefit_description;
    }

    if (typeof body.User !== 'undefined') {
        req._benefit.User = body.User;
    }

    return req._benefit.save()
        .then(() => res.json({ _benefit: req._benefit.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Benefit.findByIdAndRemove(req._benefit._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;