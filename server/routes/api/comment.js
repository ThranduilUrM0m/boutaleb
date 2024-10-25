import mongoose from 'mongoose';
import express from 'express';

const Comment = mongoose.model('Comment');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._comment_author) {
        return res.status(422).json({
            errors: {
                _comment_author: 'is required',
            },
        });
    }

    if (!body._comment_body) {
        return res.status(422).json({
            errors: {
                _comment_body: 'is required',
            },
        });
    }

    if (!body._comment_fingerprint) {
        return res.status(422).json({
            errors: {
                _comment_fingerprint: 'is required',
            },
        });
    }

    const finalComment = new Comment(body);
    return finalComment
        .save()
        .then(() => {
            res.json({ _comment: finalComment.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Comment.find()
        .populate('Upvote')
        .populate('Downvote')
        .populate('Comment')
        .sort({ createdAt: 'descending' })
        .then((_comments) =>
            res.json({
                _comments: _comments.map((_comment) => _comment.toJSON()),
            }),
        )
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Comment.findById(id)
        .populate('Upvote')
        .populate('Downvote')
        .populate('Comment')
        .then((_comment) => {
            if (!_comment) {
                return res.sendStatus(404);
            }
            req._comment = _comment;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _comment: req._comment.toJSON(),
    });
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body.Parent !== 'undefined') {
        req._comment.Parent = body.Parent;
    }

    if (typeof body._comment_author !== 'undefined') {
        req._comment._comment_author = body._comment_author;
    }

    if (typeof body._comment_email !== 'undefined') {
        req._comment._comment_email = body._comment_email;
    }

    if (typeof body._comment_body !== 'undefined') {
        req._comment._comment_body = body._comment_body;
    }

    if (typeof body._comment_isPrivate !== 'undefined') {
        req._comment._comment_isPrivate = body._comment_isPrivate;
    }

    if (typeof body._comment_fingerprint !== 'undefined') {
        req._comment._comment_fingerprint = body._comment_fingerprint;
    }

    if (typeof body._comment_upvotes !== 'undefined') {
        req._comment._comment_upvotes = body._comment_upvotes;
    }

    if (typeof body._comment_downvotes !== 'undefined') {
        req._comment._comment_downvotes = body._comment_downvotes;
    }

    return req._comment
        .save()
        .then(() => res.json({ _comment: req._comment.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Comment.findByIdAndRemove(req._comment._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;
