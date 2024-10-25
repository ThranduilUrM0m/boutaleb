import mongoose from 'mongoose';
import express from 'express';

const Revenue = mongoose.model('Revenue');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._return_type) {
        return res.status(422).json({
            errors: {
                _return_type: 'is required',
            },
        });
    }

    if (!body._revenue_amount) {
        return res.status(422).json({
            errors: {
                _revenue_amount: 'is required',
            },
        });
    }

    const finalRevenue = new Revenue(body);
    return finalRevenue
        .save()
        .then(() => {
            res.json({ _revenue: finalRevenue.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Revenue.find()
        .populate('Investment')
        .sort({ createdAt: 'descending' })
        .then((_revenues) =>
            res.json({
                _revenues: _revenues.map((_revenue) => _revenue.toJSON()),
            }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Revenue.findById(id)
        .populate('Investment')
        .then((_revenue) => {
            if (!_revenue) {
                return res.sendStatus(404);
            }
            req._revenue = _revenue;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _revenue: req._revenue.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._return_type !== 'undefined') {
        req._revenue._return_type = body._return_type;
    }

    if (typeof body._revenue_amount !== 'undefined') {
        req._revenue._revenue_amount = body._revenue_amount;
    }

    if (typeof body.Investment !== 'undefined') {
        req._revenue.Investment = body.Investment;
    }

    return req._revenue
        .save()
        .then(() => res.json({ _revenue: req._revenue.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Revenue.findByIdAndRemove(req._revenue._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
