import mongoose from 'mongoose';
import express from 'express';

const Project = mongoose.model('Project');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._project_title) {
        return res.status(422).json({
            errors: {
                _project_title: 'is required',
            },
        });
    }

    if (!body._project_image) {
        return res.status(422).json({
            errors: {
                _project_image: 'is required',
            },
        });
    }

    if (!body._project_author) {
        return res.status(422).json({
            errors: {
                _project_author: 'is required',
            },
        });
    }

    if (!body._project_link) {
        return res.status(422).json({
            errors: {
                _project_link: 'is required',
            },
        });
    }

    const finalProject = new Project(body);
    return finalProject.save()
        .then(() => {
            res.json({ _project: finalProject.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Project.find()
        .sort({ createdAt: 'descending' })
        .then((_projects) => res.json({ _projects: _projects.map(_project => _project.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Project.findById(id, (err, _project) => {
        if (err) {
            return res.sendStatus(404);
        } else if (_project) {
            req._project = _project;
            return next();
        }
    }).catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _project: req._project.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._project_title !== 'undefined') {
        req._project._project_title = body._project_title;
    }

    if (typeof body._project_author !== 'undefined') {
        req._project._project_author = body._project_author;
    }

    if (typeof body._project_image !== 'undefined') {
        req._project._project_image = body._project_image;
    }

    if (typeof body._project_link !== 'undefined') {
        req._project._project_link = body._project_link;
    }

    if (typeof body._project_hide !== 'undefined') {
        req._project._project_hide = body._project_hide;
    }

    if (typeof body._project_tag !== 'undefined') {
        req._project._project_tag = body._project_tag;
    }

    if (typeof body._project_comment !== 'undefined') {
        req._project._project_comment = body._project_comment;
    }

    if (typeof body._project_upvotes !== 'undefined') {
        req._project._project_upvotes = body._project_upvotes;
    }

    if (typeof body._project_downvotes !== 'undefined') {
        req._project._project_downvotes = body._project_downvotes;
    }

    if (typeof body._project_view !== 'undefined') {
        req._project._project_view = body._project_view;
    }

    return req._project.save()
        .then(() => res.json({ _project: req._project.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Project.findByIdAndRemove(req._project._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;