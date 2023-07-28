import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Link
} from 'react-router-dom';
import { _useStore } from '../../store/store';
import axios from 'axios';
import Moment from 'react-moment';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faCircleDot, faIcons } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faObjectGroup, faRectangleXmark, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import { faJs } from '@fortawesome/free-brands-svg-icons'
import _ from 'lodash';
import $ from 'jquery';

const Home = (props) => {
    const _articles = _useStore((state) => state._articles);
    const setArticles = _useStore((state) => state.setArticles);
    const _projects = _useStore((state) => state._projects);
    const setProjects = _useStore((state) => state.setProjects);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setFocus,
        formState: { errors }
    } = useForm({
        mode: 'onTouched',
        reValidateMode: 'onChange',
        reValidateMode: 'onSubmit',
        defaultValues: {
            _name: '',
            _phone: '',
            _emailSender: '',
            _message: '',
            _newsletter: false
        }
    });

    const [_userNameFocused, setUserNameFocused] = useState(false);
    const [_userPhoneFocused, setUserPhoneFocused] = useState(false);
    const [_userEmailFocused, setUserEmailFocused] = useState(false);
    const [_userMessageFocused, setUserMessageFocused] = useState(false);

    const [_showModal, setShowModal] = useState(false);
    const [_modalHeader, setModalHeader] = useState('');
    const [_modalBody, setModalBody] = useState('');
    const [_modalIcon, setModalIcon] = useState('');

    const _sliderProjectsSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        arrows: false,
        onInit: () => {
            $('._sliderProjects ._shadowIndex p').html('01');
        },
        beforeChange: (current, next) => {
            next < 9
                ? $('._sliderProjects ._shadowIndex p').html('0' + (next + 1))
                : $('._sliderProjects ._shadowIndex p').html('' + (next + 1));
        }
    };

    const _sliderArticlesSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        arrows: false,
        onInit: () => {
            _handleArticleJSONTOHTML(0);
        },
        beforeChange: (current, next) => {
            _handleArticleJSONTOHTML(next);
        }
    };

    const _getArticles = useCallback(
        async () => {
            try {
                axios('/api/article')
                    .then((response) => {
                        setArticles(response.data._articles);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setArticles]
    );

    const _getProjects = useCallback(
        async () => {
            try {
                axios('/api/project')
                    .then((response) => {
                        setProjects(response.data._projects);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setProjects]
    );

    const _handleAlphabet = useCallback(
        async () => {
            let doc = document,
                docElem = doc.documentElement;
            let gridWidth;
            let gridHeight;
            let letterWidth = _.round(docElem.clientWidth / _.round(docElem.clientWidth / 30)); // @todo: make this dynamic
            let letterHeight = _.round(docElem.clientWidth / _.round(docElem.clientWidth / 30)); // @todo: make this dynamic
            let totalLetters;
            let letterArray = [];
            let currentLetters = 0;

            let charCodeRange = {
                start: 48,
                end: 49
            };

            // get the grid's width and height

            const getDimensions = () => {
                gridWidth = docElem.clientWidth;
                gridHeight = docElem.clientHeight;
            }

            // get the total possible letters needed to fill the grid
            // and store that in totalLetters

            const getTotalLetters = () => {
                let multiplierX = Math.round(gridWidth / letterWidth);
                let multiplierY = Math.round(gridHeight / letterHeight);
                totalLetters = Math.round(multiplierX * multiplierY);
            }

            // loop through the unicode values and push each character into letterArray

            const populateLetters = () => {
                for (let i = charCodeRange.start; i <= charCodeRange.end; i++) {
                    letterArray.push(String.fromCharCode(i));
                }
            }

            // a function to loop a given number of times (value), each time
            // appending a letter from the letter array to the grid

            const drawLetters = (value) => {
                let text;
                let span;
                let count = 0;

                for (let letter = 0; letter <= value; letter++) {
                    text = document.createTextNode(letterArray[count]);
                    span = document.createElement('span');
                    span.appendChild(text);
                    $('.letter-grid').append(span);
                    count++;

                    // if our count equals the length of our letter array, then that
                    // means we've reached the end of the array (Z), so we set count to 
                    // zero again in order to start from the beginning of the array (A).
                    // we keep looping over the letter array 'value' number of times.

                    if (count === letterArray.length) {
                        count = 0;
                    }

                    // if our for counter let (letter) equals the passed in value argument
                    // then we've finished our loop and we throw a class onto the grid element

                    if (letter === value) {
                        $('.letter-grid').addClass('js-show-letters');
                    }
                }
            }

            // get the length of the grid.find('span') jQuery object
            // essentially the current number of letters in the grid at this point

            const getCurrentLetters = () => {
                currentLetters = $('.letter-grid').find('span').length;
            }

            const init = () => {
                populateLetters();
                getDimensions();
                getTotalLetters();
                drawLetters(totalLetters);
                getCurrentLetters();
            }

            const onResize = () => {
                getDimensions();
                getTotalLetters();
                if (currentLetters < totalLetters) {
                    let difference = totalLetters - currentLetters;
                    drawLetters(difference);
                }
                getCurrentLetters();
            }

            init();

            window.addEventListener('resize', _.debounce(onResize, 100));
        },
        []
    );

    const _handleWords = useCallback(
        async () => {
            setTimeout(() => {
                _.forEach($('svg.word'), (word) => {
                    let svg = $(word);
                    let text = svg.find('text');
                    let bbox = text.get(0).getBBox();

                    svg.get(0).setAttribute('viewBox',
                        [
                            bbox.x,
                            bbox.y,
                            bbox.width,
                            bbox.height
                        ].join(' '));
                });
            }, 100);
        },
        []
    );

    const _handleJSONTOHTML = (_image, index) => {
        const html = $.parseHTML(_image);
        $('._sliderProjects .card_' + index + ' ._projectImage').html(html);
    }

    const _handleArticleJSONTOHTML = (index) => {
        //Cannot read properties of undefined (reading '_article_body')
        //TypeError: Cannot read properties of undefined (reading '_article_body')
        let _i = index + 1;
        const html = $.parseHTML(_.orderBy(_.filter(_articles, (_a) => { return !_a._article_isPrivate }), ['_article_views'], ['desc']).slice(0, 10)[index]._article_body);
        $('._home ._s2 ._figure').html($(html).find('img').first());
        $('._number p').html(_i < 10 ? '0' + _i : '' + _i);
        $('._number p').attr('data-text', _i < 10 ? '0' + _i : '' + _i);
    }

    const onSubmit = async (values) => {
        try {
            return axios.post('/api/user/_sendMessage', values)
                .then((response) => {
                    setModalHeader('Hello ✔ and Welcome !');
                    setModalBody('Hello and welcome our stranger, Thank you for reaching out to us, \nHow about you joins us, not only you can give a feedback, but you can discover much more about our community.');
                    setModalIcon(<FontAwesomeIcon icon={faSquareCheck} />);
                    setShowModal(true);
                })
                .then(() => {
                    reset({
                        _name: '',
                        _phone: '',
                        _emailSender: '',
                        _message: '',
                        _newsletter: false
                    });
                })
                .catch((error) => {
                    setModalHeader('We\'re sorry !');
                    setModalBody('Something wrong in your information has blocked this message from being sent');
                    setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                    setShowModal(true);
                });
        } catch (error) {
            setModalHeader('We\'re sorry !');
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    }

    const onError = (error) => {
        setModalHeader('We\'re sorry !');
        setModalBody('Please check the fields for valid information.');
        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
        setShowModal(true);
    };

    useEffect(() => {
        _getArticles();
        _getProjects();
        _handleAlphabet();
        _handleWords();

        $('._home ._s3').on('mousemove', (event) => {
            let width = $('._home ._s3').width() / 2;
            let height = $('._home ._s3').height() / 2;
            let amountMovedX = ((width - event.pageX) * -1 / 12);
            let amountMovedY = ((height - event.pageY) * -1 / 12);

            $('._home ._s3 ._shadowIndex').css('marginLeft', amountMovedX);
            $('._home ._s3 ._shadowIndex').css('marginTop', amountMovedY);
        });

        $('._home ._s4').on('mousemove', (event) => {
            let width = $('._home ._s4').width() / 2;
            let amountMovedX = ((width - event.pageX) * 1 / 64);

            $('._home ._s4 .before').css('marginLeft', amountMovedX);
        });

        const subscription = watch((value, { name, type }) => { });
        return () => subscription.unsubscribe();
    }, [_getArticles, _getProjects, _handleAlphabet, _handleWords, watch]);

    return (
        <main className='_home'>
            <section className='_s1 grid'>
                <div className='Hello'>
                    <svg className='word w1'>
                        <text>مرحبا</text>
                    </svg>
                    <svg className='word w2'>
                        <text>Welcome</text>
                    </svg>
                    <svg className='word w3'>
                        <text>Bienvenue</text>
                    </svg>
                    <svg className='word w4'>
                        <text>Chào mừng</text>
                    </svg>
                    <svg className='word w5'>
                        <text>Bienvenido</text>
                    </svg>
                </div>
                <div className='g-col-7 align-self-end'>
                    <Form className='d-flex flex-column'>
                        <div className='name'>
                            <p>ZAKARIAE</p><p>BOUTALEB</p>
                        </div>
                        <div>
                            <p>A Full-Stack Developer & a Graphic Designer<b className='pink_dot'>.</b></p>
                            <p>Based in <b className='web'>Morocco<b className='pink_dot'>.</b></b></p>
                        </div>
                        <Button
                            type='button'
                            className='border border-0 rounded-0 inverse w-25'
                            variant='outline-light'
                            onClick={() => { $([document.documentElement, document.body]).animate({ scrollTop: $('._s4').offset().top }, 0); setFocus('_name'); }}
                        >
                            <div className='buttonBorders'>
                                <div className='borderTop'></div>
                                <div className='borderRight'></div>
                                <div className='borderBottom'></div>
                                <div className='borderLeft'></div>
                            </div>
                            <span>
                                Reach Out<b className='pink_dot'>.</b>
                            </span>
                        </Button>
                    </Form>
                </div>
                <div className='g-col-5 align-self-center'>
                    <div className='_sliderProjects'>
                        <div className='_title'>
                            <p>Some of My Projects.</p>
                        </div>
                        <Slider {..._sliderProjectsSettings}>
                            {
                                _.map((_.orderBy(_.filter(_projects, (_p) => { return !_p._article_isPrivate }), ['_project_view'], ['desc']).slice(0, 10)), (_project, index) => {
                                    return (
                                        <Card className={`border border-0 rounded-0 card_${index}`} key={index}>
                                            <Card.Body>
                                                <Link
                                                    to={_project._project_link}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                >
                                                    <div className='_projectImage'>
                                                        {_handleJSONTOHTML(_project._project_image, index)}
                                                    </div>
                                                </Link>
                                                <p className='text-muted author'>by <b>{_project._project_author}</b>, {<Moment local fromNow>{_project.updatedAt}</Moment>}</p>
                                            </Card.Body>
                                        </Card>
                                    )
                                })
                            }
                        </Slider>
                        <div className='_shadowIndex d-flex'><p></p><b className='pink_dot'>.</b></div>
                        <div className='_dotsPattern'></div>
                    </div>
                </div>
            </section>
            <section className='_s2 grid'>
                <div className='g-col-5'>
                    <figure className='_figure'></figure>
                </div>
                <div className='g-col-7 align-self-end'>
                    <div className='_sliderArticles'>
                        <Slider {..._sliderArticlesSettings}>
                            {
                                _.map(_.orderBy(_.filter(_articles, (_a) => { return !_a._article_isPrivate }), ['_article_views'], ['desc']).slice(0, 10), (_article, index) => {
                                    return (
                                        <Card className={`border border-0 rounded-0 card_${index}`} key={index}>
                                            <div className='borderTop'></div>
                                            <div className='borderRight'></div>
                                            <div className='borderBottom'></div>
                                            <div className='borderLeft'></div>
                                            <Card.Body className='no-shadow'>
                                                <Form className='d-flex flex-column'>
                                                    <span className='text-muted category_author mb-auto'>{_article._article_category}</span>
                                                    {/* Modify the bodies in mongodb, those articles aren't kinda fit to have an intriguing first phrase */}
                                                    {/* And figure out either; get the first paragraphe, and modify the articles to fit into that, or get the first phrases just enough to fill 3 lines */}
                                                    <span className='firstPhrase'>{_.slice(_.split(_.trim($(_article._article_body).find('span').text()), /\./g), 0, 1)}</span>
                                                    <h2 className='align-self-start'>{_article._article_title}<br />by <span>{_article._article_author}</span></h2>
                                                    <Button
                                                        type='button'
                                                        className='border border-0 rounded-0 inverse w-25 align-self-end'
                                                        variant='outline-light'
                                                        href={`/blog/${_article._id}`}
                                                    >
                                                        <div className='buttonBorders'>
                                                            <div className='borderTop'></div>
                                                            <div className='borderRight'></div>
                                                            <div className='borderBottom'></div>
                                                            <div className='borderLeft'></div>
                                                        </div>
                                                        <span>
                                                            Read More About it<b className='pink_dot'>.</b>
                                                        </span>
                                                    </Button>
                                                    <span className='text-muted information align-self-end'><b>{_.size(_article._article_views)}</b> Views <FontAwesomeIcon icon={faCircleDot} />, {<Moment local fromNow>{_article.updatedAt}</Moment>}</span>
                                                    <div className='_shadowIndex'><p>{_.head(_article._article_title.split(/[\s.]+/)).length <= 2 ? _.head(_article._article_title.split(/[\s.]+/)) + ' ' + _.nth(_article._article_title.split(/[\s.]+/), 1) : _.head(_article._article_title.split(/[\s.]+/))}<b className='pink_dot'>.</b></p></div>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    )
                                })
                            }
                        </Slider>
                        <div className='_shadowIndex _number d-flex' data-text=''><p></p><b className='pink_dot'>.</b></div>
                        <div className='_shadowIndex _number d-flex _outlined' data-text=''><p></p><b className='pink_dot'>.</b></div>
                    </div>
                </div>
            </section>
            <section className='_s3 grid'>
                <Card className='border border-0 rounded-0'>
                    <Card.Body className='grid'>
                        <div className='g-col-4 d-flex flex-column'>
                            <div className='_head d-flex flex-column align-items-center'>
                                <FontAwesomeIcon icon={faJs} />
                                <h5>Full-Stack Developer<b className='pink_dot'>.</b></h5>
                            </div>
                            <div className='_content d-flex flex-column align-items-center'>
                                <h6>Languages I am Fluent At</h6>
                                <ul className='text-muted tags d-flex flex-wrap'>
                                    <li className='tag_item'>Socket.io</li>
                                    <li className='tag_item'>JQuery</li>
                                    <li className='tag_item'>Sass</li>
                                    <li className='tag_item'>Css</li>
                                    <li className='tag_item'>Css Grid</li>
                                    <li className='tag_item'>HTML</li>
                                    <li className='tag_item'>ReactJS</li>
                                    <li className='tag_item'>JSON</li>
                                    <li className='tag_item'>NoSQL</li>
                                    <li className='tag_item'>JavaScript</li>
                                    <li className='tag_item'>NPM</li>
                                    <li className='tag_item'>Yarn</li>
                                    <li className='tag_item'>NodeJS</li>
                                    <li className='tag_item'>React Native</li>
                                </ul>
                                <h6>Tools I Use</h6>
                                <ul className='text-muted tags d-flex flex-wrap'>
                                    <li className='tag_item'>Bootstrap</li>
                                    <li className='tag_item'>Css Grid</li>
                                    <li className='tag_item'>Illustrator</li>
                                    <li className='tag_item'>Photohsop</li>
                                    <li className='tag_item'>Pen & Paper</li>
                                    <li className='tag_item'>Visual Studio Code</li>
                                    <li className='tag_item'>Git</li>
                                </ul>
                            </div>
                        </div>
                        <div className='g-col-4 d-flex flex-column'>
                            <div className='_head d-flex flex-column align-items-center'>
                                <FontAwesomeIcon icon={faIcons} />
                            </div>
                            <div className='_content d-flex flex-column align-items-center justify-content-center'>
                                <div className='_vector'></div>
                            </div>
                        </div>
                        <div className='g-col-4 d-flex flex-column'>
                            <div className='_head d-flex flex-column align-items-center'>
                                <FontAwesomeIcon icon={faObjectGroup} />
                                <h5>Graphic Designer<b className='pink_dot'>.</b></h5>
                            </div>
                            <div className='_content d-flex flex-column align-items-center'>
                                <h6>What I Make</h6>
                                <ul className='text-muted tags d-flex flex-wrap'>
                                    <li className='tag_item'>Art direction</li>
                                    <li className='tag_item'>Branding</li>
                                    <li className='tag_item'>Branding Identity</li>
                                    <li className='tag_item'>Illustration</li>
                                    <li className='tag_item'>Interface Design</li>
                                    <li className='tag_item'>Product Design</li>
                                    <li className='tag_item'>Strategy</li>
                                    <li className='tag_item'>Web Design</li>
                                    <li className='tag_item'>UI</li>
                                    <li className='tag_item'>UX</li>
                                </ul>
                                <h6>Tools I Use</h6>
                                <ul className='text-muted tags d-flex flex-wrap'>
                                    <li className='tag_item'>Adobe Photoshop</li>
                                    <li className='tag_item'>Adobe Illustrator</li>
                                    <li className='tag_item'>Sketch</li>
                                </ul>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <div className='_shadowIndex'><p>skills<b className='pink_dot'>.</b></p></div>
            </section>
            <section className='_s4 grid'>
                <div className='letter-grid d-flex justify-content-center flex-wrap text-center'></div>
                <div className='g-col-12'>
                    <div className='before'></div>
                </div>
                <div className='g-col-12 grid'>
                    <div className='g-col-4 d-flex flex-column justify-content-center align-items-center'>
                        <div className='text-center'>
                            <h5>Other ways to get in touch</h5>
                        </div>
                        <div className='grid align-items-start'>
                            <FontAwesomeIcon icon={faLocationDot} />
                            <span className='w-100 g-col-11'>
                                <p>Maroc</p>
                                <p>Meknès,</p>
                                <p>Av Marjane 1.</p>
                            </span>
                        </div>
                        <div className='grid align-items-start'>
                            <FontAwesomeIcon icon={faPhone} />
                            <span className='w-100 g-col-11'>
                                <p>(+212) 6 54 52 84 92</p>
                            </span>
                        </div>
                        <div className='grid align-items-start'>
                            <FontAwesomeIcon icon={faEnvelope} />
                            <span className='w-100 g-col-11'>
                                <p>contact@boutaleb.dev</p>
                            </span>
                        </div>
                    </div>
                    <div className='g-col-8'>
                        <Form onSubmit={handleSubmit(onSubmit, onError)} className='grid'>
                            <Row className='g-col-12 grid'>
                                <Col className='g-col-6'>
                                    <Form.Group
                                        controlId='_name'
                                        className={`_formGroup ${_userNameFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Name.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_name', {
                                                    required: 'Must be at least 2 characters.',
                                                    pattern: {
                                                        value: /^[a-zA-Z\s]{2,}$/i,
                                                        message: 'No numbers or symbols.'
                                                    },
                                                    onBlur: () => { setUserNameFocused(false) }
                                                })}
                                                placeholder='Name.'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._name ? 'border-danger' : ''}`}
                                                name='_name'
                                                onFocus={() => { setUserNameFocused(true) }}
                                            />
                                            {
                                                errors._name && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_name')) ? '' : 'toClear'}`}>
                                                        {errors._name.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                !_.isEmpty(watch('_name')) && (
                                                    <div className='_formClear'
                                                        onClick={() => {
                                                            reset({
                                                                _name: ''
                                                            });
                                                        }}
                                                    ></div>
                                                )
                                            }
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                                <Col className='g-col-6'>
                                    <Form.Group
                                        controlId='_phone'
                                        className={`_formGroup ${_userPhoneFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Phone.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_phone', {
                                                    required: 'Phone number missing.',
                                                    pattern: {
                                                        value: /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
                                                        message: 'Phone number invalid.'
                                                    },
                                                    onBlur: () => { setUserPhoneFocused(false) }
                                                })}
                                                placeholder='Phone.'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._phone ? 'border-danger' : ''}`}
                                                name='_phone'
                                                onFocus={() => { setUserPhoneFocused(true) }}
                                            />
                                            {
                                                errors._phone && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_phone')) ? '' : 'toClear'}`}>
                                                        {errors._phone.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                !_.isEmpty(watch('_phone')) && (
                                                    <div className='_formClear'
                                                        onClick={() => {
                                                            reset({
                                                                _phone: ''
                                                            });
                                                        }}
                                                    ></div>
                                                )
                                            }
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='g-col-12 grid'>
                                <Col className='g-col-6'>
                                    <Form.Group
                                        controlId='_emailSender'
                                        className={`_formGroup ${_userEmailFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Email.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_emailSender', {
                                                    required: 'Email missing.',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                                        message: 'Email invalid.'
                                                    },
                                                    onBlur: () => { setUserEmailFocused(false) }
                                                })}
                                                placeholder='Email.'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._emailSender ? 'border-danger' : ''}`}
                                                name='_emailSender'
                                                onFocus={() => { setUserEmailFocused(true) }}
                                            />
                                            {
                                                errors._emailSender && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_emailSender')) ? '' : 'toClear'}`}>
                                                        {errors._emailSender.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                !_.isEmpty(watch('_emailSender')) && (
                                                    <div className='_formClear'
                                                        onClick={() => {
                                                            reset({
                                                                _emailSender: ''
                                                            });
                                                        }}
                                                    ></div>
                                                )
                                            }
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                                <Col className='g-col-6'>
                                    <Form.Group
                                        controlId='_userNewsletterInput'
                                        className='_checkGroup _formGroup'
                                    >
                                        <FloatingLabel
                                            label='Subscribe to receive our newsletter.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Check
                                                type='switch'
                                                className='_formSwitch'
                                                name='_userNewsletterInput'
                                                {...register('_userNewsletterInput', {})}
                                            />
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='g-col-12 grid'>
                                <Col className='g-col-12'>
                                    <Form.Group
                                        controlId='_userMessageInput'
                                        className={`_formGroup ${_userMessageFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Message.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_userMessageInput', {
                                                    required: 'Please provide a message.',
                                                    onBlur: () => { setUserMessageFocused(false) }
                                                })}
                                                placeholder='Message.'
                                                as='textarea'
                                                autoComplete='new-password'
                                                type='text'
                                                className={`_formControl border rounded-0 ${errors._userMessageInput ? 'border-danger' : ''}`}
                                                name='_userMessageInput'
                                                onFocus={() => { setUserMessageFocused(true) }}
                                            />
                                            {
                                                errors._userMessageInput && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 messageClear`}>
                                                        {errors._userMessageInput.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                !_.isEmpty(watch('_userMessageInput')) && (
                                                    <div className='_formClear _messageInput'
                                                        onClick={() => {
                                                            reset({
                                                                _userMessageInput: ''
                                                            });
                                                        }}
                                                    ></div>
                                                )
                                            }
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='g-col-12 d-flex justify-content-end'>
                                <Button
                                    type='submit'
                                    className='border border-0 rounded-0 inverse w-25'
                                    variant='outline-light'
                                >
                                    <div className='buttonBorders'>
                                        <div className='borderTop'></div>
                                        <div className='borderRight'></div>
                                        <div className='borderBottom'></div>
                                        <div className='borderLeft'></div>
                                    </div>
                                    <span>
                                        Send Message<b className='pink_dot'>.</b>
                                    </span>
                                </Button>
                            </Row>
                        </Form>
                    </div>
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
}

export default Home;