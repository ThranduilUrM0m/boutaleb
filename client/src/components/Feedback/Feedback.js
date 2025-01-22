// React
import React, { useCallback, useEffect, useState } from 'react';

// Third-Party State Management
import _useStore from '../../store';

// HTTP Client
import axios from 'axios';

// Form Handling & Validation
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// Date Libraries
import Moment from 'react-moment';
import 'moment-timezone';

// FingerprintJS
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Bootstrap Components
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';

// Virtual Scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faReplyAll } from '@fortawesome/free-solid-svg-icons';
import { faRectangleXmark, faThumbsDown, faThumbsUp } from '@fortawesome/free-regular-svg-icons';

// Utility Libraries
import _ from 'lodash';

const usePersistentFingerprint = () => {
    const [_fingerprint, setFingerprint] = useState('');

    useEffect(() => {
        const generateFingerprint = async () => {
            // Check if the persistent identifier exists in storage (e.g., cookie or local storage)
            const persistentIdentifier = localStorage.getItem('persistentIdentifier');

            if (persistentIdentifier) {
                // Use the persistent identifier if available
                setFingerprint(persistentIdentifier);
            } else {
                // Fallback to generating a new fingerprint using FingerprintJS
                const fp = await FingerprintJS.load();
                const { visitorId } = await fp.get();
                setFingerprint(visitorId);

                // Store the persistent identifier for future visits
                localStorage.setItem('persistentIdentifier', visitorId);
            }
        };

        generateFingerprint();
    }, []);

    return _fingerprint;
};

/* 
    @NON UNDERSTANDABLE ISSUE 
*/

