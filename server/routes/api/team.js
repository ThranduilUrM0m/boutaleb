import mongoose from 'mongoose';
import express from 'express';

const Team = mongoose.model('Team');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._team_title) {
        return res.status(422).json({
            errors: {
                _team_title: 'is required',
            },
        });
    }

    if (!body.Department) {
        return res.status(422).json({
            errors: {
                Department: 'is required',
            },
        });
    }

    if (!body.Project) {
        return res.status(422).json({
            errors: {
                Project: 'is required',
            },
        });
    }

    const finalTeam = new Team(body);
    return finalTeam
        .save()
        .then(() => {
            res.json({ _team: finalTeam.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Team.find()
        .populate('Department')
        .populate('Project')
        .sort({ createdAt: 'descending' })
        .then((_teams) =>
            res.json({ _teams: _teams.map((_team) => _team.toJSON()) }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Team.findById(id)
        .populate('Department')
        .populate('Project')
        .then((_team) => {
            if (!_team) {
                return res.sendStatus(404);
            }
            req._team = _team;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _team: req._team.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body._team_title !== 'undefined') {
        req._team._team_title = body._team_title;
    }

    if (typeof body._team_description !== 'undefined') {
        req._team._team_description = body._team_description;
    }

    if (typeof body.Department !== 'undefined') {
        req._team.Department = body.Department;
    }

    if (typeof body.Project !== 'undefined') {
        req._team.Project = body.Project;
    }

    return req._team
        .save()
        .then(() => res.json({ _team: req._team.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Team.findByIdAndRemove(req._team._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
