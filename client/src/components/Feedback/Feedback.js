import React, { useCallback, useEffect, useState } from 'react';
import { _useStore } from '../../store/store';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Moment from 'react-moment';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import SimpleBar from 'simplebar-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReplyAll, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faRectangleXmark, faThumbsUp, faThumbsDown } from '@fortawesome/free-regular-svg-icons';
import _ from 'lodash';
import { io } from 'socket.io-client';

import 'simplebar-react/dist/simplebar.min.css';

const _socketURL = _.isEqual(process.env.NODE_ENV, 'production')
    ? window.location.hostname
    : 'localhost:8800';
const _socket = io(_socketURL, { 'transports': ['websocket', 'polling'] });

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

const Feedback = (props) => {
    const _testimony = _useStore((state) => state._testimony);
    const addTestimony = _useStore((state) => state.addTestimony);
    const deleteTestimony = _useStore((state) => state.deleteTestimony);
    const _testimonies = _useStore((state) => state._testimonies);
    const setTestimonies = _useStore((state) => state.setTestimonies);
    const updateTestimonies = _useStore((state) => state.updateTestimonies);
    const _testimonyToEdit = _useStore((state) => state._testimonyToEdit);
    const setTestimonyToEdit = _useStore((state) => state.setTestimonyToEdit);
    const clearTestimonyToEdit = _useStore((state) => state.clearTestimonyToEdit);

    /* In this Component the _fingerprint variable is not needed at load, so it's working fine,
    but what if someday the user is using somethin to block it or it just doesn't work,
    i'll have to make sure the field can be empty at axios calls */
    const _fingerprint = usePersistentFingerprint();
    const [isFingerprintLoaded, setIsFingerprintLoaded] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        getValues,
        setValue,
        reset,
        setFocus,
        formState: { errors }
    } = useForm({
        mode: 'onTouched',
        reValidateMode: 'onChange',
        reValidateMode: 'onSubmit',
        defaultValues: {
            _parentId: null,
            _testimony_author: '',
            _testimony_email: '',
            _testimony_body: '',
            _testimony_isPrivate: false,
            _testimony_fingerprint: '',
            _testimony_upvotes: [],
            _testimony_downvotes: []
        }
    });

    const [_testimonyAuthorFocused, setTestimonyAuthorFocused] = useState(false);
    const [_testimonyEmailFocused, setTestimonyEmailFocused] = useState(false);
    const [_testimonyBodyFocused, setTestimonyBodyFocused] = useState(false);

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

    const _getTestimonies = useCallback(
        async () => {
            try {
                axios('/api/testimony')
                    .then((response) => {
                        setTestimonies(response.data._testimonies);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setTestimonies]
    );

    const _handleReply = (_id) => {
        setValue('_parentId', _id);
        setFocus('_testimony_author');
    };

    const _handleVotes = (_t, _type) => {
        let _action;
        let _values;

        try {
            if (_type === 'up') {
                if (_.isUndefined(_.find(_.get(_t, '_testimony_upvotes'), { _upvoter: _fingerprint }))) {
                    _action = '_testimonyUpvoted';
                    if (_.isUndefined(_.find(_.get(_t, '_testimony_downvotes'), { _downvoter: _fingerprint }))) {
                        // 'I have never Upvoted / Downvoted this Testimony'
                        _values = {
                            ..._t,
                            _testimony_upvotes: [
                                ..._t._testimony_upvotes,
                                { _upvoter: _fingerprint }
                            ]
                        };
                    } else {
                        // 'I have never Upvoted / already Downvoted this Testimony'
                        _values = {
                            ..._t,
                            _testimony_upvotes: [
                                ..._t._testimony_upvotes,
                                { _upvoter: _fingerprint }
                            ],
                            _testimony_downvotes: _.filter(_t._testimony_downvotes, _vote => _vote._downvoter !== _fingerprint)
                        };
                    }
                } else {
                    // 'I have already Upvoted this Testimony'
                    _action = '_testimonyUpvoteRemoved';
                    _values = {
                        ..._t,
                        _testimony_upvotes: _.filter(_t._testimony_upvotes, _vote => _vote._upvoter !== _fingerprint)
                    };
                }
            } else {
                if (_.isUndefined(_.find(_.get(_t, '_testimony_downvotes'), { _downvoter: _fingerprint }))) {
                    _action = '_testimonyDownvoted';
                    if (_.isUndefined(_.find(_.get(_t, '_testimony_upvotes'), { _upvoter: _fingerprint }))) {
                        // 'I have never Upvoted / Downvoted this Testimony'
                        _values = {
                            ..._t,
                            _testimony_downvotes: [
                                ..._t._testimony_downvotes,
                                { _downvoter: _fingerprint }
                            ]
                        };
                    } else {
                        // 'I have never Downvoted / already Upvoted this Testimony'
                        _values = {
                            ..._t,
                            _testimony_downvotes: [
                                ..._t._testimony_downvotes,
                                { _downvoter: _fingerprint }
                            ],
                            _testimony_upvotes: _.filter(_t._testimony_upvotes, _vote => _vote._upvoter !== _fingerprint)
                        };
                    }
                } else {
                    // 'I have already Downvoted this Testimony'
                    _action = '_testimonyDownvoteRemoved';
                    _values = {
                        ..._t,
                        _testimony_downvotes: _.filter(_t._testimony_downvotes, _vote => _vote._downvoter !== _fingerprint)
                    };
                }
            }

            return axios.patch(`/api/testimony/${_t._id}`, _values)
                .then((res) => {
                    updateTestimonies(res.data);
                    _socket.emit('action', { type: _action, data: res.data._testimony });
                })
                .catch((error) => {
                    setModalHeader('We\'re sorry !');
                    setModalBody(JSON.stringify(error));
                    setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                    setShowModal(true);
                });
        } catch (error) {
            setModalHeader('We\'re sorry !');
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const _handleEdit = (_t) => {
        setValue('_parentId', _t._parentId);
        setValue('_testimony_author', _t._testimony_author);
        setValue('_testimony_email', _t._testimony_email);
        setValue('_testimony_body', _t._testimony_body);
        setValue('_testimony_isPrivate', _t._testimony_isPrivate);
        setValue('_testimony_fingerprint', _t._testimony_fingerprint);
        setValue('_testimony_upvotes', _t._testimony_upvotes);
        setValue('_testimony_downvotes', _t._testimony_downvotes);

        // Set the testimony to be edited in the _testimonyToEdit state
        setTestimonyToEdit(_t);
    };

    const _handleDelete = (_id) => {
        return axios.delete(`/api/testimony/${_id}`)
            .then((res) => {
                deleteTestimony(_id);
                if (_testimonyToEdit._id === _id)
                    _handleCancel();
                _socket.emit('action', { type: '_testimonyDeleted', data: res.data._testimony });
            });
    };

    const _handleCancel = () => {
        // Reset the form fields
        reset({
            _parentId: null,
            _testimony_author: '',
            _testimony_email: '',
            _testimony_body: '',
            _testimony_isPrivate: false,
            _testimony_fingerprint: '',
            _testimony_upvotes: [],
            _testimony_downvotes: []

        });

        // Clear the _testimonyToEdit state
        clearTestimonyToEdit();
    };

    const onSubmit = async (values) => {
        _.isEmpty(values._testimony_fingerprint) && (values._testimony_fingerprint = _fingerprint);

        try {
            if (_.isEmpty(_testimonyToEdit)) {
                return axios.post('/api/testimony', values)
                    .then((res) => {
                        addTestimony(res.data._testimony);
                        _socket.emit('action', { type: '_testimonyCreated', data: res.data._testimony });
                    })
                    .then(() => {
                        reset({
                            _parentId: null,
                            _testimony_author: '',
                            _testimony_email: '',
                            _testimony_body: '',
                            _testimony_isPrivate: false,
                            _testimony_fingerprint: '',
                            _testimony_upvotes: [],
                            _testimony_downvotes: []
                        });
                    })
                    .catch((error) => {
                        setModalHeader('We\'re sorry !');
                        setModalBody(JSON.stringify(error));
                        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                        setShowModal(true);
                    });
            } else {
                return axios.patch(`/api/testimony/${_testimonyToEdit._id}`, values)
                    .then((res) => {
                        updateTestimonies(res.data);
                        _socket.emit('action', { type: '_testimonyUpdated', data: res.data._testimony });
                    })
                    .then(() => {
                        reset({
                            _parentId: null,
                            _testimony_author: '',
                            _testimony_email: '',
                            _testimony_body: '',
                            _testimony_isPrivate: false,
                            _testimony_fingerprint: '',
                            _testimony_upvotes: [],
                            _testimony_downvotes: []
                        });

                        // Clear the _testimonyToEdit state
                        clearTestimonyToEdit();
                    })
                    .catch((error) => {
                        setModalHeader('We\'re sorry !');
                        setModalBody(JSON.stringify(error));
                        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                        setShowModal(true);
                    });
            }
        } catch (error) {
            setModalHeader('We\'re sorry !');
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const onError = (error) => {
        setModalHeader('We\'re sorry !');
        setModalBody('Please check the fields for valid information.');
        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
        setShowModal(true);
    };

    useEffect(() => {
        _getTestimonies();

        const handleBeforeUnload = () => {
            clearTestimonyToEdit();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        const subscription = watch((value, { name, type }) => { });
        return () => {
            subscription.unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [_getTestimonies, watch]);

    return (
        <main className='_feedback'>
            <section className='_s1 grid'>
                <div className='g-col-6 d-flex align-items-center justify-content-center'>
                    <Card className='border border-0 rounded-0'>
                        <Card.Header className='rounded-0'>
                            <h3>Feel Free to Share Your Thoughts!</h3>
                            <p className='text-muted'>Join the Conversation & Help Us Improve Your Experience, We Value Your Feedback and Ideas!</p>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit(onSubmit, onError)} className='grid'>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_testimony_author'
                                        className={`_formGroup ${_testimonyAuthorFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Name.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_testimony_author', {
                                                    required: 'Must be 3 to 30 long.',
                                                    pattern: {
                                                        value: /^[a-zA-Z\s]{2,30}$/,
                                                        message: 'No numbers or symbols.'
                                                    },
                                                    onBlur: () => { setTestimonyAuthorFocused(false) }
                                                })}
                                                placeholder='Name.'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._testimony_author ? 'border-danger' : ''}`}
                                                name='_testimony_author'
                                                onFocus={() => { setTestimonyAuthorFocused(true) }}
                                            />
                                            {
                                                errors._testimony_author && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${watch('_testimony_author', false) ? '' : 'toClear'}`}>
                                                        {errors._testimony_author.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                watch('_testimony_author', false) && (
                                                    <div className='_formClear'
                                                        onClick={() => {
                                                            reset({
                                                                _testimony_author: ''
                                                            });
                                                        }}
                                                    ></div>
                                                )
                                            }
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_testimony_email'
                                        className={`_formGroup ${_testimonyEmailFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Email.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_testimony_email', {
                                                    required: 'Email missing.',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                                        message: 'Email invalid.'
                                                    },
                                                    onBlur: () => { setTestimonyEmailFocused(false) }
                                                })}
                                                placeholder='Email.'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._testimony_email ? 'border-danger' : ''}`}
                                                name='_testimony_email'
                                                onFocus={() => setTestimonyEmailFocused(true)}
                                            />
                                            {
                                                errors._testimony_email && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${watch('_testimony_email', false) ? '' : 'toClear'}`}>
                                                        {errors._testimony_email.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                watch('_testimony_email', false) && (
                                                    <div className='_formClear'
                                                        onClick={() => {
                                                            reset({
                                                                _testimony_email: ''
                                                            });
                                                        }}
                                                    ></div>
                                                )
                                            }
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_testimony_body'
                                        className={`_formGroup ${_testimonyBodyFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Message.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_testimony_body', {
                                                    required: 'Please provide a message.',
                                                    onBlur: () => { setTestimonyBodyFocused(false) }
                                                })}
                                                placeholder='Message.'
                                                as='textarea'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._testimony_body ? 'border-danger' : ''}`}
                                                name='_testimony_body'
                                                onFocus={() => { setTestimonyBodyFocused(true) }}
                                            />
                                            {
                                                errors._testimony_body && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 messageClear`}>
                                                        {errors._testimony_body.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                watch('_testimony_body', false) && (
                                                    <div className='_formClear _messageInput'
                                                        onClick={() => {
                                                            reset({
                                                                _testimony_body: ''
                                                            });
                                                        }}
                                                    ></div>
                                                )
                                            }
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_testimony_isPrivate'
                                        className='_checkGroup _formGroup'
                                    >
                                        <FloatingLabel
                                            label='Private Message ?'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Check
                                                type='switch'
                                                className='_formSwitch'
                                                name='_testimony_isPrivate'
                                                {...register('_testimony_isPrivate', {})}
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
                                            {!_.isEmpty(_testimonyToEdit) ? 'Update' : 'Submit'}<b className='pink_dot'>.</b>
                                        </span>
                                    </Button>
                                </Row>
                                <Row className='g-col-12'>
                                    {
                                        //Upon click it just disapears or appears too fast
                                        (!_.isEmpty(_testimonyToEdit) || watch('_parentId') !== null) && (
                                            <Button
                                                type='button'
                                                className='border border-0 rounded-0 _red'
                                                variant='link'
                                                onClick={() => _handleCancel()}
                                            >
                                                Cancel<b className='pink_dot'>.</b>
                                            </Button>
                                        )
                                    }
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
                <div className='g-col-6'>
                    {/* Check for how to make the scroll bar wider upon hover and more cool */}
                    <SimpleBar style={{ maxHeight: '72vh' }} forceVisible='y' autoHide={false}>
                        {
                            _.map(_.chain(_.filter(_testimonies, (_t) => { return !_t._testimony_isPrivate && _t._parentId === null }))
                                .sortBy([
                                    // Sort by upvotes count in descending order
                                    // This fires an error upon creating a new testimony
                                    (_testimony) => -_.size(_testimony._testimony_upvotes),
                                    // Sort by Testimony with the most Replies
                                    (_testimony) => -_.size(_.filter(_testimonies, ['_parentId', _testimony._id])),
                                    // Sort by creation date in descending order
                                    '_createdAt',
                                    // Sort by update date in descending order
                                    '_updatedAt'
                                ])
                                .value(), (_testimony, index) => {
                                    const _testimonyId = `_testimony_${index}`;

                                    return (
                                        <Card className={`border border-0 rounded-0 card_${_testimonyId}`} key={_testimonyId}>
                                            <Card.Body className='d-flex flex-column'>
                                                <div className='_topRow d-flex'>
                                                    <p className='text-muted author'><b>{_.capitalize(_testimony._testimony_author)}</b>, {<Moment fromNow>{_testimony._updatedAt}</Moment>}</p>
                                                    <div className='interactions ms-auto d-flex'>
                                                        <div className='text-muted d-flex align-items-center replies'>
                                                            <p>{_.size(_.filter(_testimonies, { '_parentId': _testimony._id }))}</p>
                                                            <Button
                                                                type='button'
                                                                className='border border-0 rounded-0'
                                                                onClick={() => _handleEdit(_testimony)}
                                                            >
                                                                <FontAwesomeIcon icon={faReplyAll} />
                                                            </Button>
                                                        </div>
                                                        <div className={`text-muted d-flex align-items-center upvotes ${!_.some(_.get(_testimony, '_testimony_upvotes'), { _upvoter: _fingerprint }) ? '' : 'active'}`}>
                                                            <p>{_.size(_.get(_testimony, '_testimony_upvotes'))}</p>
                                                            <Button
                                                                type='button'
                                                                className='border border-0 rounded-0'
                                                                onClick={() => _handleVotes(_testimony, 'up')}
                                                            >
                                                                <FontAwesomeIcon icon={faThumbsUp} />
                                                            </Button>
                                                        </div>
                                                        <div className={`text-muted d-flex align-items-center downvotes ${!_.some(_.get(_testimony, '_testimony_downvotes'), { _downvoter: _fingerprint }) ? '' : 'active'}`}>
                                                            <p>{_.size(_.get(_testimony, '_testimony_downvotes'))}</p>
                                                            <Button
                                                                type='button'
                                                                className='border border-0 rounded-0'
                                                                onClick={() => _handleVotes(_testimony, 'down')}
                                                            >
                                                                <FontAwesomeIcon icon={faThumbsDown} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='_middleRow'>
                                                    <h4>{_.capitalize(_testimony._testimony_body)}</h4>
                                                </div>
                                                <div className='_bottomRow d-flex justify-content-end'>
                                                    <Dropdown
                                                        key={_testimonyId}
                                                        show={_showReplyDropdown[_testimonyId]}
                                                        onMouseEnter={() => { _handleMouseEnter(_testimonyId); }}
                                                        onMouseLeave={() => { _handleMouseLeave(_testimonyId); }}
                                                    >
                                                        <Dropdown.Toggle as='span'>
                                                            <span className='d-flex align-items-center justify-content-center'>
                                                                <FontAwesomeIcon icon={faEllipsisV} />
                                                            </span>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu className='border rounded-0'>
                                                            <Form className='d-flex flex-column'>
                                                                <Dropdown.Item
                                                                    onClick={() => _handleReply(_testimony._id)}
                                                                >
                                                                    Reply<b className='pink_dot'>.</b>
                                                                </Dropdown.Item>
                                                                {
                                                                    _testimony._testimony_fingerprint === _fingerprint && (
                                                                        <>
                                                                            <Dropdown.Item
                                                                                onClick={() => _handleEdit(_testimony)}
                                                                            >
                                                                                Edit<b className='pink_dot'>.</b>
                                                                            </Dropdown.Item>
                                                                            <Dropdown.Divider />
                                                                            <Dropdown.Item
                                                                                onClick={() => _handleDelete(_testimony._id)}
                                                                            >
                                                                                Delete<b className='pink_dot'>.</b>
                                                                            </Dropdown.Item>
                                                                        </>
                                                                    )
                                                                }
                                                            </Form>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>
                                                {
                                                    _.map(_.chain(_.filter(_testimonies, (_t) => { return !_t._testimony_isPrivate && _t._parentId === _testimony._id }))
                                                        .sortBy([
                                                            // Sort by upvotes count in descending order
                                                            // This fires an error upon creating a new testimony
                                                            (_t) => -_.size(_t._testimony_upvotes),
                                                            // Sort by creation date in descending order
                                                            '_createdAt',
                                                            // Sort by update date in descending order
                                                            '_updatedAt'
                                                        ])
                                                        .value(), (_reply, _indexReply) => {
                                                            const _replyId = `_reply_${index}_${_indexReply}`;

                                                            return (
                                                                <Card className={`border border-0 rounded-0 card_${_replyId}`} key={_replyId}>
                                                                    <Card.Body className='d-flex flex-column'>
                                                                        <div className='_topRow d-flex'>
                                                                            <p className='text-muted author'><b>{_.capitalize(_reply._testimony_author)}</b>, {<Moment fromNow>{_reply._updatedAt}</Moment>}</p>
                                                                            <div className='interactions ms-auto d-flex'>
                                                                                <div className={`text-muted d-flex align-items-center upvotes ${!_.some(_.get(_reply, '_testimony_upvotes'), { _upvoter: _fingerprint }) ? '' : 'active'}`}>
                                                                                    <p>{_.size(_.get(_reply, '_testimony_upvotes'))}</p>
                                                                                    <Button
                                                                                        type='button'
                                                                                        className='border border-0 rounded-0'
                                                                                        onClick={() => _handleVotes(_testimony, 'up')}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faThumbsUp} />
                                                                                    </Button>
                                                                                </div>
                                                                                <div className={`text-muted d-flex align-items-center downvotes ${!_.some(_.get(_reply, '_testimony_downvotes'), { _downvoter: _fingerprint }) ? '' : 'active'}`}>
                                                                                    <p>{_.size(_.get(_reply, '_testimony_downvotes'))}</p>
                                                                                    <Button
                                                                                        type='button'
                                                                                        className='border border-0 rounded-0'
                                                                                        onClick={() => _handleVotes(_testimony, 'down')}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faThumbsDown} />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className='_middleRow'>
                                                                            <h4>{_.capitalize(_reply._testimony_body)}</h4>
                                                                        </div>
                                                                        <div className='_bottomRow d-flex justify-content-end'>
                                                                            {
                                                                                _reply._testimony_fingerprint === _fingerprint && (
                                                                                    <Dropdown
                                                                                        key={_replyId}
                                                                                        show={_showReplyDropdown[_replyId]}
                                                                                        onMouseEnter={() => { _handleMouseEnter(_replyId); }}
                                                                                        onMouseLeave={() => { _handleMouseLeave(_replyId); }}
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
                                                                                                    Edit<b className='pink_dot'>.</b>
                                                                                                </Dropdown.Item>
                                                                                                <Dropdown.Item
                                                                                                    onClick={() => _handleDelete(_reply._id)}
                                                                                                >
                                                                                                    Delete<b className='pink_dot'>.</b>
                                                                                                </Dropdown.Item>
                                                                                            </Form>
                                                                                        </Dropdown.Menu>
                                                                                    </Dropdown>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </Card.Body>
                                                                </Card>
                                                            )
                                                        })
                                                }
                                            </Card.Body>
                                        </Card>
                                    )
                                })
                        }
                    </SimpleBar>
                </div>

                <Modal show={_showModal} onHide={() => setShowModal(false)} centered>
                    <Form>
                        <Modal.Header closeButton>
                            <Modal.Title>{_modalHeader}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='text-muted'>{_modalBody}</Modal.Body>
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
            </section>
        </main>
    );
}

export default Feedback;