const Feedback = (props) => {
    const { testimonial } = _useStore();

    // Access your states and actions like this:
    const _testimonials = testimonial._testimonials;
    const _testimonialToEdit = testimonial._testimonialToEdit;

    const addTestimonial = testimonial['_testimonial_ADD_STATE'];
    const deleteTestimonial = testimonial['_testimonial_DELETE_STATE'];

    const setTestimonials = testimonial['_testimonials_SET_STATE'];
    const updateTestimonials = testimonial['_testimonials_UPDATE_STATE_ITEM'];

    const setTestimonialToEdit = testimonial['_testimonialToEdit_SET_STATE'];
    const clearTestimonialToEdit = testimonial['_testimonialToEdit_CLEAR_STATE'];

    /* In this Component the _fingerprint variable is not needed at load, so it's working fine,
      but what if someday the user is using somethin to block it or it just doesn't work,
      i'll have to make sure the field can be empty at axios calls */
    const _fingerprint = usePersistentFingerprint();

    const _validationSchema = Yup.object()
        .shape({
            Parent: Yup.string().default(null),
            _testimonial_author: Yup.string()
                .default('')
                .required('Please provide a valid name.')
                .test(
                    'min-length',
                    'Must be at least 2 characters.',
                    (value) => value && value.length >= 2
                )
                .matches(/^[a-zA-Z\s]*$/i, 'No numbers or symbols.'),
            _testimonial_email: Yup.string()
                .default('')
                .test(
                    'empty-or-valid-email',
                    'Email invalid.',
                    (__email) =>
                        !__email ||
                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(__email)
                ),
            _testimonial_body: Yup.string()
                .default('')
                .required('Please provide a message.'),
            _testimonial_isPrivate: Yup.boolean().default(false),
            _testimonial_fingerprint: Yup.string().default(''),
            _testimonial_upvotes: Yup.array().default([]),
            _testimonial_downvotes: Yup.array().default([]),
        })
        .required();
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        resetField,
        trigger,
        setFocus,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onSubmit',
        resolver: yupResolver(_validationSchema),
        defaultValues: {
            Parent: null,
            _testimonial_author: '',
            _testimonial_email: '',
            _testimonial_body: '',
            _testimonial_isPrivate: false,
            _testimonial_fingerprint: '',
            _testimonial_upvotes: [],
            _testimonial_downvotes: [],
        },
    });

    const [_testimonialAuthorFocused, setTestimonialAuthorFocused] =
        useState(false);
    const [_testimonialEmailFocused, setTestimonialEmailFocused] =
        useState(false);
    const [_testimonialBodyFocused, setTestimonialBodyFocused] = useState(false);

    const [_showModal, setShowModal] = useState(false);
    const [_modalHeader, setModalHeader] = useState('');
    const [_modalBody, setModalBody] = useState('');
    const [_modalIcon, setModalIcon] = useState('');

    const [_showReplyDropdown, setShowReplyDropdown] = useState({});

    const _handleMouseEnter = (index) => {
        setShowReplyDropdown((prevState) => ({
            ...prevState,
            [index]: true,
        }));
    };

    const _handleMouseLeave = (index) => {
        setShowReplyDropdown((prevState) => ({
            ...prevState,
            [index]: false,
        }));
    };

    const _getTestimonials = useCallback(async () => {
        try {
            axios('/api/testimonial')
                .then((response) => {
                    setTestimonials(response.data._testimonials);
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.log(error);
        }
    }, [setTestimonials]);

    const _handleReply = (_id) => {
        setValue('Parent', _id);
        setFocus('_testimonial_author');
    };

    const _handleVotes = (testimonial, voteType) => {
        let updatedValues;

        try {
            const alreadyUpvoted = _.some(testimonial._testimonial_upvotes, { _upvoter: _fingerprint });
            const alreadyDownvoted = _.some(testimonial._testimonial_downvotes, { _downvoter: _fingerprint });

            if (voteType === 'up') {
                if (!alreadyUpvoted) {
                    // Remove downvote if present and add upvote
                    updatedValues = {
                        ...testimonial,
                        _testimonial_upvotes: [
                            ...testimonial._testimonial_upvotes,
                            { _upvoter: _fingerprint },
                        ],
                        _testimonial_downvotes: alreadyDownvoted
                            ? _.reject(testimonial._testimonial_downvotes, { _downvoter: _fingerprint })
                            : testimonial._testimonial_downvotes,
                    };
                } else {
                    // Remove upvote
                    updatedValues = {
                        ...testimonial,
                        _testimonial_upvotes: _.reject(testimonial._testimonial_upvotes, { _upvoter: _fingerprint }),
                    };
                }
            } else if (voteType === 'down') {
                if (!alreadyDownvoted) {
                    // Remove upvote if present and add downvote
                    updatedValues = {
                        ...testimonial,
                        _testimonial_downvotes: [
                            ...testimonial._testimonial_downvotes,
                            { _downvoter: _fingerprint },
                        ],
                        _testimonial_upvotes: alreadyUpvoted
                            ? _.reject(testimonial._testimonial_upvotes, { _upvoter: _fingerprint })
                            : testimonial._testimonial_upvotes,
                    };
                } else {
                    // Remove downvote
                    updatedValues = {
                        ...testimonial,
                        _testimonial_downvotes: _.reject(testimonial._testimonial_downvotes, { _downvoter: _fingerprint }),
                    };
                }
            }

            // Perform the API call to update the votes
            return axios.patch(`/api/testimonial/${testimonial._id}`, updatedValues)
                .then((res) => updateTestimonials(res.data))
                .catch((error) => {
                    setModalHeader("We're sorry!");
                    setModalBody(JSON.stringify(error));
                    setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                    setShowModal(true);
                });
        } catch (error) {
            setModalHeader("We're sorry!");
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const _handleEdit = (_t) => {
        setValue('Parent', _t.Parent);
        setValue('_testimonial_author', _t._testimonial_author);
        setValue('_testimonial_email', _t._testimonial_email);
        setValue('_testimonial_body', _t._testimonial_body);
        setValue('_testimonial_isPrivate', _t._testimonial_isPrivate);
        setValue('_testimonial_fingerprint', _t._testimonial_fingerprint);
        setValue('_testimonial_upvotes', _t._testimonial_upvotes);
        setValue('_testimonial_downvotes', _t._testimonial_downvotes);

        // Set the testimonial to be edited in the _testimonialToEdit state
        setTestimonialToEdit(_t);
    };

    const _handleDelete = (_id) => {
        return axios.delete(`/api/testimonial/${_id}`).then((res) => {
            deleteTestimonial(_id);
            if (_testimonialToEdit._id === _id) _handleCancel();
        });
    };

    const _handleCancel = () => {
        // Reset the form fields
        reset({
            Parent: null,
            _testimonial_author: '',
            _testimonial_email: '',
            _testimonial_body: '',
            _testimonial_isPrivate: false,
            _testimonial_fingerprint: '',
            _testimonial_upvotes: [],
            _testimonial_downvotes: [],
        });

        // Clear the _testimonialToEdit state
        clearTestimonialToEdit();
    };

    const onSubmit = async (values) => {
        try {
            if (_.isEmpty(_testimonialToEdit)) {
                return axios
                    .post('/api/testimonial', values)
                    .then((res) => {
                        addTestimonial(res.data._testimonial);
                    })
                    .then(() => {
                        reset({
                            Parent: null,
                            _testimonial_author: '',
                            _testimonial_email: '',
                            _testimonial_body: '',
                            _testimonial_isPrivate: false,
                            _testimonial_fingerprint: '',
                            _testimonial_upvotes: [],
                            _testimonial_downvotes: [],
                        });
                    })
                    .catch((error) => {
                        setModalHeader('We\'re sorry!');
                        setModalBody(JSON.stringify(error));
                        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                        setShowModal(true);
                    });
            } else {
                return axios
                    .patch(`/api/testimonial/${_testimonialToEdit._id}`, values)
                    .then((res) => {
                        updateTestimonials(res.data);
                    })
                    .then(() => {
                        reset({
                            Parent: null,
                            _testimonial_author: '',
                            _testimonial_email: '',
                            _testimonial_body: '',
                            _testimonial_isPrivate: false,
                            _testimonial_fingerprint: '',
                            _testimonial_upvotes: [],
                            _testimonial_downvotes: [],
                        });

                        // Clear the _testimonialToEdit state
                        clearTestimonialToEdit();
                    })
                    .catch((error) => {
                        setModalHeader('We\'re sorry!');
                        setModalBody(JSON.stringify(error));
                        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                        setShowModal(true);
                    });
            }
        } catch (error) {
            setModalHeader('We\'re sorry!');
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const onError = (error) => {
        setModalHeader('We\'re sorry!');
        setModalBody('Please check the fields for valid information.');
        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
        setShowModal(true);
    };

    useEffect(() => {
        _getTestimonials();

        const handleBeforeUnload = () => {
            clearTestimonialToEdit();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        const subscription = watch((value, { name, type }) => { });
        return () => {
            subscription.unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [_getTestimonials, watch, clearTestimonialToEdit]);

    return (
        <main className='_feedback'>
            <section className='_s1 grid'>
                <div className='g-col-6 d-flex align-items-center justify-content-center'>
                    <Card className='border border-0 rounded-0'>
                        <Card.Header className='rounded-0'>
                            <h3>Feel Free to Share Your Thoughts!</h3>
                            <p className='text-muted'>
                                Join the Conversation & Help Us Improve Your Experience, We
                                Value Your Feedback and Ideas!
                            </p>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit(onSubmit, onError)} className='grid'>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_testimonial_author'
                                        className={`_formGroup ${_testimonialAuthorFocused ? 'focused' : ''
                                            }`}
                                    >
                                        <FloatingLabel label='Name.' className='_formLabel'>
                                            <Form.Control
                                                {...register('_testimonial_author')}
                                                onBlur={() => {
                                                    setTestimonialAuthorFocused(false);
                                                    trigger('_testimonial_author');
                                                }}
                                                onFocus={() => setTestimonialAuthorFocused(true)}
                                                placeholder='Name.'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._testimonial_author ? 'border-danger' : ''
                                                    }`}
                                                name='_testimonial_author'
                                            />
                                            {errors._testimonial_author && (
                                                <Form.Text
                                                    className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(watch('_testimonial_author'))
                                                        ? '_fieldNotEmpty'
                                                        : ''
                                                        }`}
                                                >
                                                    {errors._testimonial_author.message}
                                                </Form.Text>
                                            )}
                                            {!_.isEmpty(watch('_testimonial_author')) && (
                                                <div
                                                    className='__close'
                                                    onClick={() => {
                                                        resetField('_testimonial_author');
                                                    }}
                                                ></div>
                                            )}
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_testimonial_email'
                                        className={`_formGroup ${_testimonialEmailFocused ? 'focused' : ''
                                            }`}
                                    >
                                        <FloatingLabel label='Email.' className='_formLabel'>
                                            <Form.Control
                                                {...register('_testimonial_email')}
                                                onBlur={() => {
                                                    setTestimonialEmailFocused(false);
                                                    trigger('_testimonial_email');
                                                }}
                                                onFocus={() => setTestimonialEmailFocused(true)}
                                                placeholder='Email.'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._testimonial_email ? 'border-danger' : ''
                                                    }`}
                                                name='_testimonial_email'
                                            />
                                            {errors._testimonial_email && (
                                                <Form.Text
                                                    className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(watch('_testimonial_email'))
                                                        ? '_fieldNotEmpty'
                                                        : ''
                                                        }`}
                                                >
                                                    {errors._testimonial_email.message}
                                                </Form.Text>
                                            )}
                                            {!_.isEmpty(watch('_testimonial_email')) && (
                                                <div
                                                    className='__close'
                                                    onClick={() => {
                                                        resetField('_testimonial_email');
                                                    }}
                                                ></div>
                                            )}
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_testimonial_body'
                                        className={`_formGroup ${_testimonialBodyFocused ? 'focused' : ''
                                            }`}
                                    >
                                        <FloatingLabel label='Message.' className='_formLabel'>
                                            <Form.Control
                                                {...register('_testimonial_body')}
                                                onBlur={() => {
                                                    setTestimonialBodyFocused(false);
                                                    trigger('_testimonial_body');
                                                }}
                                                onFocus={() => setTestimonialBodyFocused(true)}
                                                placeholder='Message.'
                                                as='textarea'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._testimonial_body ? 'border-danger' : ''
                                                    }`}
                                                name='_testimonial_body'
                                            />
                                            {errors._testimonial_body && (
                                                <Form.Text
                                                    className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(watch('_testimonial_body'))
                                                        ? '_fieldNotEmpty'
                                                        : ''
                                                        }`}
                                                >
                                                    {errors._testimonial_body.message}
                                                </Form.Text>
                                            )}
                                            {!_.isEmpty(watch('_testimonial_body')) && (
                                                <div
                                                    className='__close _messageInput'
                                                    onClick={() => {
                                                        resetField('_testimonial_body');
                                                    }}
                                                ></div>
                                            )}
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_testimonial_isPrivate'
                                        className='_checkGroup _formGroup'
                                    >
                                        <FloatingLabel
                                            label='Private Message ?'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Check
                                                {...register('_testimonial_isPrivate')}
                                                type='switch'
                                                className='_formSwitch'
                                                name='_testimonial_isPrivate'
                                            />
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className='g-col-12'>
                                    <Button
                                        type='submit'
                                        className='border border-0 rounded-0 inverse w-50'
                                        variant='outline-light'
                                    >
                                        <div className='buttonBorders'>
                                            <div className='borderTop'></div>
                                            <div className='borderRight'></div>
                                            <div className='borderBottom'></div>
                                            <div className='borderLeft'></div>
                                        </div>
                                        <span>
                                            {!_.isEmpty(_testimonialToEdit) ? 'Update' : 'Submit'}
                                            <b className='pink_dot'>.</b>
                                        </span>
                                    </Button>
                                </Row>
                                <Row className='g-col-12'>
                                    {
                                        //Upon click it just disapears or appears too fast
                                        (!_.isEmpty(_testimonialToEdit) ||
                                            watch('Parent') !== null) && (
                                            <Button
                                                type='button'
                                                className='border border-0 rounded-0 _red'
                                                variant='link'
                                                onClick={() => _handleCancel()}
                                            >
                                                Cancel
                                                <b className='pink_dot'>.</b>
                                            </Button>
                                        )
                                    }
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
                <div className='g-col-6'>
                    <SimpleBar
                        style={{ maxHeight: '72vh' }}
                        forceVisible='y'
                        autoHide={false}
                    >
                        {_.map(
                            _.chain(
                                _.filter(_testimonials, (_t) => {
                                    return !_t._testimonial_isPrivate && _t.Parent === null;
                                })
                            )
                                .sortBy([
                                    // Sort by upvotes count in descending order
                                    // This fires an error upon creating a new testimonial
                                    (_testimonial) => -_.size(_testimonial._testimonial_upvotes),
                                    // Sort by Testimonial with the most Replies
                                    (_testimonial) =>
                                        -_.size(
                                            _.filter(_testimonials, ['Parent', _testimonial._id])
                                        ),
                                    // Sort by creation date in descending order
                                    '_createdAt',
                                    // Sort by update date in descending order
                                    '_updatedAt',
                                ])
                                .value(),
                            (_testimonial, index) => {
                                const _testimonialId = `_testimonial_${index}`;

                                return (
                                    <Card
                                        className={`border border-0 rounded-0 card_${_testimonialId}`}
                                        key={_testimonialId}
                                    >
                                        <Card.Body className='d-flex flex-column'>
                                            <div className='_topRow d-flex'>
                                                <p className='text-muted author'>
                                                    <b>
                                                        {_.capitalize(_testimonial._testimonial_author)}
                                                    </b>
                                                    ,{' '}
                                                    {
                                                        <Moment local fromNow>
                                                            {_testimonial.updatedAt}
                                                        </Moment>
                                                    }
                                                </p>
                                                <div className='interactions ms-auto d-flex'>
                                                    <div className='text-muted d-flex align-items-center replies'>
                                                        <p>
                                                            {_.size(
                                                                _.filter(_testimonials, {
                                                                    Parent: _testimonial._id,
                                                                })
                                                            )}
                                                        </p>
                                                        <Button
                                                            type='button'
                                                            className='border border-0 rounded-0'
                                                            onClick={() => _handleEdit(_testimonial)}
                                                        >
                                                            <FontAwesomeIcon icon={faReplyAll} />
                                                        </Button>
                                                    </div>
                                                    <div
                                                        className={`text-muted d-flex align-items-center upvotes ${!_.some(
                                                            _.get(_testimonial, '_testimonial_upvotes'),
                                                            { _upvoter: _fingerprint }
                                                        )
                                                            ? ''
                                                            : 'active'
                                                            }`}
                                                    >
                                                        <p>
                                                            {_.size(
                                                                _.get(_testimonial, '_testimonial_upvotes')
                                                            )}
                                                        </p>
                                                        <Button
                                                            type='button'
                                                            className='border border-0 rounded-0'
                                                            onClick={() => _handleVotes(_testimonial, 'up')}
                                                        >
                                                            <FontAwesomeIcon icon={faThumbsUp} />
                                                        </Button>
                                                    </div>
                                                    <div
                                                        className={`text-muted d-flex align-items-center downvotes ${!_.some(
                                                            _.get(_testimonial, '_testimonial_downvotes'),
                                                            { _downvoter: _fingerprint }
                                                        )
                                                            ? ''
                                                            : 'active'
                                                            }`}
                                                    >
                                                        <p>
                                                            {_.size(
                                                                _.get(_testimonial, '_testimonial_downvotes')
                                                            )}
                                                        </p>
                                                        <Button
                                                            type='button'
                                                            className='border border-0 rounded-0'
                                                            onClick={() => _handleVotes(_testimonial, 'down')}
                                                        >
                                                            <FontAwesomeIcon icon={faThumbsDown} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='_middleRow'>
                                                <h4>{_.capitalize(_testimonial._testimonial_body)}</h4>
                                            </div>
                                            <div className='_bottomRow d-flex justify-content-end'>
                                                <Dropdown
                                                    key={_testimonialId}
                                                    show={_showReplyDropdown[_testimonialId]}
                                                    onMouseEnter={() => {
                                                        _handleMouseEnter(_testimonialId);
                                                    }}
                                                    onMouseLeave={() => {
                                                        _handleMouseLeave(_testimonialId);
                                                    }}
                                                >
                                                    <Dropdown.Toggle as='span'>
                                                        <span className='d-flex align-items-center justify-content-center'>
                                                            <FontAwesomeIcon icon={faEllipsisV} />
                                                        </span>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className='border rounded-0'>
                                                        <Form className='d-flex flex-column'>
                                                            <Dropdown.Item
                                                                onClick={() => _handleReply(_testimonial._id)}
                                                            >
                                                                Reply
                                                                <b className='pink_dot'>.</b>
                                                            </Dropdown.Item>
                                                            {_testimonial._testimonial_fingerprint ===
                                                                _fingerprint && (
                                                                    <>
                                                                        <Dropdown.Item
                                                                            onClick={() => _handleEdit(_testimonial)}
                                                                        >
                                                                            Edit
                                                                            <b className='pink_dot'>.</b>
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Divider />
                                                                        <Dropdown.Item
                                                                            onClick={() =>
                                                                                _handleDelete(_testimonial._id)
                                                                            }
                                                                        >
                                                                            Delete
                                                                            <b className='pink_dot'>.</b>
                                                                        </Dropdown.Item>
                                                                    </>
                                                                )}
                                                        </Form>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                            {_.map(
                                                _.chain(
                                                    _.filter(_testimonials, (_t) => {
                                                        return (
                                                            !_t._testimonial_isPrivate &&
                                                            _t.Parent === _testimonial._id
                                                        );
                                                    })
                                                )
                                                    .sortBy([
                                                        // Sort by upvotes count in descending order
                                                        // This fires an error upon creating a new testimonial
                                                        (_t) => -_.size(_t._testimonial_upvotes),
                                                        // Sort by creation date in descending order
                                                        '_createdAt',
                                                        // Sort by update date in descending order
                                                        '_updatedAt',
                                                    ])
                                                    .value(),
                                                (_reply, _indexReply) => {
                                                    const _replyId = `_reply_${index}_${_indexReply}`;

                                                    return (
                                                        <Card
                                                            className={`border border-0 rounded-0 card_${_replyId}`}
                                                            key={_replyId}
                                                        >
                                                            <Card.Body className='d-flex flex-column'>
                                                                <div className='_topRow d-flex'>
                                                                    <p className='text-muted author'>
                                                                        <b>
                                                                            {_.capitalize(_reply._testimonial_author)}
                                                                        </b>
                                                                        ,{' '}
                                                                        {
                                                                            <Moment local fromNow>
                                                                                {_reply.updatedAt}
                                                                            </Moment>
                                                                        }
                                                                    </p>
                                                                    <div className='interactions ms-auto d-flex'>
                                                                        <div
                                                                            className={`text-muted d-flex align-items-center upvotes ${!_.some(
                                                                                _.get(_reply, '_testimonial_upvotes'),
                                                                                { _upvoter: _fingerprint }
                                                                            )
                                                                                ? ''
                                                                                : 'active'
                                                                                }`}
                                                                        >
                                                                            <p>
                                                                                {_.size(
                                                                                    _.get(_reply, '_testimonial_upvotes')
                                                                                )}
                                                                            </p>
                                                                            <Button
                                                                                type='button'
                                                                                className='border border-0 rounded-0'
                                                                                onClick={() =>
                                                                                    _handleVotes(_testimonial, 'up')
                                                                                }
                                                                            >
                                                                                <FontAwesomeIcon icon={faThumbsUp} />
                                                                            </Button>
                                                                        </div>
                                                                        <div
                                                                            className={`text-muted d-flex align-items-center downvotes ${!_.some(
                                                                                _.get(
                                                                                    _reply,
                                                                                    '_testimonial_downvotes'
                                                                                ),
                                                                                { _downvoter: _fingerprint }
                                                                            )
                                                                                ? ''
                                                                                : 'active'
                                                                                }`}
                                                                        >
                                                                            <p>
                                                                                {_.size(
                                                                                    _.get(
                                                                                        _reply,
                                                                                        '_testimonial_downvotes'
                                                                                    )
                                                                                )}
                                                                            </p>
                                                                            <Button
                                                                                type='button'
                                                                                className='border border-0 rounded-0'
                                                                                onClick={() =>
                                                                                    _handleVotes(_testimonial, 'down')
                                                                                }
                                                                            >
                                                                                <FontAwesomeIcon icon={faThumbsDown} />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className='_middleRow'>
                                                                    <h4>
                                                                        {_.capitalize(_reply._testimonial_body)}
                                                                    </h4>
                                                                </div>
                                                                <div className='_bottomRow d-flex justify-content-end'>
                                                                    {_reply._testimonial_fingerprint ===
                                                                        _fingerprint && (
                                                                            <Dropdown
                                                                                key={_replyId}
                                                                                show={_showReplyDropdown[_replyId]}
                                                                                onMouseEnter={() => {
                                                                                    _handleMouseEnter(_replyId);
                                                                                }}
                                                                                onMouseLeave={() => {
                                                                                    _handleMouseLeave(_replyId);
                                                                                }}
                                                                            >
                                                                                <Dropdown.Toggle as='span'>
                                                                                    <span className='d-flex align-items-center justify-content-center'>
                                                                                        <FontAwesomeIcon icon={faEllipsisV} />
                                                                                    </span>
                                                                                </Dropdown.Toggle>
                                                                                <Dropdown.Menu className='border rounded-0'>
                                                                                    <Form className='d-flex flex-column'>
                                                                                        <Dropdown.Item
                                                                                            onClick={() => _handleEdit(_reply)}
                                                                                        >
                                                                                            Edit
                                                                                            <b className='pink_dot'>.</b>
                                                                                        </Dropdown.Item>
                                                                                        <Dropdown.Item
                                                                                            onClick={() =>
                                                                                                _handleDelete(_reply._id)
                                                                                            }
                                                                                        >
                                                                                            Delete
                                                                                            <b className='pink_dot'>.</b>
                                                                                        </Dropdown.Item>
                                                                                    </Form>
                                                                                </Dropdown.Menu>
                                                                            </Dropdown>
                                                                        )}
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    );
                                                }
                                            )}
                                        </Card.Body>
                                    </Card>
                                );
                            }
                        )}
                    </SimpleBar>
                </div>
            </section>

            <Modal show={_showModal} onHide={() => setShowModal(false)} centered>
                <Form>
                    <Modal.Header closeButton>
                        <Modal.Title>{_modalHeader}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='text-muted'>
                        <pre>{_modalBody}</pre>
                    </Modal.Body>
                    <Modal.Footer>
                        {_modalIcon}
                        <Button
                            type='button'
                            className='border border-0 rounded-0 inverse w-25'
                            variant='outline-light'
                            onClick={() => setShowModal(false)}
                        >
                            <div className='buttonBorders'>
                                <div className='borderTop'></div>
                                <div className='borderRight'></div>
                                <div className='borderBottom'></div>
                                <div className='borderLeft'></div>
                            </div>
                            <span>
                                Close<b className='pink_dot'>.</b>
                            </span>
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </main>
    );
};

export default Feedback;
