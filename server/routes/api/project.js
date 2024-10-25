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

    const finalProject = new Project(body);
    return finalProject
        .save()
        .then(() => {
            res.json({ _project: finalProject.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Project.find()
        .populate({
            path: '_project_teams.Team',
            model: 'Team',
        })
        .populate({
            path: '_project_teams.assignedTasks.__assignedTo',
            model: 'User',
        })
        .sort({ createdAt: 'descending' })
        .then((_projects) =>
            res.json({
                _projects: _projects.map((_project) => _project.toJSON()),
            }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Project.findById(id)
        .populate({
            path: '_project_teams.Team',
            model: 'Team',
        })
        .populate({
            path: '_project_teams.assignedTasks.__assignedTo',
            model: 'User',
        })
        .then((_project) => {
            if (!_project) {
                return res.sendStatus(404);
            }
            req._project = _project;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _project: req._project.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._project_title !== 'undefined') {
        req._project._project_title = body._project_title;
    }

    if (typeof body._project_image !== 'undefined') {
        req._project._project_image = body._project_image;
    }

    if (typeof body._project_link !== 'undefined') {
        req._project._project_link = body._project_link;
    }

    if (typeof body._project_toDisplay !== 'undefined') {
        req._project._project_toDisplay = body._project_toDisplay;
    }

    if (typeof body._project_tags !== 'undefined') {
        req._project._project_tags = body._project_tags;
    }

    if (typeof body._project_description !== 'undefined') {
        req._project._project_description = body._project_description;
    }

    if (typeof body._project_startDate !== 'undefined') {
        req._project._project_startDate = body._project_startDate;
    }

    if (typeof body._project_deadline !== 'undefined') {
        req._project._project_deadline = body._project_deadline;
    }

    if (typeof body._project_milestones !== 'undefined') {
        req._project._project_milestones = body._project_milestones;
    }

    if (typeof body._project_teams !== 'undefined') {
        req._project._project_teams = body._project_teams;
    }

    return req._project
        .save()
        .then(() => res.json({ _project: req._project.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Project.findByIdAndRemove(req._project._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
