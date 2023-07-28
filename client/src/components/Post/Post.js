import React, { useCallback, useEffect, useState } from 'react';
import { _useStore } from '../../store/store';
import { useForm } from 'react-hook-form';
import {
    useNavigate,
    useLocation,
    useParams
} from 'react-router-dom';
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
import { faRectangleXmark, faNewspaper, faThumbsUp, faThumbsDown, faEye, faComment } from '@fortawesome/free-regular-svg-icons';
import { faHouse, faShare, faEllipsisV, faReplyAll } from '@fortawesome/free-solid-svg-icons';
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

const Post = (props) => {
    const _article = _useStore((state) => state._article);
    const setArticle = _useStore((state) => state.setArticle);
    const addArticle = _useStore((state) => state.addArticle);
    const deleteArticle = _useStore((state) => state.deleteArticle);
    const _articles = _useStore((state) => state._articles);
    const setArticles = _useStore((state) => state.setArticles);
    const updateArticles = _useStore((state) => state.updateArticles);
    const _articleToEdit = _useStore((state) => state._articleToEdit);
    const setArticleToEdit = _useStore((state) => state.setArticleToEdit);
    const clearArticleToEdit = _useStore((state) => state.clearArticleToEdit);

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
            _author: '',
            _email: '',
            _body: '',
            _isPrivate: false,
            _fingerprint: '',
            _upvotes: [],
            _downvotes: []
        }
    });

    const [_authorFocused, setAuthorFocused] = useState(false);
    const [_emailFocused, setEmailFocused] = useState(false);
    const [_bodyFocused, setBodyFocused] = useState(false);

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

    let location = useLocation();
    let navigate = useNavigate();
    let { _postID } = useParams();

    const _getPost = useCallback(
        async () => {
            try {
                axios('/api/article')
                    .then((response) => {
                        setArticles(response.data._articles);
                        setArticle(_.find(response.data._articles, { '_id': _postID }));
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setArticles, setArticle, _postID]
    );

    const _handleReply = (_id) => {
        setValue('_parentId', _id);
        setFocus('_author');
    };

    const _handleCommentsVotes = (_aC, _type) => {
        try {
            if (_type === 'up') {
                if (_.isUndefined(_.find(_.get(_aC, '_upvotes'), { _upvoter: _fingerprint }))) {
                    if (_.isUndefined(_.find(_.get(_aC, '_downvotes'), { _downvoter: _fingerprint }))) {
                        // 'I have never Upvoted / Downvoted this Comment'
                        return axios.patch(`/api/article/${_article._id}/_comment`, {
                            ..._article,
                            _article_comments: _.map(_article._article_comments, (_articleComment) => { return _articleComment._id !== _aC._id ? _articleComment : { ..._articleComment, _upvotes: [..._articleComment._upvotes, { _upvoter: _fingerprint }] } })
                        })
                            .then((res) => {
                                _getPost();
                                _socket.emit('action', { type: '_commentUpvoted', data: res.data._article });
                            })
                            .catch((error) => {
                                setModalHeader('We\'re sorry !');
                                setModalBody(JSON.stringify(error));
                                setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                                setShowModal(true);
                            });
                    } else {
                        // 'I have never Upvoted / already Downvoted this Comment'
                        return axios.patch(`/api/article/${_article._id}/_comment`, {
                            ..._article,
                            _article_comments: _.map(_article._article_comments, (_articleComment) => { return _articleComment._id !== _aC._id ? _articleComment : { ..._articleComment, _upvotes: [..._articleComment._upvotes, { _upvoter: _fingerprint }], _downvotes: _.filter(_articleComment._downvotes, _vote => _vote._downvoter !== _fingerprint) } })
                        })
                            .then((res) => {
                                _getPost();
                                _socket.emit('action', { type: '_commentUpvotedRDownvote', data: res.data._article });
                            })
                            .catch((error) => {
                                setModalHeader('We\'re sorry !');
                                setModalBody(JSON.stringify(error));
                                setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                                setShowModal(true);
                            });
                    }
                } else {
                    // 'I have already Upvoted this Comment'
                    return axios.patch(`/api/article/${_article._id}/_comment`, {
                        ..._article,
                        _article_comments: _.map(_article._article_comments, (_articleComment) => { return _articleComment._id !== _aC._id ? _articleComment : { ..._articleComment, _upvotes: _.filter(_articleComment._upvotes, _vote => _vote._upvoter !== _fingerprint) } })
                    })
                        .then((res) => {
                            _getPost();
                            _socket.emit('action', { type: '_commentUpvoteRemoved', data: res.data._article });
                        })
                        .catch((error) => {
                            setModalHeader('We\'re sorry !');
                            setModalBody(JSON.stringify(error));
                            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                            setShowModal(true);
                        });
                }
            } else {
                if (_.isUndefined(_.find(_.get(_aC, '_downvotes'), { _downvoter: _fingerprint }))) {
                    if (_.isUndefined(_.find(_.get(_aC, '_upvotes'), { _upvoter: _fingerprint }))) {
                        // 'I have never Upvoted / Downvoted this Comment'
                        return axios.patch(`/api/article/${_article._id}/_comment`, {
                            ..._article,
                            _article_comments: _.map(_article._article_comments, (_articleComment) => { return _articleComment._id !== _aC._id ? _articleComment : { ..._articleComment, _downvotes: [..._articleComment._downvotes, { _downvoter: _fingerprint }] } })
                        })
                            .then((res) => {
                                _getPost();
                                _socket.emit('action', { type: '_commentDownvoted', data: res.data._article });
                            })
                            .catch((error) => {
                                setModalHeader('We\'re sorry !');
                                setModalBody(JSON.stringify(error));
                                setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                                setShowModal(true);
                            });
                    } else {
                        // 'I have never Downvoted / already Upvoted this Comment'
                        return axios.patch(`/api/article/${_article._id}/_comment`, {
                            ..._article,
                            _article_comments: _.map(_article._article_comments, (_articleComment) => { return _articleComment._id !== _aC._id ? _articleComment : { ..._articleComment, _downvotes: [..._articleComment._downvotes, { _downvoter: _fingerprint }], _upvotes: _.filter(_articleComment._upvotes, _vote => _vote._upvoter !== _fingerprint) } })
                        })
                            .then((res) => {
                                _getPost();
                                _socket.emit('action', { type: '_commentDownvotedRUpvote', data: res.data._article });
                            })
                            .catch((error) => {
                                setModalHeader('We\'re sorry !');
                                setModalBody(JSON.stringify(error));
                                setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                                setShowModal(true);
                            });
                    }
                } else {
                    // 'I have already Downvoted this Comment'
                    return axios.patch(`/api/article/${_article._id}/_comment`, {
                        ..._article,
                        _article_comments: _.map(_article._article_comments, (_articleComment) => { return _articleComment._id !== _aC._id ? _articleComment : { ..._articleComment, _downvotes: _.filter(_articleComment._downvotes, _vote => _vote._downvoter !== _fingerprint) } })
                    })
                        .then((res) => {
                            _getPost();
                            _socket.emit('action', { type: '_commentDownvoteRemoved', data: res.data._article });
                        })
                        .catch((error) => {
                            setModalHeader('We\'re sorry !');
                            setModalBody(JSON.stringify(error));
                            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                            setShowModal(true);
                        });
                }
            }
        } catch (error) {
            setModalHeader('We\'re sorry !');
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const _handleVotes = (_a, _type) => {
        try {
            if (_type === 'up') {
                if (_.isUndefined(_.find(_.get(_a, '_article_upvotes'), { _upvoter: _fingerprint }))) {
                    if (_.isUndefined(_.find(_.get(_a, '_article_downvotes'), { _downvoter: _fingerprint }))) {
                        // 'I have never Upvoted / Downvoted this Article'
                        return axios.patch(`/api/article/${_a._id}`, {
                            ..._a,
                            _article_upvotes: [
                                ..._a._article_upvotes,
                                { _upvoter: _fingerprint }
                            ]
                        })
                            .then((res) => {
                                _getPost();
                                _socket.emit('action', { type: '_articleUpvoted', data: res.data._article });
                            })
                            .catch((error) => {
                                setModalHeader('We\'re sorry !');
                                setModalBody(JSON.stringify(error));
                                setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                                setShowModal(true);
                            });
                    } else {
                        // 'I have never Upvoted / already Downvoted this Article'
                        return axios.patch(`/api/article/${_a._id}`, {
                            ..._a,
                            _article_upvotes: [
                                ..._a._article_upvotes,
                                { _upvoter: _fingerprint }
                            ],
                            _article_downvotes: _.filter(_a._article_downvotes, _vote => _vote._downvoter !== _fingerprint)
                        })
                            .then((res) => {
                                _getPost();
                                _socket.emit('action', { type: '_articleUpvotedRDownvote', data: res.data._article });
                            })
                            .catch((error) => {
                                setModalHeader('We\'re sorry !');
                                setModalBody(JSON.stringify(error));
                                setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                                setShowModal(true);
                            });
                    }
                } else {
                    // 'I have already Upvoted this Article'
                    return axios.patch(`/api/article/${_a._id}`, {
                        ..._a,
                        _article_upvotes: _.filter(_a._article_upvotes, _vote => _vote._upvoter !== _fingerprint)
                    })
                        .then((res) => {
                            _getPost();
                            _socket.emit('action', { type: '_articleUpvoteRemoved', data: res.data._article });
                        })
                        .catch((error) => {
                            setModalHeader('We\'re sorry !');
                            setModalBody(JSON.stringify(error));
                            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                            setShowModal(true);
                        });
                }
            } else {
                if (_.isUndefined(_.find(_.get(_a, '_article_downvotes'), { _downvoter: _fingerprint }))) {
                    if (_.isUndefined(_.find(_.get(_a, '_article_upvotes'), { _upvoter: _fingerprint }))) {
                        // 'I have never Upvoted / Downvoted this Article'
                        return axios.patch(`/api/article/${_a._id}`, {
                            ..._a,
                            _article_downvotes: [
                                ..._a._article_downvotes,
                                { _downvoter: _fingerprint }
                            ]
                        })
                            .then((res) => {
                                _getPost();
                                _socket.emit('action', { type: '_articleDownvoted', data: res.data._article });
                            })
                            .catch((error) => {
                                setModalHeader('We\'re sorry !');
                                setModalBody(JSON.stringify(error));
                                setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                                setShowModal(true);
                            });
                    } else {
                        // 'I have never Downvoted / already Upvoted this Article'
                        return axios.patch(`/api/article/${_a._id}`, {
                            ..._a,
                            _article_downvotes: [
                                ..._a._article_downvotes,
                                { _downvoter: _fingerprint }
                            ],
                            _article_upvotes: _.filter(_a._article_upvotes, _vote => _vote._upvoter !== _fingerprint)
                        })
                            .then((res) => {
                                _getPost();
                                _socket.emit('action', { type: '_articleDownvoted', data: res.data._article });
                            })
                            .catch((error) => {
                                setModalHeader('We\'re sorry !');
                                setModalBody(JSON.stringify(error));
                                setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                                setShowModal(true);
                            });
                    }
                } else {
                    // 'I have already Downvoted this Article'
                    return axios.patch(`/api/article/${_a._id}`, {
                        ..._a,
                        _article_downvotes: _.filter(_a._article_downvotes, _vote => _vote._downvoter !== _fingerprint)
                    })
                        .then((res) => {
                            _getPost();
                            _socket.emit('action', { type: '_articleDownvoteRemoved', data: res.data._article });
                        })
                        .catch((error) => {
                            setModalHeader('We\'re sorry !');
                            setModalBody(JSON.stringify(error));
                            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                            setShowModal(true);
                        });
                }
            }
        } catch (error) {
            setModalHeader('We\'re sorry !');
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const _handleViews = async () => {
        try {
            if (_.isUndefined(_.find(_.get(_article, '_article_views'), { _viewer: _fingerprint }))) {
                return await axios.patch(`/api/article/${_article._id}/_view`, {
                    ..._article,
                    _article_views: [
                        ..._article._article_views,
                        {
                            _viewer: _fingerprint,
                        }
                    ]
                })
                    .then((res) => {
                        _getPost();
                        _socket.emit('action', { type: '_articleViewed', data: res.data._article });
                    })
                    .catch((error) => {
                        setModalHeader('We\'re sorry !');
                        setModalBody(JSON.stringify(error));
                        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                        setShowModal(true);
                    });
            } else {
                return await axios.patch(`/api/article/${_article._id}/_view`, {
                    ..._article,
                    _article_views: _.map(_article._article_views, (_v) => { return _v._viewer !== _fingerprint ? _v : { ..._v, _updatedAt: new Date().toISOString() } })
                })
                    .then((res) => {
                        _getPost();
                        _socket.emit('action', { type: '_articleReviewed', data: res.data._article });
                    })
                    .catch((error) => {
                        // Sometimes it says that _article._article_views is not iterable !
                        // Always when opening a post from a link, cause at the refresh it works fine
                        setModalHeader('We\'re sorry !');
                        setModalBody(JSON.stringify(error));
                        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                        setShowModal(true);
                    });
            }
        } catch (error) {
            setModalHeader('We\'re sorry !');
            console.log(error);
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const _handleEdit = (_arCo) => {
        setValue('_parentId', _arCo._parentId);
        setValue('_author', _arCo._author);
        setValue('_email', _arCo._email);
        setValue('_body', _arCo._body);
        setValue('_isPrivate', _arCo._isPrivate);
        setValue('_fingerprint', _arCo._fingerprint);
        setValue('_upvotes', _arCo._upvotes);
        setValue('_downvotes', _arCo._downvotes);

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
            _parentId: null,
            _author: '',
            _email: '',
            _body: '',
            _isPrivate: false,
            _fingerprint: '',
            _upvotes: [],
            _downvotes: []
        });

        // Clearing the _articleToEdit state is going to fuck this shit up
        clearArticleToEdit();
    };

    const onSubmit = async (values) => {
        _.isEmpty(values._fingerprint) && (values._fingerprint = _fingerprint);

        try {
            if (_.isEmpty(_articleToEdit)) {
                return axios.patch(`/api/article/${_article._id}/_comment`, {
                    ..._article,
                    _article_comments: [
                        ..._article._article_comments,
                        values
                    ]
                })
                    .then((res) => {
                        _getPost();
                        _socket.emit('action', { type: '_commentCreated', data: res.data._aComment });
                    })
                    .then(() => {
                        reset({
                            _parentId: null,
                            _author: '',
                            _email: '',
                            _body: '',
                            _isPrivate: false,
                            _fingerprint: '',
                            _upvotes: [],
                            _downvotes: []
                        });
                    })
                    .catch((error) => {
                        setModalHeader('We\'re sorry !');
                        setModalBody(JSON.stringify(error));
                        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                        setShowModal(true);
                    });
            } else {
                return axios.patch(`/api/article/${_article._id}/_comment`, {
                    ..._article,
                    _article_comments: _.map(_article._article_comments, (_articleComment) => { return _articleComment._id !== _articleToEdit._id ? _articleComment : { ..._articleComment, ...values, _updatedAt: new Date().toISOString() } })
                })
                    .then((res) => {
                        _getPost();
                        _socket.emit('action', { type: '_commentUpdated', data: res.data._article });
                    })
                    .then(() => {
                        reset({
                            _parentId: null,
                            _author: '',
                            _email: '',
                            _body: '',
                            _isPrivate: false,
                            _fingerprint: '',
                            _upvotes: [],
                            _downvotes: []
                        });

                        // Clear the _articleToEdit state
                        clearArticleToEdit();
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
        _getPost();

        const handleBeforeUnload = () => {
            clearArticleToEdit();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        const _handlePromise = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 2000));

                if (_fingerprint) {
                    _handleViews();
                    setIsFingerprintLoaded(true);
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        _handlePromise();

        const subscription = watch((value, { name, type }) => { });
        return () => {
            subscription.unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [_fingerprint, _getPost, watch]);

    return (
        <main className='_post'>
            <section className='_s1'>
                <Breadcrumb>
                    <Breadcrumb.Item href='/'>
                        <FontAwesomeIcon icon={faHouse} />
                        <span className='w-100 g-col-11'>
                            <p>Home<b className='pink_dot'>.</b></p>
                        </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item href='/blog'>
                        <FontAwesomeIcon icon={faNewspaper} />
                        <span className='w-100 g-col-11'>
                            <p>Blog<b className='pink_dot'>.</b></p>
                        </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>
                        {_article._article_title}
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className='_postBox d-flex flex-column justify-content-center align-items-end'>
                    <h1 className='_title'>{_article._article_title}</h1>
                    <p className='text-muted _author'><b>{_.capitalize(_article._article_author)}</b>, {<Moment local fromNow>{_article.updatedAt}</Moment>}</p>
                    <div className='text-muted _body' dangerouslySetInnerHTML={{ __html: _article._article_body }}></div>
                    <div className='_vcuds d-flex'>
                        <div className='text-muted d-flex align-items-center views'>
                            <p>{_.size(_article._article_views)}</p>
                            <FontAwesomeIcon icon={faEye} />
                        </div>
                        <div className='text-muted d-flex align-items-center comments'>
                            <p>{_.size(_article._article_comments)}</p>
                            <Button
                                type='button'
                                className='border border-0 rounded-0'
                                onClick={() => document.getElementById('_s2').scrollIntoView({ behavior: 'smooth' })}
                            >
                                <FontAwesomeIcon icon={faComment} />
                            </Button>
                        </div>
                        <div className={`text-muted d-flex align-items-center upvotes ${!_.some(_article._article_upvotes, { _upvoter: _fingerprint }) ? '' : 'active'}`}>
                            <p>{_.size(_article._article_upvotes)}</p>
                            <Button
                                type='button'
                                className='border border-0 rounded-0'
                                onClick={() => _handleVotes(_article, 'up')}
                            >
                                <FontAwesomeIcon icon={faThumbsUp} />
                            </Button>
                        </div>
                        <div className={`text-muted d-flex align-items-center downvotes ${!_.some(_article._article_downvotes, { _downvoter: _fingerprint }) ? '' : 'active'}`}>
                            <p>{_.size(_article._article_downvotes)}</p>
                            <Button
                                type='button'
                                className='border border-0 rounded-0'
                                onClick={() => _handleVotes(_article, 'down')}
                            >
                                <FontAwesomeIcon icon={faThumbsDown} />
                            </Button>
                        </div>
                        <div className='text-muted d-flex align-items-center share'>
                            {/* <button data-toggle='modal' data-target='#shareModal'>
                                <i className='fas fa-share'></i>
                            </button> */}
                            <Button
                                type='button'
                                className='border border-0 rounded-0'
                            >
                                <FontAwesomeIcon icon={faShare} />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='_PrevNext d-flex justify-content-between align-items-center'>
                    <a
                        href={_.get(
                            _.orderBy(_articles, ['_article_views'], ['desc']),
                            [_.indexOf(_.orderBy(_articles, ['_article_views'], ['desc']), _.find(_articles, { '_id': _article._id })) - 1, '_id'],
                            _.get(_.last(_.orderBy(_articles, ['_article_views'], ['desc'])), '_id')
                        )}
                        className='_prevArticle'
                    >
                        {_.get(
                            _.orderBy(_articles, ['_article_views'], ['desc']),
                            [_.indexOf(_.orderBy(_articles, ['_article_views'], ['desc']), _.find(_articles, { '_id': _article._id })) - 1, '_article_title'],
                            _.get(_.last(_.orderBy(_articles, ['_article_views'], ['desc'])), '_article_title')
                        )}<b className='pink_dot'>.</b>
                    </a>
                    <a
                        href={_.get(
                            _.orderBy(_articles, ['_article_views'], ['desc']),
                            [_.indexOf(_.orderBy(_articles, ['_article_views'], ['desc']), _.find(_articles, { '_id': _article._id })) + 1, '_id'],
                            _.get(_.last(_.orderBy(_articles, ['_article_views'], ['desc'])), '_id')
                        )}
                        className='_nextArticle'
                    >
                        {_.get(
                            _.orderBy(_articles, ['_article_views'], ['desc']),
                            [_.indexOf(_.orderBy(_articles, ['_article_views'], ['desc']), _.find(_articles, { '_id': _article._id })) + 1, '_article_title'],
                            _.get(_.head(_.orderBy(_articles, ['_article_views'], ['desc'])), '_article_title')
                        )}<b className='pink_dot'>.</b>
                    </a>
                </div>
            </section>
            <section className='_s2 grid' id='_s2'>
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
                                        controlId='_author'
                                        className={`_formGroup ${_authorFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Name.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_author', {
                                                    required: 'Must be 3 to 30 long.',
                                                    pattern: {
                                                        value: /^[a-zA-Z\s]{2,30}$/,
                                                        message: 'No numbers or symbols.'
                                                    },
                                                    onBlur: () => { setAuthorFocused(false) }
                                                })}
                                                placeholder='Name.'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._author ? 'border-danger' : ''}`}
                                                name='_author'
                                                onFocus={() => { setAuthorFocused(true) }}
                                            />
                                            {
                                                errors._author && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_author')) ? '' : 'toClear'}`}>
                                                        {errors._author.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                !_.isEmpty(watch('_author')) && (
                                                    <div className='_formClear'
                                                        onClick={() => {
                                                            reset({
                                                                _author: ''
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
                                        controlId='_email'
                                        className={`_formGroup ${_emailFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Email.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_email', {
                                                    required: 'Email missing.',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                                        message: 'Email invalid.'
                                                    },
                                                    onBlur: () => { setEmailFocused(false) }
                                                })}
                                                placeholder='Email.'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._email ? 'border-danger' : ''}`}
                                                name='_email'
                                                onFocus={() => setEmailFocused(true)}
                                            />
                                            {
                                                errors._email && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_email')) ? '' : 'toClear'}`}>
                                                        {errors._email.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                !_.isEmpty(watch('_email')) && (
                                                    <div className='_formClear'
                                                        onClick={() => {
                                                            reset({
                                                                _email: ''
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
                                        controlId='_body'
                                        className={`_formGroup ${_bodyFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Message.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_body', {
                                                    required: 'Please provide a message.',
                                                    onBlur: () => { setBodyFocused(false) }
                                                })}
                                                placeholder='Message.'
                                                as='textarea'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._body ? 'border-danger' : ''}`}
                                                name='_body'
                                                onFocus={() => { setBodyFocused(true) }}
                                            />
                                            {
                                                errors._body && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 messageClear`}>
                                                        {errors._body.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                !_.isEmpty(watch('_body')) && (
                                                    <div className='_formClear _messageInput'
                                                        onClick={() => {
                                                            reset({
                                                                _body: ''
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
                                        controlId='_isPrivate'
                                        className='_checkGroup _formGroup'
                                    >
                                        <FloatingLabel
                                            label='Private Message ?'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Check
                                                type='switch'
                                                className='_formSwitch'
                                                name='_isPrivate'
                                                {...register('_isPrivate', {})}
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
                                            {!_.isEmpty(_articleToEdit) ? 'Update' : 'Submit'}<b className='pink_dot'>.</b>
                                        </span>
                                    </Button>
                                </Row>
                                <Row className='g-col-12'>
                                    {
                                        //Upon click it just disapears or appears too fast
                                        (!_.isEmpty(_articleToEdit) || watch('_parentId') !== null) && (
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
                            _.map(_.chain(_.filter(_article._article_comments, (_aC) => { return !_aC._isPrivate && _aC._parentId === null }))
                                .sortBy([
                                    // Sort by upvotes count in descending order
                                    // This fires an error upon creating a new article
                                    (_aComment) => -_.size(_aComment._upvotes),
                                    // Sort by Article with the most Replies
                                    (_aComment) => -_.size(_.filter(_article._article_comments, ['_parentId', _aComment._id])),
                                    // Sort by creation date in descending order
                                    '_createdAt',
                                    // Sort by update date in descending order
                                    '_updatedAt'
                                ])
                                .value(), (_aComment, index) => {
                                    const _aCommentId = `_aComment_${index}`;

                                    return (
                                        <Card className={`border border-0 rounded-0 card_${_aCommentId}`} key={_aCommentId}>
                                            <Card.Body className='d-flex flex-column'>
                                                <div className='_topRow d-flex'>
                                                    <p className='text-muted author'><b>{_.capitalize(_aComment._author)}</b>, {<Moment local fromNow>{_aComment.updatedAt}</Moment>}</p>
                                                    <div className='interactions ms-auto d-flex'>
                                                        <div className='text-muted d-flex align-items-center replies'>
                                                            <p>{_.size(_.filter(_article._article_comments, { '_parentId': _aComment._id }))}</p>
                                                            <Button
                                                                type='button'
                                                                className='border border-0 rounded-0'
                                                                onClick={() => _handleEdit(_aComment)}
                                                            >
                                                                <FontAwesomeIcon icon={faReplyAll} />
                                                            </Button>
                                                        </div>
                                                        <div className={`text-muted d-flex align-items-center upvotes ${!_.some(_.get(_aComment, '_upvotes'), { _upvoter: _fingerprint }) ? '' : 'active'}`}>
                                                            <p>{_.size(_.get(_aComment, '_upvotes'))}</p>
                                                            <Button
                                                                type='button'
                                                                className='border border-0 rounded-0'
                                                                /* Clicking on this is not going to do anything cause the handleVotes,
                                                                handles the _article_upvotes, not the comment's _*upvotes*/
                                                                onClick={() => _handleCommentsVotes(_aComment, 'up')}
                                                            >
                                                                <FontAwesomeIcon icon={faThumbsUp} />
                                                            </Button>
                                                        </div>
                                                        <div className={`text-muted d-flex align-items-center downvotes ${!_.some(_.get(_aComment, '_downvotes'), { _downvoter: _fingerprint }) ? '' : 'active'}`}>
                                                            <p>{_.size(_.get(_aComment, '_downvotes'))}</p>
                                                            <Button
                                                                type='button'
                                                                className='border border-0 rounded-0'
                                                                onClick={() => _handleCommentsVotes(_aComment, 'down')}
                                                            >
                                                                <FontAwesomeIcon icon={faThumbsDown} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='_middleRow'>
                                                    <h4>{_.capitalize(_aComment._body)}</h4>
                                                </div>
                                                <div className='_bottomRow d-flex justify-content-end'>
                                                    <Dropdown
                                                        key={_aCommentId}
                                                        show={_showReplyDropdown[_aCommentId]}
                                                        onMouseEnter={() => { _handleMouseEnter(_aCommentId); }}
                                                        onMouseLeave={() => { _handleMouseLeave(_aCommentId); }}
                                                    >
                                                        <Dropdown.Toggle as='span'>
                                                            <span className='d-flex align-items-center justify-content-center'>
                                                                <FontAwesomeIcon icon={faEllipsisV} />
                                                            </span>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu className='border rounded-0'>
                                                            <Form className='d-flex flex-column'>
                                                                <Dropdown.Item
                                                                    onClick={() => _handleReply(_aComment._id)}
                                                                >
                                                                    Reply<b className='pink_dot'>.</b>
                                                                </Dropdown.Item>
                                                                {
                                                                    _aComment._fingerprint === _fingerprint && (
                                                                        <>
                                                                            <Dropdown.Item
                                                                                onClick={() => _handleEdit(_aComment)}
                                                                            >
                                                                                Edit<b className='pink_dot'>.</b>
                                                                            </Dropdown.Item>
                                                                            <Dropdown.Divider />
                                                                            <Dropdown.Item
                                                                                onClick={() => _handleDelete(_aComment._id)}
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
                                                    _.map(_.chain(_.filter(_article._article_comments, (_aC) => { return !_aC._isPrivate && _aC._parentId === _aComment._id }))
                                                        .sortBy([
                                                            // Sort by upvotes count in descending order
                                                            // This fires an error upon creating a new article
                                                            (_aC) => -_.size(_aC._upvotes),
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
                                                                            <p className='text-muted author'><b>{_.capitalize(_reply._author)}</b>, {<Moment local fromNow>{_reply.updatedAt}</Moment>}</p>
                                                                            <div className='interactions ms-auto d-flex'>
                                                                                <div className={`text-muted d-flex align-items-center upvotes ${!_.some(_.get(_reply, '_upvotes'), { _upvoter: _fingerprint }) ? '' : 'active'}`}>
                                                                                    <p>{_.size(_.get(_reply, '_upvotes'))}</p>
                                                                                    <Button
                                                                                        type='button'
                                                                                        className='border border-0 rounded-0'
                                                                                        onClick={() => _handleCommentsVotes(_reply, 'up')}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faThumbsUp} />
                                                                                    </Button>
                                                                                </div>
                                                                                <div className={`text-muted d-flex align-items-center downvotes ${!_.some(_.get(_reply, '_downvotes'), { _downvoter: _fingerprint }) ? '' : 'active'}`}>
                                                                                    <p>{_.size(_.get(_reply, '_downvotes'))}</p>
                                                                                    <Button
                                                                                        type='button'
                                                                                        className='border border-0 rounded-0'
                                                                                        onClick={() => _handleCommentsVotes(_reply, 'down')}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faThumbsDown} />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className='_middleRow'>
                                                                            <h4>{_.capitalize(_reply._body)}</h4>
                                                                        </div>
                                                                        <div className='_bottomRow d-flex justify-content-end'>
                                                                            {
                                                                                _reply._fingerprint === _fingerprint && (
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
            </section>

            <Modal show={_showModal} onHide={() => setShowModal(false)} centered>
                <Form>
                    <Modal.Header closeButton>
                        <Modal.Title>{_modalHeader}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='text-muted'><pre>{_modalBody}</pre></Modal.Body>
                    <Modal.Footer>
                        {_modalIcon}
                        <Button
                            type='button'
                            className='border border-0 rounded-0 inverse w-50'
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

export default Post;