import mongoose from 'mongoose';
import express from 'express';

const Testimonial = mongoose.model('Testimonial');
const router = express.Router();

router.post('/', (req, res, next) => {
    const { body } = req;

    if (!body._testimonial_author) {
        return res.status(422).json({
            errors: {
                _testimonial_author: 'is required',
            },
        });
    }

    if (!body._testimonial_body) {
        return res.status(422).json({
            errors: {
                _testimonial_body: 'is required',
            },
        });
    }

    if (!body._testimonial_fingerprint) {
        return res.status(422).json({
            errors: {
                _testimonial_fingerprint: 'is required',
            },
        });
    }

    const finalTestimonial = new Testimonial(body);
    return finalTestimonial.save()
        .then(() => {
            res.json({ _testimonial: finalTestimonial.toJSON() });
        })
        .catch(next);
});

router.get('/', (req, res, next) => {
    return Testimonial.find()
        .populate({
            path: 'Parent',
            model: 'User'
        })
        .populate({
            path: '_testimonial_upvotes',
            model: 'Upvote'
        })
        .populate({
            path: '_testimonial_downvotes',
            model: 'Downvote'
        })
        .sort({ createdAt: 'descending' })
        .then((_testimonials) => res.json({ _testimonials: _testimonials.map(_testimonial => _testimonial.toJSON()) }))
        .catch(next);
});

router.param('id', (req, res, next, id) => {
    return Testimonial.findById(id)
        .populate({
            path: 'Parent',
            model: 'User'
        })
        .populate({
            path: '_testimonial_upvotes',
            model: 'Upvote'
        })
        .populate({
            path: '_testimonial_downvotes',
            model: 'Downvote'
        })
        .then(_testimonial => {
            if (!_testimonial) {
                return res.sendStatus(404);
            }
            req._testimonial = _testimonial;
            next();
        })
        .catch(next);
});

router.get('/:id', (req, res, next) => {
    return res.json({
        _testimonial: req._testimonial.toJSON()
    })
});

router.patch('/:id', (req, res, next) => {
    const { body } = req;

    if (typeof body.Parent !== 'undefined') {
        req._testimonial.Parent = body.Parent;
    }

    if (typeof body._testimonial_author !== 'undefined') {
        req._testimonial._testimonial_author = body._testimonial_author;
    }

    if (typeof body._testimonial_email !== 'undefined') {
        req._testimonial._testimonial_email = body._testimonial_email;
    }

    if (typeof body._testimonial_body !== 'undefined') {
        req._testimonial._testimonial_body = body._testimonial_body;
    }

    if (typeof body._testimonial_isPrivate !== 'undefined') {
        req._testimonial._testimonial_isPrivate = body._testimonial_isPrivate;
    }

    if (typeof body._testimonial_fingerprint !== 'undefined') {
        req._testimonial._testimonial_fingerprint = body._testimonial_fingerprint;
    }

    if (typeof body._testimonial_upvotes !== 'undefined') {
        req._testimonial._testimonial_upvotes = body._testimonial_upvotes;
    }

    if (typeof body._testimonial_downvotes !== 'undefined') {
        req._testimonial._testimonial_downvotes = body._testimonial_downvotes;
    }

    return req._testimonial.save()
        .then(() => res.json({ _testimonial: req._testimonial.toJSON() }))
        .catch(next);
});

router.delete('/:id', (req, res, next) => {
    return Testimonial.findByIdAndRemove(req._testimonial._id)
        .then(() => res.sendStatus(200))
        .catch(next);
});

export default router;