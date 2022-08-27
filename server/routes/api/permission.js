import mongoose from 'mongoose';
import express from 'express';

const Permission = mongoose.model('Permission');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._permission_titre) {
        return res.status(422).json({
            errors: {
                _permission_titre: 'is required',
            },
        });
    }

    const finalPermission = new Permission(body);
    return finalPermission.save()
        .then(() => {
            res.json({ _permission: finalPermission.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Permission.find()
        .sort({ createdAt: 'descending' })
        .then((_permissions) => res.json({ _permissions: _permissions.map(_permission => _permission.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Permission.findById(id, (err, _permission) => {
        if (err) {
            return res.sendStatus(404);
        } else if (_permission) {
            req._permission = _permission;
            return next();
        }
    }).catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _permission: req._permission.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._permission_titre !== 'undefined') {
        req._permission._permission_titre = body._permission_titre;
    }

    return req._permission.save()
        .then(() => res.json({ _permission: req._permission.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Permission.findByIdAndRemove(req._permission._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;