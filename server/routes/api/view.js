import mongoose from 'mongoose';
import express from 'express';

const View = mongoose.model('View');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._viewer) {
        return res.status(422).json({
            errors: {
                _viewer: 'is required',
            },
        });
    }

    const finalView = new View(body);
    return finalView
        .save()
        .then(() => {
            res.json({ _view: finalView.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return View.find()
        .sort({ createdAt: 'descending' })
        .then((_testimonies) =>
            res.json({
                _testimonies: _testimonies.map((_view) => _view.toJSON()),
            }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return View.findById(id)
        .then((_view) => {
            if (!_view) {
                return res.sendStatus(404);
            }
            req._view = _view;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _view: req._view.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._viewer !== 'undefined') {
        req._view._viewer = body._viewer;
    }

    return req._view
        .save()
        .then(() => res.json({ _view: req._view.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return View.findByIdAndRemove(req._view._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
