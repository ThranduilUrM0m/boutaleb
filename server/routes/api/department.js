import mongoose from 'mongoose';
import express from 'express';

const Department = mongoose.model('Department');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._department_title) {
        return res.status(422).json({
            errors: {
                _department_title: 'is required',
            },
        });
    }

    const finalDepartment = new Department(body);
    return finalDepartment
        .save()
        .then(() => {
            res.json({ _department: finalDepartment.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Department.find()
        .sort({ createdAt: 'descending' })
        .then((_departments) =>
            res.json({
                _departments: _departments.map((_department) =>
                    _department.toJSON(),
                ),
            }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Department.findById(id)
        .then((_department) => {
            if (!_department) {
                return res.sendStatus(404);
            }
            req._department = _department;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _department: req._department.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._department_title !== 'undefined') {
        req._department._department_title = body._department_title;
    }

    if (typeof body._department_description !== 'undefined') {
        req._department._department_description = body._department_description;
    }

    return req._department
        .save()
        .then(() => res.json({ _department: req._department.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Department.findByIdAndRemove(req._department._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
