import mongoose from 'mongoose';
import express from 'express';

const Insurance = mongoose.model('Insurance');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._insurance_type) {
        return res.status(422).json({
            errors: {
                _insurance_type: 'is required',
            },
        });
    }

    if (!body._insurance_amount) {
        return res.status(422).json({
            errors: {
                _insurance_amount: 'is required',
            },
        });
    }

    if (!body._insurance_provider) {
        return res.status(422).json({
            errors: {
                _insurance_provider: 'is required',
            },
        });
    }

    if (!body._insurance_policyNumber) {
        return res.status(422).json({
            errors: {
                _insurance_policyNumber: 'is required',
            },
        });
    }

    const finalInsurance = new Insurance(body);
    return finalInsurance.save()
        .then(() => {
            res.json({ _insurance: finalInsurance.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Insurance.find()
        .sort({ createdAt: 'descending' })
        .then((_insurances) => res.json({ _insurances: _insurances.map(_insurance => _insurance.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Insurance.findById(id)
        .then(_insurance => {
            if (!_insurance) {
                return res.sendStatus(404);
            }
            req._insurance = _insurance;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _insurance: req._insurance.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._insurance_type !== 'undefined') {
        req._insurance._insurance_type = body._insurance_type;
    }

    if (typeof body._insurance_amount !== 'undefined') {
        req._insurance._insurance_amount = body._insurance_amount;
    }

    if (typeof body._insurance_provider !== 'undefined') {
        req._insurance._insurance_provider = body._insurance_provider;
    }

    if (typeof body._insurance_policyNumber !== 'undefined') {
        req._insurance._insurance_policyNumber = body._insurance_policyNumber;
    }

    if (typeof body._insurance_startDate !== 'undefined') {
        req._insurance._insurance_startDate = body._insurance_startDate;
    }

    if (typeof body._insurance_endDate !== 'undefined') {
        req._insurance._insurance_endDate = body._insurance_endDate;
    }

    if (typeof body._isPersonal !== 'undefined') {
        req._insurance._isPersonal = body._isPersonal;
    }

    return req._insurance.save()
        .then(() => res.json({ _insurance: req._insurance.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Insurance.findByIdAndRemove(req._insurance._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;