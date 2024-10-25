import mongoose from 'mongoose';
import express from 'express';

const Income = mongoose.model('Income');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._income_type) {
        return res.status(422).json({
            errors: {
                _income_type: 'is required',
            },
        });
    }

    if (!body._income_amount) {
        return res.status(422).json({
            errors: {
                _income_amount: 'is required',
            },
        });
    }

    if (!body._income_date) {
        return res.status(422).json({
            errors: {
                _income_date: 'is required',
            },
        });
    }

    if (!body._income_source) {
        return res.status(422).json({
            errors: {
                _income_source: 'is required',
            },
        });
    }

    const finalIncome = new Income(body);
    return finalIncome
        .save()
        .then(() => {
            res.json({ _income: finalIncome.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Income.find()
        .sort({ createdAt: 'descending' })
        .then((_incomes) =>
            res.json({ _incomes: _incomes.map((_income) => _income.toJSON()) }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Income.findById(id)
        .then((_income) => {
            if (!_income) {
                return res.sendStatus(404);
            }
            req._income = _income;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _income: req._income.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._income_type !== 'undefined') {
        req._income._income_type = body._income_type;
    }

    if (typeof body._income_amount !== 'undefined') {
        req._income._income_amount = body._income_amount;
    }

    if (typeof body._income_date !== 'undefined') {
        req._income._income_date = body._income_date;
    }

    if (typeof body._income_source !== 'undefined') {
        req._income._income_source = body._income_source;
    }

    if (typeof body._isPersonal !== 'undefined') {
        req._income._isPersonal = body._isPersonal;
    }

    return req._income
        .save()
        .then(() => res.json({ _income: req._income.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Income.findByIdAndRemove(req._income._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
