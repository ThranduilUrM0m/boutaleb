import mongoose from 'mongoose';
import express from 'express';

const Payment = mongoose.model('Payment');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._payment_number) {
        return res.status(422).json({
            errors: {
                _payment_number: 'is required',
            },
        });
    }

    if (!body._payment_dateIssued) {
        return res.status(422).json({
            errors: {
                _payment_dateIssued: 'is required',
            },
        });
    }

    if (!body._payment_dueDate) {
        return res.status(422).json({
            errors: {
                _payment_dueDate: 'is required',
            },
        });
    }

    if (!body._payment_amount) {
        return res.status(422).json({
            errors: {
                _payment_amount: 'is required',
            },
        });
    }

    if (!body._payment_method) {
        return res.status(422).json({
            errors: {
                _payment_method: 'is required',
            },
        });
    }

    if (!body._payment_status) {
        return res.status(422).json({
            errors: {
                _payment_status: 'is required',
            },
        });
    }

    if (!body._payment_items) {
        return res.status(422).json({
            errors: {
                _payment_items: 'is required',
            },
        });
    }

    if (!body._payment_currency) {
        return res.status(422).json({
            errors: {
                _payment_currency: 'is required',
            },
        });
    }

    if (!body._payment_tax) {
        return res.status(422).json({
            errors: {
                _payment_tax: 'is required',
            },
        });
    }

    if (!body._payment_discount) {
        return res.status(422).json({
            errors: {
                _payment_discount: 'is required',
            },
        });
    }

    if (!body._payment_notes) {
        return res.status(422).json({
            errors: {
                _payment_notes: 'is required',
            },
        });
    }

    if (!body.Client) {
        return res.status(422).json({
            errors: {
                Client: 'is required',
            },
        });
    }

    if (!body.Invoice) {
        return res.status(422).json({
            errors: {
                Invoice: 'is required',
            },
        });
    }

    const finalPayment = new Payment(body);
    return finalPayment
        .save()
        .then(() => {
            res.json({ _payment: finalPayment.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Payment.find()
        .populate('Client')
        .populate('Invoice')
        .sort({ createdAt: 'descending' })
        .then((_payments) =>
            res.json({
                _payments: _payments.map((_payment) => _payment.toJSON()),
            }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Payment.findById(id)
        .populate('Client')
        .populate('Invoice')
        .then((_payment) => {
            if (!_payment) {
                return res.sendStatus(404);
            }
            req._payment = _payment;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _payment: req._payment.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._payment_number !== 'undefined') {
        req._payment._payment_number = body._payment_number;
    }

    if (typeof body._payment_dateIssued !== 'undefined') {
        req._payment._payment_dateIssued = body._payment_dateIssued;
    }

    if (typeof body._payment_dueDate !== 'undefined') {
        req._payment._payment_dueDate = body._payment_dueDate;
    }

    if (typeof body._payment_amount !== 'undefined') {
        req._payment._payment_amount = body._payment_amount;
    }

    if (typeof body._payment_method !== 'undefined') {
        req._payment._payment_method = body._payment_method;
    }

    if (typeof body._payment_status !== 'undefined') {
        req._payment._payment_status = body._payment_status;
    }

    if (typeof body._payment_items !== 'undefined') {
        req._payment._payment_items = body._payment_items;
    }

    if (typeof body._payment_currency !== 'undefined') {
        req._payment._payment_currency = body._payment_currency;
    }

    if (typeof body._payment_tax !== 'undefined') {
        req._payment._payment_tax = body._payment_tax;
    }

    if (typeof body._payment_discount !== 'undefined') {
        req._payment._payment_discount = body._payment_discount;
    }

    if (typeof body._payment_notes !== 'undefined') {
        req._payment._payment_notes = body._payment_notes;
    }

    if (typeof body.Client !== 'undefined') {
        req._payment.Client = body.Client;
    }

    if (typeof body.Invoice !== 'undefined') {
        req._payment.Invoice = body.Invoice;
    }

    return req._payment
        .save()
        .then(() => res.json({ _payment: req._payment.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Payment.findByIdAndRemove(req._payment._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
