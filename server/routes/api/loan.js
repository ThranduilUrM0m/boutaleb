import mongoose from 'mongoose';
import express from 'express';

const Loan = mongoose.model('Loan');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._loan_goalAmount) {
        return res.status(422).json({
            errors: {
                _loan_goalAmount: 'is required',
            },
        });
    }

    if (!body._loan_interestRate) {
        return res.status(422).json({
            errors: {
                _loan_interestRate: 'is required',
            },
        });
    }

    if (!body._loan_paymentFrequency) {
        return res.status(422).json({
            errors: {
                _loan_paymentFrequency: 'is required',
            },
        });
    }

    if (!body._loan_goalDate) {
        return res.status(422).json({
            errors: {
                _loan_goalDate: 'is required',
            },
        });
    }

    if (!body._loan_startDate) {
        return res.status(422).json({
            errors: {
                _loan_startDate: 'is required',
            },
        });
    }

    if (!body._loan_type) {
        return res.status(422).json({
            errors: {
                _loan_type: 'is required',
            },
        });
    }

    if (!body._loan_term) {
        return res.status(422).json({
            errors: {
                _loan_term: 'is required',
            },
        });
    }

    if (!body._loan_description) {
        return res.status(422).json({
            errors: {
                _loan_description: 'is required',
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

    const finalLoan = new Loan(body);
    return finalLoan.save()
        .then(() => {
            res.json({ _loan: finalLoan.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Loan.find()
        .populate('Priority')
        .sort({ createdAt: 'descending' })
        .then((_loans) => res.json({ _loans: _loans.map(_loan => _loan.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Loan.findById(id)
        .populate('Priority')
        .then(_loan => {
            if (!_loan) {
                return res.sendStatus(404);
            }
            req._loan = _loan;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _loan: req._loan.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._loan_goalAmount !== 'undefined') {
        req._loan._loan_goalAmount = body._loan_goalAmount;
    }

    if (typeof body._loan_currentAmount !== 'undefined') {
        req._loan._loan_currentAmount = body._loan_currentAmount;
    }

    if (typeof body._loan_interestRate !== 'undefined') {
        req._loan._loan_interestRate = body._loan_interestRate;
    }

    if (typeof body._loan_paymentFrequency !== 'undefined') {
        req._loan._loan_paymentFrequency = body._loan_paymentFrequency;
    }

    if (typeof body._loan_goalDate !== 'undefined') {
        req._loan._loan_goalDate = body._loan_goalDate;
    }

    if (typeof body._loan_startDate !== 'undefined') {
        req._loan._loan_startDate = body._loan_startDate;
    }

    if (typeof body._loan_type !== 'undefined') {
        req._loan._loan_type = body._loan_type;
    }

    if (typeof body._loan_term !== 'undefined') {
        req._loan._loan_term = body._loan_term;
    }

    if (typeof body._loan_description !== 'undefined') {
        req._loan._loan_description = body._loan_description;
    }

    if (typeof body._isPersonal !== 'undefined') {
        req._loan._isPersonal = body._isPersonal;
    }

    if (typeof body.Priority !== 'undefined') {
        req._loan.Priority = body.Priority;
    }

    return req._loan.save()
        .then(() => res.json({ _loan: req._loan.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Loan.findByIdAndRemove(req._loan._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;