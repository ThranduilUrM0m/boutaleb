import mongoose from 'mongoose';
import express from 'express';

const Investment = mongoose.model('Investment');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._investment_goalAmount) {
        return res.status(422).json({
            errors: {
                _investment_goalAmount: 'is required',
            },
        });
    }

    if (!body._investment_goalDate) {
        return res.status(422).json({
            errors: {
                _investment_goalDate: 'is required',
            },
        });
    }

    if (!body._investment_type) {
        return res.status(422).json({
            errors: {
                _investment_type: 'is required',
            },
        });
    }

    const finalInvestment = new Investment(body);
    return finalInvestment.save()
        .then(() => {
            res.json({ _investment: finalInvestment.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Investment.find()
        .populate({
            path: '_investment_revenu.Revenu',
            model: 'Revenu'
        })
        .sort({ createdAt: 'descending' })
        .then((_investments) => res.json({ _investments: _investments.map(_investment => _investment.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Investment.findById(id)
        .populate({
            path: '_investment_revenu.Revenu',
            model: 'Revenu'
        })
        .then(_investment => {
            if (!_investment) {
                return res.sendStatus(404);
            }
            req._investment = _investment;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _investment: req._investment.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._investment_goalAmount !== 'undefined') {
        req._investment._investment_goalAmount = body._investment_goalAmount;
    }

    if (typeof body._investment_currentAmount !== 'undefined') {
        req._investment._investment_currentAmount = body._investment_currentAmount;
    }

    if (typeof body._investment_goalDate !== 'undefined') {
        req._investment._investment_goalDate = body._investment_goalDate;
    }

    if (typeof body._investment_startDate !== 'undefined') {
        req._investment._investment_startDate = body._investment_startDate;
    }

    if (typeof body._investment_type !== 'undefined') {
        req._investment._investment_type = body._investment_type;
    }

    if (typeof body._investment_description !== 'undefined') {
        req._investment._investment_description = body._investment_description;
    }

    if (typeof body._investment_revenu !== 'undefined') {
        req._investment._investment_revenu = body._investment_revenu;
    }

    if (typeof body._isPersonal !== 'undefined') {
        req._investment._isPersonal = body._isPersonal;
    }

    return req._investment.save()
        .then(() => res.json({ _investment: req._investment.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Investment.findByIdAndRemove(req._investment._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;