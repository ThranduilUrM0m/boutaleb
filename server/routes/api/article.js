import mongoose from 'mongoose';
import express from 'express';

const Article = mongoose.model('Article');
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
        .sort({ createdAt: 'descending' })
        .then((_articles) => res.json({ _articles: _articles.map(_article => _article.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Article.findById(id)
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

router.patch('/:id', (req, res, next) => {
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

router.patch('/:id/_vote', (req, res, next) => {
    const { body } = req;

    if (typeof body._article_upvotes !== 'undefined') {
        req._article._article_upvotes = body._article_upvotes;
    }

    if (typeof body._article_downvotes !== 'undefined') {
        req._article._article_downvotes = body._article_downvotes;
    }

    return req._article.save({ timestamps: false })
        .then(() => res.json({ _article: req._article.toJSON() }))
        .catch(next);
});

router.patch('/:id/_view', (req, res, next) => {
    const { body } = req;

    if (typeof body._article_views !== 'undefined') {
        req._article._article_views = body._article_views;
    }

    return req._article.save({ timestamps: false })
        .then(() => res.json({ _article: req._article.toJSON() }))
        .catch(next);
});

router.patch('/:id/_comment', (req, res, next) => {
    const { body } = req;

    if (typeof body._article_comments !== 'undefined') {
        req._article._article_comments = body._article_comments;
    }

    return req._article.save({ timestamps: false })
        .then(() => res.json({ _article: req._article.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Article.findByIdAndRemove(req._article._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;