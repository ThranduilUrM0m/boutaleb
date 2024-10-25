import mongoose from 'mongoose';
import express from 'express';

const Client = mongoose.model('Client');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._client_email) {
        return res.status(422).json({
            errors: {
                _client_email: 'is required',
            },
        });
    }

    if (!body._client_title) {
        return res.status(422).json({
            errors: {
                _client_title: 'is required',
            },
        });
    }

    if (!body._client_city) {
        return res.status(422).json({
            errors: {
                _client_city: 'is required',
            },
        });
    }

    if (!body._client_country) {
        return res.status(422).json({
            errors: {
                _client_country: 'is required',
            },
        });
    }

    if (!body._client_phone) {
        return res.status(422).json({
            errors: {
                _client_phone: 'is required',
            },
        });
    }

    const finalClient = new Client(body);
    return finalClient
        .save()
        .then(() => {
            res.json({ _client: finalClient.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Client.find()
        .populate('Payment')
        .populate('Invoice')
        .populate('Project')
        .sort({ createdAt: 'descending' })
        .then((_clients) =>
            res.json({ _clients: _clients.map((_client) => _client.toJSON()) }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Client.findById(id)
        .populate('Payment')
        .populate('Invoice')
        .populate('Project')
        .then((_client) => {
            if (!_client) {
                return res.sendStatus(404);
            }
            req._client = _client;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _client: req._client.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._client_email !== 'undefined') {
        req._client._client_email = body._client_email;
    }

    if (typeof body._client_title !== 'undefined') {
        req._client._client_title = body._client_title;
    }

    if (typeof body._client_picture !== 'undefined') {
        req._client._client_picture = body._client_picture;
    }

    if (typeof body._client_city !== 'undefined') {
        req._client._client_city = body._client_city;
    }

    if (typeof body._client_country !== 'undefined') {
        req._client._client_country = body._client_country;
    }

    if (typeof body._client_phone !== 'undefined') {
        req._client._client_phone = body._client_phone;
    }

    if (typeof body._client_toDelete !== 'undefined') {
        req._client._client_toDelete = body._client_toDelete;
    }

    if (typeof body._client_isActive !== 'undefined') {
        req._client._client_isActive = body._client_isActive;
    }

    if (typeof body.Payment !== 'undefined') {
        req._client.Payment = body.Payment;
    }

    if (typeof body.Invoice !== 'undefined') {
        req._client.Invoice = body.Invoice;
    }

    if (typeof body.Project !== 'undefined') {
        req._client.Project = body.Project;
    }

    return req._client
        .save()
        .then(() => res.json({ _client: req._client.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Client.findByIdAndRemove(req._client._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
