import mongoose from 'mongoose';
import express from 'express';

const Saving = mongoose.model('Saving');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._saving_goalAmount) {
        return res.status(422).json({
            errors: {
                _saving_goalAmount: 'is required',
            },
        });
    }

    if (!body._saving_goalDate) {
        return res.status(422).json({
            errors: {
                _saving_goalDate: 'is required',
            },
        });
    }

    if (!body.Priority) {
        return res.status(422).json({
            errors: {
                Priority: 'is required',
            },
        });
    }

    const finalSaving = new Saving(body);
    return finalSaving.save()
        .then(() => {
            res.json({ _saving: finalSaving.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Saving.find()
        .populate('Priority')
        .sort({ createdAt: 'descending' })
        .then((_savings) => res.json({ _savings: _savings.map(_saving => _saving.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Saving.findById(id)
        .populate('Priority')
        .then(_saving => {
            if (!_saving) {
                return res.sendStatus(404);
            }
            req._saving = _saving;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _saving: req._saving.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._saving_goalAmount !== 'undefined') {
        req._saving._saving_goalAmount = body._saving_goalAmount;
    }

    if (typeof body._saving_currentAmount !== 'undefined') {
        req._saving._saving_currentAmount = body._saving_currentAmount;
    }

    if (typeof body._saving_goalDate !== 'undefined') {
        req._saving._saving_goalDate = body._saving_goalDate;
    }

    if (typeof body._isPersonal !== 'undefined') {
        req._saving._isPersonal = body._isPersonal;
    }

    if (typeof body.Priority !== 'undefined') {
        req._saving.Priority = body.Priority;
    }

    return req._saving.save()
        .then(() => res.json({ _saving: req._saving.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Saving.findByIdAndRemove(req._saving._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;