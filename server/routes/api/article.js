import mongoose from 'mongoose';
import express from 'express';

const Article = mongoose.model('Article');
const User = mongoose.model('User');
const Comment = mongoose.model('Comment');
const View = mongoose.model('View');
const Upvote = mongoose.model('Upvote');
const Downvote = mongoose.model('Downvote');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._article_title) {
        return res.status(422).json({
            errors: {
                _article_title: 'is required',
            },
        });
    }

    if (!body._article_body) {
        return res.status(422).json({
            errors: {
                _article_body: 'is required',
            },
        });
    }

    if (!body._article_author) {
        return res.status(422).json({
            errors: {
                _article_author: 'is required',
            },
        });
    }

    if (!body._article_category) {
        return res.status(422).json({
            errors: {
                _article_category: 'is required',
            },
        });
    }

    const finalArticle = new Article(body);
    return finalArticle.save()
        .then(() => {
            res.json({ _article: finalArticle.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Article.find()
        .populate({
            path: '_article_author',
            model: 'User'
        })
        .populate({
            path: '_article_comments',
            model: 'Comment'
        })
        .populate({
            path: '_article_views',
            model: 'View'
        })
        .populate({
            path: '_article_upvotes',
            model: 'Upvote'
        })
        .populate({
            path: '_article_downvotes',
            model: 'Downvote'
        })
        .sort({ createdAt: 'descending' })
        .then((_articles) => res.json({ _articles: _articles.map(_article => _article.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Article.findById(id)
        .populate({
            path: '_article_author',
            model: 'User'
        })
        .populate({
            path: '_article_comments',
            model: 'Comment'
        })
        .populate({
            path: '_article_views',
            model: 'View'
        })
        .populate({
            path: '_article_upvotes',
            model: 'Upvote'
        })
        .populate({
            path: '_article_downvotes',
            model: 'Downvote'
        })
        .then(_article => {
            if (!_article) {
                return res.sendStatus(404);
            }
            req._article = _article;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _article: req._article.toJSON()
    })
});

router.patch('/:id', async (req, res, next) => {
    const { body } = req;

    if (typeof body._article_title !== 'undefined') {
        req._article._article_title = body._article_title;
    }

    if (typeof body._article_author !== 'undefined') {
        req._article._article_author = body._article_author;
    }

    if (typeof body._article_body !== 'undefined') {
        req._article._article_body = body._article_body;
    }

    if (typeof body._article_category !== 'undefined') {
        req._article._article_category = body._article_category;
    }

    if (typeof body._article_isPrivate !== 'undefined') {
        req._article._article_isPrivate = body._article_isPrivate;
    }

    if (typeof body._article_tags !== 'undefined') {
        req._article._article_tags = body._article_tags;
    }

    return req._article.save()
        .then(() => res.json({ _article: req._article.toJSON() }))
        .catch(next);
});

router.patch('/:id/_downvote', async (req, res, next) => {
    const { _fingerprint } = req.body;

    try {
        let __type = '';
        const __upvoteFind = await Upvote.findOne({ _upvoter: _fingerprint });
        const __downvoteFind = await Downvote.findOne({ _downvoter: _fingerprint });

        if (!__downvoteFind) {
            const __downvote = await Downvote.create({ _downvoter: _fingerprint });
            req._article._article_downvotes.push(__downvote._id);
            __type = '_articleDownvoted';

            if (__upvoteFind) {
                await Upvote.findByIdAndDelete(__upvoteFind._id);
                req._article._article_upvotes.pull(__upvoteFind._id);
                __type = '_articleDownvotedRUpvote';
            }
        } else {
            await Downvote.findByIdAndDelete(__downvoteFind._id);
            req._article._article_downvotes.pull(__downvoteFind._id);
            __type = '_articleDownvoteRemoved';
        }

        return await req._article.save({ timestamps: false })
            .then(() => res.json({
                _article: req._article.toJSON(),
                _type: __type
            }))
            .catch(next);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/_upvote', async (req, res, next) => {
    const { _fingerprint } = req.body;

    try {
        let __type = '';
        const __upvoteFind = await Upvote.findOne({ _upvoter: _fingerprint });
        const __downvoteFind = await Downvote.findOne({ _downvoter: _fingerprint });

        if (!__upvoteFind) {
            const __upvote = await Upvote.create({ _upvoter: _fingerprint });
            req._article._article_upvotes.push(__upvote._id);
            __type = '_articleUpvoted';
            if (__downvoteFind) {
                await Downvote.findByIdAndDelete(__downvoteFind._id);
                req._article._article_downvotes.pull(__downvoteFind._id);
                __type = '_articleUpvotedRDownvote';
            }
        } else {
            await Upvote.findByIdAndDelete(__upvoteFind._id);
            req._article._article_upvotes.pull(__upvoteFind._id);
            __type = '_articleUpvoteRemoved';
        }

        return await req._article.save({ timestamps: false })
            .then(() => res.json({
                _article: req._article.toJSON(),
                _type: __type
            }))
            .catch(next);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/_view', async (req, res, next) => {
    const { body } = req;

    try {
        await View.findOneAndUpdate(
            { _viewer: body.__fingerprint },
            {},
            { new: true }
        ).then(async __viewUpdated => {
            if (__viewUpdated === null) {
                // Create a new view
                const __view = await View.create({ _viewer: body.__fingerprint });
                // Link the view to the article using the foreign key
                req._article._article_views.push(__view._id);
            }
        });

        return await req._article.save({ timestamps: false })
            .then(() => res.json({ _article: req._article.toJSON() }))
            .catch(next);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/_comment', async (req, res, next) => {
    const { _id, ...values } = req.body;

    try {
        if (_id) {
            await Comment.findOneAndUpdate(
                { _id },
                { $set: values },
                { new: true }
            );
        } else {
            // Create a new comment
            const __comment = await Comment.create(values);
            // Link the comment to the article using the foreign key
            req._article._article_comments.push(__comment._id);
        }

        return await req._article.save({ timestamps: false })
            .then(() => res.json({ _article: req._article.toJSON() }))
            .catch(next);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/_commentDownvote', async (req, res, next) => {
    const { _id, _fingerprint } = req.body;

    try {
        let __type = '';
        const __upvoteFind = await Upvote.findOne({ _upvoter: _fingerprint });
        const __downvoteFind = await Downvote.findOne({ _downvoter: _fingerprint });

        if (!__downvoteFind) {
            const __downvote = await Downvote.create({ _downvoter: _fingerprint });
            await Comment.findOneAndUpdate(
                { _id },
                { $push: { _downvotes: __downvote._id } },
                { new: true }
            );
            __type = '__commentDownvoted';

            if (__upvoteFind) {
                await Upvote.findByIdAndDelete(__upvoteFind._id);
                await Comment.findOneAndUpdate(
                    { _id },
                    { $pull: { _upvotes: __upvoteFind._id } },
                    { new: true }
                );
                __type = '_commentDownvotedRUpvote';
            }
        } else {
            await Downvote.findByIdAndDelete(__downvoteFind._id);
            await Comment.findOneAndUpdate(
                { _id },
                { $pull: { _downvotes: __downvoteFind._id } },
                { new: true }
            );
            __type = '_commentDownvoteRemoved';
        }

        return await req._article.save({ timestamps: false })
            .then(() => res.json({ _article: req._article.toJSON() }))
            .catch(next);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/_commentUpvote', async (req, res, next) => {
    const { _id, _fingerprint } = req.body;

    try {
        let __type = '';
        const __downvoteFind = await Downvote.findOne({ _downvoter: _fingerprint });
        const __upvoteFind = await Upvote.findOne({ _upvoter: _fingerprint });

        if (!__upvoteFind) {
            const __upvote = await Upvote.create({ _upvoter: _fingerprint });
            await Comment.findOneAndDowndate(
                { _id },
                { $push: { _upvotes: __upvote._id } },
                { new: true }
            );
            __type = '__commentUpvoted';

            if (__downvoteFind) {
                await Downvote.findByIdAndDelete(__downvoteFind._id);
                await Comment.findOneAndDowndate(
                    { _id },
                    { $pull: { _downvotes: __downvoteFind._id } },
                    { new: true }
                );
                __type = '_commentUpvotedRDownvote';
            }
        } else {
            await Upvote.findByIdAndDelete(__upvoteFind._id);
            await Comment.findOneAndDowndate(
                { _id },
                { $pull: { _upvotes: __upvoteFind._id } },
                { new: true }
            );
            __type = '_commentUpvoteRemoved';
        }

        return await req._article.save({ timestamps: false })
            .then(() => res.json({ _article: req._article.toJSON() }))
            .catch(next);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', (req, res, next) => {
    return Article.findByIdAndRemove(req._article._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;