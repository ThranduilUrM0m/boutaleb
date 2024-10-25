import React, { useCallback, useEffect, useState } from 'react';
import _useStore from '../../store';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useParams } from 'react-router-dom';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import axios from 'axios';
import Moment from 'react-moment';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import SimpleBar from 'simplebar-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRectangleXmark,
    faNewspaper,
    faThumbsUp,
    faThumbsDown,
    faEye,
    faComment,
    faFile,
} from '@fortawesome/free-regular-svg-icons';
import {
    faHouse,
    faShare,
    faEllipsisV,
    faReplyAll,
} from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import { io } from 'socket.io-client';

import 'simplebar-react/dist/simplebar.min.css';

const _socketURL = _.isEqual(process.env.NODE_ENV, 'production')
    ? window.location.hostname
    : 'localhost:5000';
const _socket = io(_socketURL, { transports: ['websocket', 'polling'] });

const usePersistentFingerprint = () => {
    const [__fingerprint, setFingerprint] = useState('');

    useEffect(() => {
        const generateFingerprint = async () => {
            // Check if the persistent identifier exists in storage (e.g., cookie or local storage)
            const persistentIdentifier = localStorage.getItem(
                'persistentIdentifier',
            );

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

    return __fingerprint;
};

const Post = (props) => {
    const _article = _useStore.useArticleStore((state) => state._article);
    const setArticle = _useStore.useArticleStore(
        (state) => state['_article_SET_STATE'],
    );

    const _articleToEdit = _useStore.useArticleStore(
        (state) => state._articleToEdit,
    );
    const setArticleToEdit = _useStore.useArticleStore(
        (state) => state['_articleToEdit_SET_STATE'],
    );
    const clearArticleToEdit = _useStore.useArticleStore(
        (state) => state['_articleToEdit_CLEAR_STATE'],
    );

    const _articles = _useStore.useArticleStore((state) => state._articles);
    const setArticles = _useStore.useArticleStore(
        (state) => state['_articles_SET_STATE'],
    );

    const __fingerprint = usePersistentFingerprint();

    let { _postID } = useParams();

    const _validationSchema = Yup.object()
        .shape({
            Parent: Yup.mixed().nullable(),
            _comment_author: Yup.string()
                .default('')
                .required('Please provide a valid name.')
                .test(
                    'min-length',
                    'Must be at least 2 characters.',
                    (value) => value && value.length >= 2,
                )
                .matches(/^[a-zA-Z\s]*$/i, 'No numbers or symbols.'),
            _comment_email: Yup.string()
                .default('')
                .test(
                    'empty-or-valid-email',
                    'Email invalid.',
                    (__email) =>
                        !__email ||
                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
                            __email,
                        ),
                ),
            _comment_body: Yup.string()
                .default('')
                .required('Please provide a message.'),
            _comment_isPrivate: Yup.boolean().default(false),
            _comment_fingerprint: Yup.string().default(''),
            _comment_upvotes: Yup.array().default([]),
            _comment_downvotes: Yup.array().default([]),
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
            _comment_author: '',
            _comment_email: '',
            _comment_body: '',
            _comment_isPrivate: false,
            _comment_fingerprint: '',
            _comment_upvotes: [],
            _comment_downvotes: [],
        },
    });

    /* Focus State Variables */
    const [_comment_authorFocused, setAuthorFocused] = useState(false);
    const [_comment_emailFocused, setEmailFocused] = useState(false);
    const [_comment_bodyFocused, setBodyFocused] = useState(false);

    /* Modal State Variables */
    const [_showModal, setShowModal] = useState(false);
    const [_modalHeader, setModalHeader] = useState('');
    const [_modalBody, setModalBody] = useState('');
    const [_modalIcon, setModalIcon] = useState('');

    /* Dropdown State Variables */
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

    const _getPost = useCallback(
        async (__fingerprint) => {
            try {
                axios('/api/article')
                    .then(async (response) => {
                        if (__fingerprint) {
                            return await axios
                                .patch(`/api/article/${_postID}/_view`, {
                                    __fingerprint,
                                })
                                .then((res) => {
                                    setArticles(response.data._articles);
                                    setArticle(res.data._article);
                                    console.log(
                                        response.data._articles,
                                        res.data._article,
                                    );
                                    _socket.emit('action', {
                                        type: '_articleViewed',
                                        data: res.data._article,
                                    });
                                })
                                .catch((error) => {
                                    setModalHeader("We're sorry !");
                                    setModalBody(JSON.stringify(error));
                                    setModalIcon(
                                        <FontAwesomeIcon
                                            icon={faRectangleXmark}
                                        />,
                                    );
                                    setShowModal(true);
                                });
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setArticles, setArticle, _postID],
    );

    const _handleReply = (_id) => {
        setValue('Parent', _id);
        setFocus('_comment_author');
    };

    const _handleCommentsVotes = (_aC, _type) => {
        try {
            if (_type === '_u') {
                return axios
                    .patch(`/api/article/${_article._id}/_commentUpvote`, {
                        _id: _aC._id,
                        __fingerprint,
                    })
                    .then((res) => {
                        _getPost(__fingerprint);
                        _socket.emit('action', {
                            type: res.data._type,
                            data: res.data._article,
                        });
                    })
                    .catch((error) => {
                        setModalHeader("We're sorry !");
                        setModalBody(JSON.stringify(error));
                        setModalIcon(
                            <FontAwesomeIcon icon={faRectangleXmark} />,
                        );
                        setShowModal(true);
                    });
            } else {
                return axios
                    .patch(`/api/article/${_article._id}/_commentDownvote`, {
                        _id: _aC._id,
                        __fingerprint,
                    })
                    .then((res) => {
                        _getPost(__fingerprint);
                        _socket.emit('action', {
                            type: res.data._type,
                            data: res.data._article,
                        });
                    })
                    .catch((error) => {
                        setModalHeader("We're sorry !");
                        setModalBody(JSON.stringify(error));
                        setModalIcon(
                            <FontAwesomeIcon icon={faRectangleXmark} />,
                        );
                        setShowModal(true);
                    });
            }
        } catch (error) {
            setModalHeader("We're sorry !");
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const _handleVotes = (_a, _type) => {
        try {
            if (_type === '_u') {
                return axios
                    .patch(`/api/article/${_a._id}/_upvote`, { __fingerprint })
                    .then((res) => {
                        _getPost(__fingerprint);
                        _socket.emit('action', {
                            type: res.data._type,
                            data: res.data._article,
                        });
                    })
                    .catch((error) => {
                        setModalHeader("We're sorry !");
                        setModalBody(JSON.stringify(error));
                        setModalIcon(
                            <FontAwesomeIcon icon={faRectangleXmark} />,
                        );
                        setShowModal(true);
                    });
            } else {
                return axios
                    .patch(`/api/article/${_a._id}/_downvote`, {
                        __fingerprint,
                    })
                    .then((res) => {
                        _getPost(__fingerprint);
                        _socket.emit('action', {
                            type: res.data._type,
                            data: res.data._article,
                        });
                    })
                    .catch((error) => {
                        setModalHeader("We're sorry !");
                        setModalBody(JSON.stringify(error));
                        setModalIcon(
                            <FontAwesomeIcon icon={faRectangleXmark} />,
                        );
                        setShowModal(true);
                    });
            }
        } catch (error) {
            setModalHeader("We're sorry !");
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const _handleEdit = (_arCo) => {
        setValue('Parent', _arCo.Parent);
        setValue('_comment_author', _arCo._comment_author);
        setValue('_comment_email', _arCo._comment_email);
        setValue('_comment_body', _arCo._comment_body);
        setValue('_comment_isPrivate', _arCo._comment_isPrivate);
        setValue('_comment_fingerprint', _arCo._comment_fingerprint);
        setValue('_comment_upvotes', _arCo._comment_upvotes);
        setValue('_comment_downvotes', _arCo._comment_downvotes);

        // Set the article to be edited in the _articleToEdit state
        setArticleToEdit(_arCo);
    };

    const _handleDelete = (_id) => {
        /* return axios.delete(`/api/article/${_id}`)
            .then((res) => {
                deleteArticle(_id);
                if (_articleToEdit._id === _id)
                    _handleCancel();
                _socket.emit('action', { type: '_testimonyDeleted', data: res.data._testimony });
            }); */
    };

    const _handleCancel = () => {
        // Reset the form fields
        reset({
            Parent: null,
            _comment_author: '',
            _comment_email: '',
            _comment_body: '',
            _comment_isPrivate: false,
            _comment_fingerprint: '',
            _comment_upvotes: [],
            _comment_downvotes: [],
        });

        // Clearing the _articleToEdit state is going to fuck this shit up
        clearArticleToEdit();
    };

    const onSubmit = async (values) => {
        _.isEmpty(values._comment_fingerprint) &&
            (values._comment_fingerprint = __fingerprint);

        try {
            if (_.isEmpty(_articleToEdit)) {
                return axios
                    .patch(`/api/article/${_article._id}/_comment`, values)
                    .then((res) => {
                        _getPost(__fingerprint);
                        _socket.emit('action', {
                            type: '_commentCreated',
                            data: res.data._aComment,
                        });
                    })
                    .then(() => {
                        reset({
                            Parent: null,
                            _comment_author: '',
                            _comment_email: '',
                            _comment_body: '',
                            _comment_isPrivate: false,
                            _comment_fingerprint: '',
                            _comment_upvotes: [],
                            _comment_downvotes: [],
                        });
                    })
                    .catch((error) => {
                        setModalHeader("We're sorry !");
                        setModalBody(JSON.stringify(error));
                        setModalIcon(
                            <FontAwesomeIcon icon={faRectangleXmark} />,
                        );
                        setShowModal(true);
                    });
            } else {
                return axios
                    .patch(`/api/article/${_article._id}/_comment`, {
                        _id: _articleToEdit._id,
                        ...values,
                    })
                    .then((res) => {
                        _getPost(__fingerprint);
                        _socket.emit('action', {
                            type: '_commentUpdated',
                            data: res.data._article,
                        });
                    })
                    .then(() => {
                        reset({
                            Parent: null,
                            _comment_author: '',
                            _comment_email: '',
                            _comment_body: '',
                            _comment_isPrivate: false,
                            _comment_fingerprint: '',
                            _comment_upvotes: [],
                            _comment_downvotes: [],
                        });

                        // Clear the _articleToEdit state
                        clearArticleToEdit();
                    })
                    .catch((error) => {
                        setModalHeader("We're sorry !");
                        setModalBody(JSON.stringify(error));
                        setModalIcon(
                            <FontAwesomeIcon icon={faRectangleXmark} />,
                        );
                        setShowModal(true);
                    });
            }
        } catch (error) {
            setModalHeader("We're sorry !");
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const onError = (error) => {
        console.log(error);
        setModalHeader("We're sorry !");
        setModalBody('Please check the fields for valid information.');
        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
        setShowModal(true);
    };

    useEffect(() => {
        _getPost(__fingerprint);

        const handleBeforeUnload = () => {
            clearArticleToEdit();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        const subscription = watch((value, { name, type }) => {});
        return () => {
            subscription.unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [clearArticleToEdit, __fingerprint, _getPost, watch]);

    return (
        <main className="_post">
            <section className="_s1">
                <Breadcrumb>
                    <Breadcrumb.Item href="/">
                        <FontAwesomeIcon icon={faHouse} />
                        <span className="w-100 g-col-11">
                            <p>
                                Home<b className="pink_dot">.</b>
                            </p>
                        </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item href="/blog">
                        <FontAwesomeIcon icon={faNewspaper} />
                        <span className="w-100 g-col-11">
                            <p>
                                Blog<b className="pink_dot">.</b>
                            </p>
                        </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>
                        <FontAwesomeIcon icon={faFile} />
                        <span className="w-100 g-col-11">
                            <p>{_article._article_title}</p>
                        </span>
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="_postBox d-flex flex-column justify-content-center align-items-end">
                    <h1 className="_title">{_article._article_title}</h1>
                    <p className="text-muted _author">
                        by{' '}
                        <b>
                            {_.isEmpty(
                                _article._article_author?._user_lastname,
                            ) &&
                            _.isEmpty(_article._article_author?._user_firstname)
                                ? _article._article_author?._user_username
                                : !_.isEmpty(
                                        _article._article_author._user_lastname,
                                    )
                                  ? _article._article_author._user_lastname +
                                    ' ' +
                                    _article._article_author._user_firstname
                                  : _article._article_author._user_firstname}
                        </b>
                        ,{' '}
                        {
                            <Moment local fromNow>
                                {_article.updatedAt}
                            </Moment>
                        }
                    </p>
                    <div
                        className="text-muted _body"
                        dangerouslySetInnerHTML={{
                            __html: _article._article_body,
                        }}
                    ></div>
                    <div className="_vcuds d-flex">
                        <div className="text-muted d-flex align-items-center views">
                            <p>{_.size(_article._article_views)}</p>
                            <FontAwesomeIcon icon={faEye} />
                        </div>
                        <div className="text-muted d-flex align-items-center comments">
                            <p>{_.size(_article._article_comments)}</p>
                            <Button
                                type="button"
                                className="border border-0 rounded-0"
                                onClick={() =>
                                    document
                                        .getElementById('_s2')
                                        .scrollIntoView({ behavior: 'smooth' })
                                }
                            >
                                <FontAwesomeIcon icon={faComment} />
                            </Button>
                        </div>
                        <div
                            className={`text-muted d-flex align-items-center upvotes ${!_.some(_article._article_upvotes, { _upvoter: __fingerprint }) ? '' : 'active'}`}
                        >
                            <p>{_.size(_article._article_upvotes)}</p>
                            <Button
                                type="button"
                                className="border border-0 rounded-0"
                                onClick={() => _handleVotes(_article, '_u')}
                            >
                                <FontAwesomeIcon icon={faThumbsUp} />
                            </Button>
                        </div>
                        <div
                            className={`text-muted d-flex align-items-center downvotes ${!_.some(_article._article_downvotes, { _downvoter: __fingerprint }) ? '' : 'active'}`}
                        >
                            <p>{_.size(_article._article_downvotes)}</p>
                            <Button
                                type="button"
                                className="border border-0 rounded-0"
                                onClick={() => _handleVotes(_article, '_d')}
                            >
                                <FontAwesomeIcon icon={faThumbsDown} />
                            </Button>
                        </div>
                        <div className="text-muted d-flex align-items-center share">
                            {/* <button data-toggle='modal' data-target='#shareModal'>
                                <i className='fas fa-share'></i>
                            </button> */}
                            <Button
                                type="button"
                                className="border border-0 rounded-0"
                            >
                                <FontAwesomeIcon icon={faShare} />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="_PrevNext d-flex justify-content-between align-items-center">
                    <a
                        href={_.get(
                            _.orderBy(_articles, ['_article_views'], ['desc']),
                            [
                                _.indexOf(
                                    _.orderBy(
                                        _articles,
                                        ['_article_views'],
                                        ['desc'],
                                    ),
                                    _.find(_articles, { _id: _article._id }),
                                ) - 1,
                                '_id',
                            ],
                            _.get(
                                _.last(
                                    _.orderBy(
                                        _articles,
                                        ['_article_views'],
                                        ['desc'],
                                    ),
                                ),
                                '_id',
                            ),
                        )}
                        className="_prevArticle"
                    >
                        {_.get(
                            _.orderBy(_articles, ['_article_views'], ['desc']),
                            [
                                _.indexOf(
                                    _.orderBy(
                                        _articles,
                                        ['_article_views'],
                                        ['desc'],
                                    ),
                                    _.find(_articles, { _id: _article._id }),
                                ) - 1,
                                '_article_title',
                            ],
                            _.get(
                                _.last(
                                    _.orderBy(
                                        _articles,
                                        ['_article_views'],
                                        ['desc'],
                                    ),
                                ),
                                '_article_title',
                            ),
                        )}
                        <b className="pink_dot">.</b>
                    </a>
                    <a
                        href={_.get(
                            _.orderBy(_articles, ['_article_views'], ['desc']),
                            [
                                _.indexOf(
                                    _.orderBy(
                                        _articles,
                                        ['_article_views'],
                                        ['desc'],
                                    ),
                                    _.find(_articles, { _id: _article._id }),
                                ) + 1,
                                '_id',
                            ],
                            _.get(
                                _.last(
                                    _.orderBy(
                                        _articles,
                                        ['_article_views'],
                                        ['desc'],
                                    ),
                                ),
                                '_id',
                            ),
                        )}
                        className="_nextArticle"
                    >
                        {_.get(
                            _.orderBy(_articles, ['_article_views'], ['desc']),
                            [
                                _.indexOf(
                                    _.orderBy(
                                        _articles,
                                        ['_article_views'],
                                        ['desc'],
                                    ),
                                    _.find(_articles, { _id: _article._id }),
                                ) + 1,
                                '_article_title',
                            ],
                            _.get(
                                _.head(
                                    _.orderBy(
                                        _articles,
                                        ['_article_views'],
                                        ['desc'],
                                    ),
                                ),
                                '_article_title',
                            ),
                        )}
                        <b className="pink_dot">.</b>
                    </a>
                </div>
            </section>
            <section className="_s2 grid" id="_s2">
                <div className="g-col-6 d-flex align-items-center justify-content-center">
                    <Card className="border border-0 rounded-0">
                        <Card.Header className="rounded-0">
                            <h3>Feel Free to Share Your Thoughts!</h3>
                            <p className="text-muted">
                                Join the Conversation & Help Us Improve Your
                                Experience, We Value Your Feedback and Ideas!
                            </p>
                        </Card.Header>
                        <Card.Body>
                            <Form
                                onSubmit={handleSubmit(onSubmit, onError)}
                                className="grid"
                            >
                                <Row className="g-col-12">
                                    <Form.Group
                                        controlId="_comment_author"
                                        className={`_formGroup ${_comment_authorFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label="Name."
                                            className="_formLabel"
                                        >
                                            <Form.Control
                                                {...register('_comment_author')}
                                                onBlur={() => {
                                                    setAuthorFocused(false);
                                                    trigger('_comment_author');
                                                }}
                                                onFocus={() =>
                                                    setAuthorFocused(true)
                                                }
                                                placeholder="Name."
                                                autoComplete="new-password"
                                                type="text"
                                                className={`_formControl border rounded-0 ${errors._comment_author ? 'border-danger' : ''}`}
                                                name="_comment_author"
                                            />
                                            {errors._comment_author && (
                                                <Form.Text
                                                    className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(watch('_comment_author')) ? '_fieldNotEmpty' : ''}`}
                                                >
                                                    {
                                                        errors._comment_author
                                                            .message
                                                    }
                                                </Form.Text>
                                            )}
                                            {!_.isEmpty(
                                                watch('_comment_author'),
                                            ) && (
                                                <div
                                                    className="__close"
                                                    onClick={() => {
                                                        resetField(
                                                            '_comment_author',
                                                        );
                                                    }}
                                                ></div>
                                            )}
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className="g-col-12">
                                    <Form.Group
                                        controlId="_comment_email"
                                        className={`_formGroup ${_comment_emailFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label="Email."
                                            className="_formLabel"
                                        >
                                            <Form.Control
                                                {...register('_comment_email')}
                                                onBlur={() => {
                                                    setEmailFocused(false);
                                                    trigger('_comment_email');
                                                }}
                                                onFocus={() =>
                                                    setEmailFocused(true)
                                                }
                                                placeholder="Email."
                                                autoComplete="new-password"
                                                type="text"
                                                className={`_formControl border rounded-0 ${errors._comment_email ? 'border-danger' : ''}`}
                                                name="_comment_email"
                                            />
                                            {errors._comment_email && (
                                                <Form.Text
                                                    className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(watch('_comment_email')) ? '_fieldNotEmpty' : ''}`}
                                                >
                                                    {
                                                        errors._comment_email
                                                            .message
                                                    }
                                                </Form.Text>
                                            )}
                                            {!_.isEmpty(
                                                watch('_comment_email'),
                                            ) && (
                                                <div
                                                    className="__close"
                                                    onClick={() => {
                                                        resetField(
                                                            '_comment_email',
                                                        );
                                                    }}
                                                ></div>
                                            )}
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className="g-col-12">
                                    <Form.Group
                                        controlId="_comment_body"
                                        className={`_formGroup ${_comment_bodyFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label="Message."
                                            className="_formLabel"
                                        >
                                            <Form.Control
                                                {...register('_comment_body')}
                                                onBlur={() => {
                                                    setBodyFocused(false);
                                                    trigger('_comment_body');
                                                }}
                                                onFocus={() =>
                                                    setBodyFocused(true)
                                                }
                                                placeholder="Message."
                                                as="textarea"
                                                autoComplete="new-password"
                                                type="text"
                                                className={`_formControl border rounded-0 ${errors._comment_body ? 'border-danger' : ''}`}
                                                name="_comment_body"
                                            />
                                            {errors._comment_body && (
                                                <Form.Text
                                                    className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(watch('_comment_body')) ? '_fieldNotEmpty' : ''}`}
                                                >
                                                    {
                                                        errors._comment_body
                                                            .message
                                                    }
                                                </Form.Text>
                                            )}
                                            {!_.isEmpty(
                                                watch('_comment_body'),
                                            ) && (
                                                <div
                                                    className="__close _messageInput"
                                                    onClick={() => {
                                                        resetField(
                                                            '_comment_body',
                                                        );
                                                    }}
                                                ></div>
                                            )}
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className="g-col-12">
                                    <Form.Group
                                        controlId="_comment_isPrivate"
                                        className="_formGroup _checkGroup "
                                    >
                                        <FloatingLabel
                                            label="Private Message ?"
                                            className="_formLabel"
                                        >
                                            <Form.Check
                                                {...register(
                                                    '_comment_isPrivate',
                                                )}
                                                type="switch"
                                                className="_formSwitch"
                                                name="_comment_isPrivate"
                                            />
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className="g-col-12">
                                    <Button
                                        type="submit"
                                        className="border border-0 rounded-0 inverse w-50"
                                        variant="outline-light"
                                    >
                                        <div className="buttonBorders">
                                            <div className="borderTop"></div>
                                            <div className="borderRight"></div>
                                            <div className="borderBottom"></div>
                                            <div className="borderLeft"></div>
                                        </div>
                                        <span>
                                            {!_.isEmpty(_articleToEdit)
                                                ? 'Update'
                                                : 'Submit'}
                                            <b className="pink_dot">.</b>
                                        </span>
                                    </Button>
                                </Row>
                                <Row className="g-col-12">
                                    {
                                        //Upon click it just disapears or appears too fast
                                        (!_.isEmpty(_articleToEdit) ||
                                            watch('Parent') !== null) && (
                                            <Button
                                                type="button"
                                                className="border border-0 rounded-0 _red"
                                                variant="link"
                                                onClick={() => _handleCancel()}
                                            >
                                                Cancel
                                                <b className="pink_dot">.</b>
                                            </Button>
                                        )
                                    }
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
                <div className="g-col-6">
                    {/* Check for how to make the scroll bar wider upon hover and more cool */}
                    <SimpleBar
                        style={{ maxHeight: '72vh' }}
                        forceVisible="y"
                        autoHide={false}
                    >
                        {_.map(
                            _.chain(
                                _.filter(_article._article_comments, (_aC) => {
                                    return (
                                        !_aC._comment_isPrivate &&
                                        _aC.Parent === null
                                    );
                                }),
                            )
                                .sortBy([
                                    // Sort by upvotes count in descending order
                                    // This fires an error upon creating a new article
                                    (_aComment) =>
                                        -_.size(_aComment._comment_upvotes),
                                    // Sort by Article with the most Replies
                                    (_aComment) =>
                                        -_.size(
                                            _.filter(
                                                _article._article_comments,
                                                ['Parent', _aComment._id],
                                            ),
                                        ),
                                    // Sort by creation date in descending order
                                    '_createdAt',
                                    // Sort by update date in descending order
                                    '_updatedAt',
                                ])
                                .value(),
                            (_aComment, index) => {
                                const _aCommentId = `_aComment_${index}`;

                                return (
                                    <Card
                                        className={`border border-0 rounded-0 card_${_aCommentId}`}
                                        key={_aCommentId}
                                    >
                                        <Card.Body className="d-flex flex-column">
                                            <div className="_topRow d-flex">
                                                <p className="text-muted author">
                                                    <b>
                                                        {_.capitalize(
                                                            _aComment._comment_author,
                                                        )}
                                                    </b>
                                                    ,{' '}
                                                    {
                                                        <Moment local fromNow>
                                                            {
                                                                _aComment.updatedAt
                                                            }
                                                        </Moment>
                                                    }
                                                </p>
                                                <div className="interactions ms-auto d-flex">
                                                    <div className="text-muted d-flex align-items-center replies">
                                                        <p>
                                                            {_.size(
                                                                _.filter(
                                                                    _article._article_comments,
                                                                    {
                                                                        Parent: _aComment._id,
                                                                    },
                                                                ),
                                                            )}
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            className="border border-0 rounded-0"
                                                            onClick={() =>
                                                                _handleEdit(
                                                                    _aComment,
                                                                )
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faReplyAll
                                                                }
                                                            />
                                                        </Button>
                                                    </div>
                                                    <div
                                                        className={`text-muted d-flex align-items-center upvotes ${!_.some(_.get(_aComment, '_comment_upvotes'), { _upvoter: __fingerprint }) ? '' : 'active'}`}
                                                    >
                                                        <p>
                                                            {_.size(
                                                                _.get(
                                                                    _aComment,
                                                                    '_comment_upvotes',
                                                                ),
                                                            )}
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            className="border border-0 rounded-0"
                                                            /* Clicking on this is not going to do anything cause the handleVotes,
                                                                handles the _article_upvotes, not the comment's _*upvotes*/
                                                            onClick={() =>
                                                                _handleCommentsVotes(
                                                                    _aComment,
                                                                    '_u',
                                                                )
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faThumbsUp
                                                                }
                                                            />
                                                        </Button>
                                                    </div>
                                                    <div
                                                        className={`text-muted d-flex align-items-center downvotes ${!_.some(_.get(_aComment, '_comment_downvotes'), { _downvoter: __fingerprint }) ? '' : 'active'}`}
                                                    >
                                                        <p>
                                                            {_.size(
                                                                _.get(
                                                                    _aComment,
                                                                    '_comment_downvotes',
                                                                ),
                                                            )}
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            className="border border-0 rounded-0"
                                                            onClick={() =>
                                                                _handleCommentsVotes(
                                                                    _aComment,
                                                                    '_d',
                                                                )
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faThumbsDown
                                                                }
                                                            />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="_middleRow">
                                                <h4>
                                                    {_.capitalize(
                                                        _aComment._comment_body,
                                                    )}
                                                </h4>
                                            </div>
                                            <div className="_bottomRow d-flex justify-content-end">
                                                <Dropdown
                                                    key={_aCommentId}
                                                    show={
                                                        _showReplyDropdown[
                                                            _aCommentId
                                                        ]
                                                    }
                                                    onMouseEnter={() => {
                                                        _handleMouseEnter(
                                                            _aCommentId,
                                                        );
                                                    }}
                                                    onMouseLeave={() => {
                                                        _handleMouseLeave(
                                                            _aCommentId,
                                                        );
                                                    }}
                                                >
                                                    <Dropdown.Toggle as="span">
                                                        <span className="d-flex align-items-center justify-content-center">
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faEllipsisV
                                                                }
                                                            />
                                                        </span>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="border rounded-0">
                                                        <Form className="d-flex flex-column">
                                                            <Dropdown.Item
                                                                onClick={() =>
                                                                    _handleReply(
                                                                        _aComment._id,
                                                                    )
                                                                }
                                                            >
                                                                Reply
                                                                <b className="pink_dot">
                                                                    .
                                                                </b>
                                                            </Dropdown.Item>
                                                            {_aComment._comment_fingerprint ===
                                                                __fingerprint && (
                                                                <>
                                                                    <Dropdown.Item
                                                                        onClick={() =>
                                                                            _handleEdit(
                                                                                _aComment,
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                        <b className="pink_dot">
                                                                            .
                                                                        </b>
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Divider />
                                                                    <Dropdown.Item
                                                                        onClick={() =>
                                                                            _handleDelete(
                                                                                _aComment._id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                        <b className="pink_dot">
                                                                            .
                                                                        </b>
                                                                    </Dropdown.Item>
                                                                </>
                                                            )}
                                                        </Form>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                            {_.map(
                                                _.chain(
                                                    _.filter(
                                                        _article._article_comments,
                                                        (_aC) => {
                                                            return (
                                                                !_aC._comment_isPrivate &&
                                                                _aC.Parent ===
                                                                    _aComment._id
                                                            );
                                                        },
                                                    ),
                                                )
                                                    .sortBy([
                                                        // Sort by upvotes count in descending order
                                                        // This fires an error upon creating a new article
                                                        (_aC) =>
                                                            -_.size(
                                                                _aC._comment_upvotes,
                                                            ),
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
                                                            <Card.Body className="d-flex flex-column">
                                                                <div className="_topRow d-flex">
                                                                    <p className="text-muted author">
                                                                        <b>
                                                                            {_.capitalize(
                                                                                _reply._comment_author,
                                                                            )}
                                                                        </b>
                                                                        ,{' '}
                                                                        {
                                                                            <Moment
                                                                                local
                                                                                fromNow
                                                                            >
                                                                                {
                                                                                    _reply.updatedAt
                                                                                }
                                                                            </Moment>
                                                                        }
                                                                    </p>
                                                                    <div className="interactions ms-auto d-flex">
                                                                        <div
                                                                            className={`text-muted d-flex align-items-center upvotes ${!_.some(_.get(_reply, '_comment_upvotes'), { _upvoter: __fingerprint }) ? '' : 'active'}`}
                                                                        >
                                                                            <p>
                                                                                {_.size(
                                                                                    _.get(
                                                                                        _reply,
                                                                                        '_comment_upvotes',
                                                                                    ),
                                                                                )}
                                                                            </p>
                                                                            <Button
                                                                                type="button"
                                                                                className="border border-0 rounded-0"
                                                                                onClick={() =>
                                                                                    _handleCommentsVotes(
                                                                                        _reply,
                                                                                        '_u',
                                                                                    )
                                                                                }
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faThumbsUp
                                                                                    }
                                                                                />
                                                                            </Button>
                                                                        </div>
                                                                        <div
                                                                            className={`text-muted d-flex align-items-center downvotes ${!_.some(_.get(_reply, '_comment_downvotes'), { _downvoter: __fingerprint }) ? '' : 'active'}`}
                                                                        >
                                                                            <p>
                                                                                {_.size(
                                                                                    _.get(
                                                                                        _reply,
                                                                                        '_comment_downvotes',
                                                                                    ),
                                                                                )}
                                                                            </p>
                                                                            <Button
                                                                                type="button"
                                                                                className="border border-0 rounded-0"
                                                                                onClick={() =>
                                                                                    _handleCommentsVotes(
                                                                                        _reply,
                                                                                        '_d',
                                                                                    )
                                                                                }
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faThumbsDown
                                                                                    }
                                                                                />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="_middleRow">
                                                                    <h4>
                                                                        {_.capitalize(
                                                                            _reply._comment_body,
                                                                        )}
                                                                    </h4>
                                                                </div>
                                                                <div className="_bottomRow d-flex justify-content-end">
                                                                    {_reply._comment_fingerprint ===
                                                                        __fingerprint && (
                                                                        <Dropdown
                                                                            key={
                                                                                _replyId
                                                                            }
                                                                            show={
                                                                                _showReplyDropdown[
                                                                                    _replyId
                                                                                ]
                                                                            }
                                                                            onMouseEnter={() => {
                                                                                _handleMouseEnter(
                                                                                    _replyId,
                                                                                );
                                                                            }}
                                                                            onMouseLeave={() => {
                                                                                _handleMouseLeave(
                                                                                    _replyId,
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Dropdown.Toggle as="span">
                                                                                <span className="d-flex align-items-center justify-content-center">
                                                                                    <FontAwesomeIcon
                                                                                        icon={
                                                                                            faEllipsisV
                                                                                        }
                                                                                    />
                                                                                </span>
                                                                            </Dropdown.Toggle>
                                                                            <Dropdown.Menu className="border rounded-0">
                                                                                <Form className="d-flex flex-column">
                                                                                    <Dropdown.Item
                                                                                        onClick={() =>
                                                                                            _handleEdit(
                                                                                                _reply,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        Edit
                                                                                        <b className="pink_dot">
                                                                                            .
                                                                                        </b>
                                                                                    </Dropdown.Item>
                                                                                    <Dropdown.Item
                                                                                        onClick={() =>
                                                                                            _handleDelete(
                                                                                                _reply._id,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        Delete
                                                                                        <b className="pink_dot">
                                                                                            .
                                                                                        </b>
                                                                                    </Dropdown.Item>
                                                                                </Form>
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                    )}
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    );
                                                },
                                            )}
                                        </Card.Body>
                                    </Card>
                                );
                            },
                        )}
                    </SimpleBar>
                </div>
            </section>

            <Modal
                show={_showModal}
                onHide={() => setShowModal(false)}
                centered
            >
                <Form>
                    <Modal.Header closeButton>
                        <Modal.Title>{_modalHeader}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-muted">
                        <pre>{_modalBody}</pre>
                    </Modal.Body>
                    <Modal.Footer>
                        {_modalIcon}
                        <Button
                            type="button"
                            className="border border-0 rounded-0 inverse w-50"
                            variant="outline-light"
                            onClick={() => setShowModal(false)}
                        >
                            <div className="buttonBorders">
                                <div className="borderTop"></div>
                                <div className="borderRight"></div>
                                <div className="borderBottom"></div>
                                <div className="borderLeft"></div>
                            </div>
                            <span>
                                Close<b className="pink_dot">.</b>
                            </span>
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </main>
    );
};

export default Post;
