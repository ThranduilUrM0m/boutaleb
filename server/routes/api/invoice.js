import mongoose from 'mongoose';
import express from 'express';

const Invoice = mongoose.model('Invoice');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._invoice_number) {
        return res.status(422).json({
            errors: {
                _invoice_number: 'is required',
            },
        });
    }

    if (!body._invoice_dateIssued) {
        return res.status(422).json({
            errors: {
                _invoice_dateIssued: 'is required',
            },
        });
    }

    if (!body._invoice_dueDate) {
        return res.status(422).json({
            errors: {
                _invoice_dueDate: 'is required',
            },
        });
    }

    if (!body._invoice_amount) {
        return res.status(422).json({
            errors: {
                _invoice_amount: 'is required',
            },
        });
    }

    if (!body._invoice_status) {
        return res.status(422).json({
            errors: {
                _invoice_status: 'is required',
            },
        });
    }

    if (!body._invoice_items) {
        return res.status(422).json({
            errors: {
                _invoice_items: 'is required',
            },
        });
    }

    if (!body._invoice_currency) {
        return res.status(422).json({
            errors: {
                _invoice_currency: 'is required',
            },
        });
    }

    if (!body._invoice_tax) {
        return res.status(422).json({
            errors: {
                _invoice_tax: 'is required',
            },
        });
    }

    if (!body._invoice_discount) {
        return res.status(422).json({
            errors: {
                _invoice_discount: 'is required',
            },
        });
    }

    if (!body._invoice_notes) {
        return res.status(422).json({
            errors: {
                _invoice_notes: 'is required',
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

    const finalInvoice = new Invoice(body);
    return finalInvoice.save()
        .then(() => {
            res.json({ _invoice: finalInvoice.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Invoice.find()
        .populate('Client')
        .sort({ createdAt: 'descending' })
        .then((_invoices) => res.json({ _invoices: _invoices.map(_invoice => _invoice.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Invoice.findById(id)
        .populate('Client')
        .then(_invoice => {
            if (!_invoice) {
                return res.sendStatus(404);
            }
            req._invoice = _invoice;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _invoice: req._invoice.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._invoice_number !== 'undefined') {
        req._invoice._invoice_number = body._invoice_number;
    }

    if (typeof body._invoice_dateIssued !== 'undefined') {
        req._invoice._invoice_dateIssued = body._invoice_dateIssued;
    }

    if (typeof body._invoice_dueDate !== 'undefined') {
        req._invoice._invoice_dueDate = body._invoice_dueDate;
    }

    if (typeof body._invoice_amount !== 'undefined') {
        req._invoice._invoice_amount = body._invoice_amount;
    }

    if (typeof body._invoice_status !== 'undefined') {
        req._invoice._invoice_status = body._invoice_status;
    }

    if (typeof body._invoice_items !== 'undefined') {
        req._invoice._invoice_items = body._invoice_items;
    }

    if (typeof body._invoice_currency !== 'undefined') {
        req._invoice._invoice_currency = body._invoice_currency;
    }

    if (typeof body._invoice_tax !== 'undefined') {
        req._invoice._invoice_tax = body._invoice_tax;
    }

    if (typeof body._invoice_discount !== 'undefined') {
        req._invoice._invoice_discount = body._invoice_discount;
    }

    if (typeof body._invoice_notes !== 'undefined') {
        req._invoice._invoice_notes = body._invoice_notes;
    }

    if (typeof body.Client !== 'undefined') {
        req._invoice.Client = body.Client;
    }

    return req._invoice.save()
        .then(() => res.json({ _invoice: req._invoice.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Invoice.findByIdAndRemove(req._invoice._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;