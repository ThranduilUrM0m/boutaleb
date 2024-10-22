import mongoose from 'mongoose';
import express from 'express';

const Salary = mongoose.model('Salary');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._salary_amount) {
        return res.status(422).json({
            errors: {
                _salary_amount: 'is required',
            },
        });
    }

    if (!body._salary_date) {
        return res.status(422).json({
            errors: {
                _salary_date: 'is required',
            },
        });
    }

    if (!body._salary_frequency) {
        return res.status(422).json({
            errors: {
                _salary_frequency: 'is required',
            },
        });
    }

    const finalSalary = new Salary(body);
    return finalSalary.save()
        .then(() => {
            res.json({ _salary: finalSalary.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Salary.find()
        .sort({ createdAt: 'descending' })
        .then((_salarys) => res.json({ _salarys: _salarys.map(_salary => _salary.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Salary.findById(id)
        .then(_salary => {
            if (!_salary) {
                return res.sendStatus(404);
            }
            req._salary = _salary;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _salary: req._salary.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._salary_amount !== 'undefined') {
        req._salary._salary_amount = body._salary_amount;
    }

    if (typeof body._salary_date !== 'undefined') {
        req._salary._salary_date = body._salary_date;
    }

    if (typeof body._salary_frequency !== 'undefined') {
        req._salary._salary_frequency = body._salary_frequency;
    }

    if (typeof body._isPersonal !== 'undefined') {
        req._salary._isPersonal = body._isPersonal;
    }

    return req._salary.save()
        .then(() => res.json({ _salary: req._salary.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Salary.findByIdAndRemove(req._salary._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;