import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { _useStore } from '../../store/store';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faRectangleXmark, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import _ from 'lodash';
import $ from 'jquery';

//The first section needs some logo or shapes to break the whiteness; maybe
//The second section needs some engagement, something to click or do.
const AboutUs = (props) => {
    const {
        register,
        handleSubmit,
        watch,
        reset,
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

    const _typewriting = () => {
        $(document).ready(function () {
            var typeText = $('[data-type]').attr('data-type');
            var period = $('[data-type]').attr('data-period');

            if (typeText) {
                new TypeWriter($('.typewrite'), typeText, period);
            }
        });

        function TypeWriter(element, typeText, period) {
            this.element = element;
            this.typeText = JSON.parse(typeText);
            this.period = parseInt(period, 10) || 2000;
            this.txt = '';
            this.currentTextIndex = 0;
            this.isDeleting = false;

            this.tick();
        }

        TypeWriter.prototype.tick = function () {
            var self = this;
            var currentIndex = self.currentTextIndex % self.typeText.length;
            var currentText = self.typeText[currentIndex];

            if (self.isDeleting) {
                self.txt = currentText.substring(0, self.txt.length - 1);
            } else {
                self.txt = currentText.substring(0, self.txt.length + 1);
            }

            self.element.find('.wrap').text(self.txt);

            var delta = 200 - Math.random() * 100;

            if (self.isDeleting) {
                delta /= 2;
            }

            if (!self.isDeleting && self.txt === currentText) {
                delta = self.period;
                self.isDeleting = true;
            } else if (self.isDeleting && self.txt === '') {
                self.isDeleting = false;
                self.currentTextIndex++;
                delta = 500;
            }

            setTimeout(function () {
                self.tick();
            }, delta);
        };
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
        _typewriting();
    }, []);

    return (
        <main className='_aboutus'>
            <section className='_s1 d-flex align-items-end'>
                <div>
                    <h1>
                        <span>About</span>
                    </h1>
                    <h1 className='d-flex'>
                        <div className='typewrite' data-period='2000' data-type='[ "boutaleb.", "A Web Designer.", "A Teacher." ]'>
                            <span className='wrap'></span>
                            <span className='cursor'>_</span>
                        </div>
                    </h1>
                </div>
            </section>
            <section className='_s2 d-flex align-items-stretch'>
                <div className='d-flex flex-column align-items-start'>
                    <h2 className='mb-auto'>What makes my work different</h2>
                    <ul>
                        <li>
                            <h3>Going Far and Delivering More</h3>
                            <p>Committed to going above and beyond. Delivering a reflection of your identity and resonating with your audience.<br />I strive to exceed by truly understanding your goals and requirements.</p>
                        </li>
                        <li>
                            <h3>Simple and Easy</h3>
                            <p>I ensure not only minimalistic aesthetics but also user-friendly, easy to navigate, clean and intuitive designs, making it effortless for your visitors to interact with your content.</p>
                        </li>
                        <li>
                            <h3>Committed Timelines</h3>
                            <p>I provide achievable timelines by breaking down the process into manageable stages. With continuous communication and collaboration, keeping you informed and providing opportunities for feedback and discussion.</p>
                        </li>
                        <li>
                            <h3>Tailored Solutions for Your Success</h3>
                            <p>I offer customized solutions for your unique requirements, creating tailor-made solutions that align with your business objectives. Together, we will build a presence that stands out from the competition and drives your success.</p>
                        </li>
                    </ul>
                </div>
            </section>
            <section className='_s3'>

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
                                        controlId='_userEmailInput'
                                        className={`_formGroup ${_userEmailFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Email.'
                                            className='_formLabel _labelWhite'
                                        >
                                            <Form.Control
                                                {...register('_userEmailInput', {
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
                                                className={`_formControl border rounded-0 ${errors._userEmailInput ? 'border-danger' : ''}`}
                                                name='_userEmailInput'
                                                onFocus={() => { setUserEmailFocused(true) }}
                                            />
                                            {
                                                errors._userEmailInput && (
                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_userEmailInput')) ? '' : 'toClear'}`}>
                                                        {errors._userEmailInput.message}
                                                    </Form.Text>
                                                )
                                            }
                                            {
                                                !_.isEmpty(watch('_userEmailInput')) && (
                                                    <div className='_formClear'
                                                        onClick={() => {
                                                            reset({
                                                                _userEmailInput: ''
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

export default AboutUs;