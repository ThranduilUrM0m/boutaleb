import React, { useCallback, useEffect, useState } from 'react';
import {
    Link
} from 'react-router-dom';
import { _useStore } from '../../store/store';
import axios from 'axios';
import moment from 'moment';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Slider from 'react-slick';
import Modal from 'react-bootstrap/Modal';
import API from '../../utils/API';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faLeftLong, faRightLong, faCircleDot, faIcons } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faObjectGroup, faRectangleXmark, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import { faJs } from '@fortawesome/free-brands-svg-icons'
import _ from 'lodash';
import $ from 'jquery';
import { io } from "socket.io-client";

const _socketURL = _.isEqual(process.env.NODE_ENV, 'production')
    ? window.location.hostname
    : 'localhost:8800';
const _socket = io(_socketURL, { 'transports': ['websocket', 'polling'] });

const Home = (props) => {
    const _articles = _useStore((state) => state._articles);
    const setArticles = _useStore((state) => state.setArticles);
    const _projects = _useStore((state) => state._projects);
    const setProjects = _useStore((state) => state.setProjects);

    const [_userNameValue, setUserNameValue] = useState('');
    const [_userNameFocused, setUserNameFocused] = useState(false);
    const [_userPhoneValue, setUserPhoneValue] = useState('');
    const [_userPhoneFocused, setUserPhoneFocused] = useState(false);
    const [_userEmailValue, setUserEmailValue] = useState('');
    const [_userEmailFocused, setUserEmailFocused] = useState(false);
    const [_userNewsletterValue, setUserNewsletterValue] = useState('');
    const [_userNewsletterFocused, setUserNewsletterFocused] = useState(false);
    const [_userMessageValue, setUserMessageValue] = useState('');
    const [_userMessageFocused, setUserMessageFocused] = useState(false);

    const [_showModal, setShowModal] = useState(false);
    const [_modalHeader, setModalHeader] = useState('');
    const [_modalBody, setModalBody] = useState('');
    const [_modalIcon, setModalIcon] = useState('');

    const _sliderProjectsSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        nextArrow: <FontAwesomeIcon icon={faRightLong} />,
        prevArrow: <FontAwesomeIcon icon={faLeftLong} />,
        onInit: () => $('._sliderProjects ._shadowIndex p').html('01'),
        beforeChange: (current, next) =>
            next < 9
                ? $('._sliderProjects ._shadowIndex p').html('0' + (next + 1))
                : $('._sliderProjects ._shadowIndex p').html('' + (next + 1))
    };

    const _sliderArticlesSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        nextArrow: <FontAwesomeIcon icon={faRightLong} />,
        prevArrow: <FontAwesomeIcon icon={faLeftLong} />,
        onInit: () => $('._sliderArticles ._shadowIndex._smaller p').html('01'),
        beforeChange: (current, next) =>
            next < 9
                ? $('._sliderArticles ._shadowIndex._smaller p').html('0' + (next + 1))
                : $('._sliderArticles ._shadowIndex._smaller p').html('' + (next + 1))
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

    const _sendMessage = async (event) => {
        event.preventDefault();

        try {
            await API._sendMessage({ _userNameValue, _userPhoneValue, _userEmailValue, _userNewsletterValue, _userMessageValue })
                .then((res) => {
                    setUserNameValue('');
                    setUserPhoneValue('');
                    setUserEmailValue('');
                    setUserNewsletterValue('');
                    setUserMessageValue('');
                    setModalHeader('Hello ✔ and Welcome !');
                    setModalBody('Hello and welcome our stranger, Thank you for reaching out to us, \nHow about you joins us, not only you can give a feedback, but you can discover much more about our community.');
                    setModalIcon(<FontAwesomeIcon icon={faSquareCheck} />);
                    setShowModal(true);
                    _socket.emit('action', { type: '_messageSent', data: res.data._message });
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

    useEffect(() => {
        _getArticles();
        _getProjects();
        _handleAlphabet();
        _handleWords();

        $('._s2').on('mousemove', (event) => {
            let width = $('._s2').width() / 2;
            let height = $('._s2').height() / 2;
            let amountMovedX = ((width - event.pageX) * -1 / 12);
            let amountMovedY = ((height - event.pageY) * -1 / 12);

            $('._moon').css('marginLeft', amountMovedX);
            $('._moon').css('marginTop', amountMovedY);
        });

        $('._s3').on('mousemove', (event) => {
            let width = $('._s3').width() / 2;
            let height = $('._s3').height() / 2;
            let amountMovedX = ((width - event.pageX) * -1 / 12);
            let amountMovedY = ((height - event.pageY) * -1 / 12);

            $('._s3>h1').css('marginLeft', amountMovedX);
            $('._s3>h1').css('marginTop', amountMovedY);
        });

        $('._s4').on('mousemove', (event) => {
            let width = $('._s4').width() / 2;
            let amountMovedX = ((width - event.pageX) * 1 / 64);

            $('.before').css('right', amountMovedX);
        });
    }, [_getArticles, _getProjects, _handleAlphabet, _handleWords]);

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
                            <p>Full-Stack Developer & a Graphic Designer<b className='pink_dot'>.</b></p>
                            <p>Based in <b className='web'>Morocco<b className='pink_dot'>.</b></b></p>
                        </div>
                        <Button
                            type='button'
                            className='border border-0 rounded-0 inverse w-25'
                            variant='outline-light'
                            onClick={() => $()}
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
                                (_.orderBy(_.filter(_projects, (_p) => { return !_p._hide }), ['_project_view'], ['desc']).slice(0, 10)).map((_project, index) => {
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
                                                <p className='text-muted author'>by <b>{_project._project_author}</b>, {moment(new Date(_project.createdAt)).fromNow()}</p>
                                            </Card.Body>
                                        </Card>
                                    )
                                })
                            }
                        </Slider>
                        <div className='_shadowIndex d-flex'><p></p><b className='pink_dot'>.</b></div>
                        <div className='_shadowIndex _smaller d-flex'><p></p><b className='pink_dot'>.</b></div>
                        <div className='_dotsPattern'></div>
                    </div>
                </div>
            </section>
            <section className='_s2 grid'>
                <div className='g-col-5'>
                    <div className='_pulsingDots'>
                        <div className='p1 rounded-circle'></div>
                        <div className='p2 rounded-circle'></div>
                        <div className='p3 rounded-circle'></div>
                    </div>
                </div>
                <div className='g-col-7 align-self-center'>
                    <div className='_moon'></div>
                    <div className='_sliderArticles'>
                        <Slider {..._sliderArticlesSettings}>
                            {
                                (_.orderBy(_.filter(_articles, (_a) => { return !_a._hide }), ['_article_view'], ['desc']).slice(0, 10)).map((_article, index) => {
                                    return (
                                        <Card className={`border border-0 rounded-0 card_${index}`} key={index}>
                                            <Card.Body>
                                                <div className='_shadowIndex'><p>{_.head(_article._article_title.split(/[\s.]+/)).length <= 2 ? _.head(_article._article_title.split(/[\s.]+/)) + ' ' + _.nth(_article._article_title.split(/[\s.]+/), 1) : _.head(_article._article_title.split(/[\s.]+/))}<b className='pink_dot'>.</b></p></div>
                                                <h2>{_article._article_title}</h2>
                                                <Form className='d-flex justify-content-end'>
                                                    <Button
                                                        type='button'
                                                        className='border border-0 rounded-0 inverse'
                                                        variant='outline-light'
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
                                                </Form>
                                                <p className='text-muted information'><b>{_.size(_article._article_view)}</b> Views <FontAwesomeIcon icon={faCircleDot} /> by <b>{_article._article_author}</b>, {moment(new Date(_article.createdAt)).fromNow()}</p>
                                            </Card.Body>
                                        </Card>
                                    )
                                })
                            }
                        </Slider>
                        <div className='_shadowIndex _smaller d-flex'><p></p><b className='pink_dot'>.</b></div>
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
                                <h6>Languages i'm fluent at</h6>
                                <ul className='text-muted tags'>
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
                                <h6>Tools i use</h6>
                                <ul className='text-muted tags'>
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
                                <ul className='text-muted tags'>
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
                                <ul className='text-muted tags'>
                                    <li className='tag_item'>Adobe Photoshop</li>
                                    <li className='tag_item'>Adobe Illustrator</li>
                                    <li className='tag_item'>Sketch</li>
                                </ul>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <h1>skills.</h1>
            </section>
            <section className='_s4 grid'>
                <div className='letter-grid d-flex justify-content-center flex-wrap text-center'></div>
                <div className='g-col-12 grid'>
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
                        <Form className='grid'>
                            <Row className='g-col-12 grid'>
                                <Col className='g-col-6'>
                                    <Form.Group controlId='_userNameInput' className={`_formGroup ${_userNameFocused ? 'focused' : ''}`}>
                                        <FloatingLabel
                                            controlId='_userNameInput'
                                            label='Name.'
                                            className='_formLabel'
                                        >
                                            <Form.Control placeholder='Name.' autoComplete='new-password' type='text' className='_formControl border rounded-0' name='_userNameInput' value={_userNameValue} onChange={(event) => setUserNameValue(event.target.value)} onFocus={() => setUserNameFocused(true)} onBlur={() => setUserNameFocused(false)}></Form.Control>
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                                <Col className='g-col-6'>
                                    <Form.Group controlId='_userPhoneInput' className={`_formGroup ${_userPhoneFocused ? 'focused' : ''}`}>
                                        <FloatingLabel
                                            controlId='_userPhoneInput'
                                            label='Phone.'
                                            className='_formLabel'
                                        >
                                            <Form.Control placeholder='Phone.' autoComplete='new-password' type='text' className='_formControl border rounded-0' name='_userPhoneInput' value={_userPhoneValue} onChange={(event) => setUserPhoneValue(event.target.value)} onFocus={() => setUserPhoneFocused(true)} onBlur={() => setUserPhoneFocused(false)}></Form.Control>
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='g-col-12 grid'>
                                <Col className='g-col-6'>
                                    <Form.Group controlId='_userEmailInput' className={`_formGroup ${_userEmailFocused ? 'focused' : ''}`}>
                                        <FloatingLabel
                                            controlId='_userEmailInput'
                                            label='Email.'
                                            className='_formLabel'
                                        >
                                            <Form.Control placeholder='Email.' autoComplete='new-password' type='text' className='_formControl border rounded-0' name='_userEmailInput' value={_userEmailValue} onChange={(event) => setUserEmailValue(event.target.value)} onFocus={() => setUserEmailFocused(true)} onBlur={() => setUserEmailFocused(false)}></Form.Control>
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                                <Col className='g-col-6'>
                                    <Form.Group controlId='_userNewsletterInput' className={`_checkGroup _formGroup ${_userNewsletterFocused ? 'focused' : ''}`}>
                                        <FloatingLabel
                                            controlId='_userNewsletterInput'
                                            label='Subscribe to receive our newsletter.'
                                            className='_formLabel'
                                        >
                                            <Form.Check
                                                type='checkbox'
                                                name='_userNewsletterInput' value={_userNewsletterValue} onChange={(event) => setUserNewsletterValue(event.target.value)} onFocus={() => setUserNewsletterFocused(true)} onBlur={() => setUserNewsletterFocused(false)}
                                            />
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='g-col-12 grid'>
                                <Col className='g-col-12'>
                                    <Form.Group controlId='_userMessageInput' className={`_formGroup ${_userMessageFocused ? 'focused' : ''}`}>
                                        <FloatingLabel
                                            controlId='_userMessageInput'
                                            label='Message.'
                                            className='_formLabel'
                                        >
                                            <Form.Control placeholder='Message.' as='textarea' autoComplete='new-password' type='text' className='_formControl border rounded-0' name='_userMessageInput' value={_userMessageValue} onChange={(event) => setUserMessageValue(event.target.value)} onFocus={() => setUserMessageFocused(true)} onBlur={() => setUserMessageFocused(false)}></Form.Control>
                                        </FloatingLabel>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='g-col-12 d-flex justify-content-end'>
                                <Button
                                    type='button'
                                    className='border border-0 rounded-0 inverse w-25'
                                    variant='outline-light'
                                    onClick={(event) => _sendMessage(event)}
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
                    <Modal.Body className='text-muted'>{_modalBody}</Modal.Body>
                    <Modal.Footer>
                        {_modalIcon}
                        <Button className='border border-0 rounded-0 inverse' variant='outline-light' onClick={() => setShowModal(false)}>
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