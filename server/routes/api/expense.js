import mongoose from 'mongoose';
import express from 'express';

const Expense = mongoose.model('Expense');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._expense_category) {
        return res.status(422).json({
            errors: {
                _expense_category: 'is required',
            },
        });
    }

    if (!body._expense_amount) {
        return res.status(422).json({
            errors: {
                _expense_amount: 'is required',
            },
        });
    }

    if (!body._expense_date) {
        return res.status(422).json({
            errors: {
                _expense_date: 'is required',
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

    const finalExpense = new Expense(body);
    return finalExpense
        .save()
        .then(() => {
            res.json({ _expense: finalExpense.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Expense.find()
        .populate('Priority')
        .sort({ createdAt: 'descending' })
        .then((_expenses) =>
            res.json({
                _expenses: _expenses.map((_expense) => _expense.toJSON()),
            }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Expense.findById(id)
        .populate('Priority')
        .then((_expense) => {
            if (!_expense) {
                return res.sendStatus(404);
            }
            req._expense = _expense;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _expense: req._expense.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._expense_category !== 'undefined') {
        req._expense._expense_category = body._expense_category;
    }

    if (typeof body._expense_amount !== 'undefined') {
        req._expense._expense_amount = body._expense_amount;
    }

    if (typeof body._expense_date !== 'undefined') {
        req._expense._expense_date = body._expense_date;
    }

    if (typeof body._isPersonal !== 'undefined') {
        req._expense._isPersonal = body._isPersonal;
    }

    if (typeof body.Priority !== 'undefined') {
        req._expense.Priority = body.Priority;
    }

    return req._expense
        .save()
        .then(() => res.json({ _expense: req._expense.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Expense.findByIdAndRemove(req._expense._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
