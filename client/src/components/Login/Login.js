// React
import React, { useCallback, useEffect, useState } from 'react';

// Third-Party State Management
import _useStore from '../../store';

// React Router
import { useLocation, useNavigate } from 'react-router-dom';

// HTTP Client
import axios from 'axios';

// Form Handling & Validation
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// Bootstrap Components
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRectangleXmark } from '@fortawesome/free-regular-svg-icons';

// Utility Libraries
import _ from 'lodash';

const Login = (props) => {
    const { user } = _useStore();

    // Access your states and actions like this:
    const setUserIsAuthenticated = user['_userIsAuthenticated_SET_STATE'];
    const setUser = user['_user_SET_STATE'];

    let location = useLocation();
    let navigate = useNavigate();

    const _validationSchema = Yup.object()
        .shape({
            _user_identification: Yup.string()
                .default('')
                .required('Identification missing.')
                .matches(
                    /^(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}|[a-zA-Z0-9_]{3,20})$/i,
                    'Identification invalid.'
                ),
            _user_password: Yup.string()
                .default('')
                .required('Password missing.')
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]{8,}$/,
                    'Password must contain at least 1 upper and 1 lowercase letter, 1 number and 1 symbol.'
                ),
        })
        .required();
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onTouched',
        reValidateMode: 'onChange',
        resolver: yupResolver(_validationSchema),
        defaultValues: {
            _user_identification: '',
            _user_password: '',
        },
    });

    const [_userIdentificationFocused, setUserIdentificationFocused] =
        useState(false);
    const [_userPasswordFocused, setUserPasswordFocused] = useState(false);

    const [_showModal, setShowModal] = useState(false);
    const [_modalHeader, setModalHeader] = useState('');
    const [_modalBody, setModalBody] = useState('');
    const [_modalIcon, setModalIcon] = useState('');

    const checkAuthentication = useCallback(async () => {
        try {
            // Check if the token is valid by calling the new endpoint
            return await axios
                .get('/api/user/_checkToken', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                })
                .then((response) => {
                    return response.data._user;
                })
                .catch(() => {
                    return false;
                });
        } catch (error) {
            return false;
        }
    }, []);

    useEffect(() => {
        const checkUserAuthentication = async () => {
            const isAuthenticated = await checkAuthentication();
            if (isAuthenticated) {
                setUser(isAuthenticated);
                setUserIsAuthenticated(true);
                navigate('/dashboard', {
                    replace: true,
                    state: { from: location },
                });
            }
        };
        checkUserAuthentication();

        const subscription = watch((value, { name, type }) => { });
        return () => subscription.unsubscribe();
    }, [
        checkAuthentication,
        watch,
        setUser,
        location,
        navigate,
        setUserIsAuthenticated,
    ]);

    const onSubmit = async (values) => {
        try {
            return axios
                .post('/api/user/_login', values)
                .then((response) => {
                    // Store the token in local storage
                    localStorage.setItem('jwtToken', response.data.token);

                    setUser(response.data._user);
                    setUserIsAuthenticated(true);
                    navigate('/dashboard', {
                        replace: true,
                        state: { from: location },
                    });
                })
                .catch((error) => {
                    setModalHeader('We\'re sorry !');
                    setModalBody(error.response.data.text);
                    setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
                    setShowModal(true);
                });
        } catch (error) {
            //Something shitty happens if incorrect password
            setModalHeader('We\'re sorry !');
            setModalBody(JSON.stringify(error));
            setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            setShowModal(true);
        }
    };

    const onError = (error) => {
        setModalHeader('Sorry !');
        setModalBody(
            _.join(
                _.map(error, (err) => err.message),
                '\n'
            )
        );
        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
        setShowModal(true);
    };

    const _toSignup = async (event) => {
        event.preventDefault();
        navigate('/signup', { replace: true, state: { from: location } });
    };

    return (
        <main className='_login'>
            <section className='grid'>
                <div className='g-col-6 d-flex justify-content-center align-items-center'>
                    <Card className='border border-0 rounded-0'>
                        <Card.Header className='rounded-0'>
                            <h3>
                                Login<b className='pink_dot'>.</b>
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit(onSubmit, onError)} className='grid'>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_user_identification'
                                        className={`_formGroup ${_userIdentificationFocused ? 'focused' : ''
                                            }`}
                                    >
                                        <FloatingLabel
                                            label='Email Or Username.'
                                            className='_formLabel'
                                        >
                                            <Form.Control
                                                {...register('_user_identification')}
                                                onBlur={() => setUserIdentificationFocused(false)}
                                                onFocus={() => setUserIdentificationFocused(true)}
                                                placeholder='Email Or Username.'
                                                autoComplete='new-password'
                                                type='text'
                                                className='_formControl border rounded-0'
                                                name='_user_identification'
                                            />
                                            {errors._user_identification && (
                                                <Form.Text
                                                    className={`bg-danger d-flex align-items-center text-white bg-opacity-75 ${!_.isEmpty(watch('_user_identification'))
                                                        ? ''
                                                        : 'toClear'
                                                        }`}
                                                >
                                                    {errors._user_identification.message}
                                                </Form.Text>
                                            )}
                                            {!_.isEmpty(watch('_user_identification')) && (
                                                <div
                                                    className='__close'
                                                    onClick={() => {
                                                        reset({
                                                            _user_identification: '',
                                                        });
                                                    }}
                                                ></div>
                                            )}
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className='g-col-12'>
                                    <Form.Group
                                        controlId='_user_password'
                                        className={`_formGroup ${_userPasswordFocused ? 'focused' : ''
                                            }`}
                                    >
                                        <FloatingLabel label='Password.' className='_formLabel'>
                                            <Form.Control
                                                {...register('_user_password')}
                                                onBlur={() => setUserPasswordFocused(false)}
                                                onFocus={() => setUserPasswordFocused(true)}
                                                placeholder='Password.'
                                                autoComplete='new-password'
                                                type='password'
                                                className='_formControl border rounded-0'
                                                name='_user_password'
                                            />
                                            {errors._user_password && (
                                                <Form.Text
                                                    className={`bg-danger d-flex align-items-center text-white bg-opacity-75 ${!_.isEmpty(watch('_user_password')) ? '' : 'toClear'
                                                        }`}
                                                >
                                                    {errors._user_password.message}
                                                </Form.Text>
                                            )}
                                            {!_.isEmpty(watch('_user_password')) && (
                                                <div
                                                    className='__close'
                                                    onClick={() => {
                                                        reset({
                                                            _user_password: '',
                                                        });
                                                    }}
                                                ></div>
                                            )}
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className='g-col-12'>
                                    <Button
                                        type='submit'
                                        className='border border-0 rounded-0 w-100'
                                        variant='outline-light'
                                    >
                                        <div className='buttonBorders'>
                                            <div className='borderTop'></div>
                                            <div className='borderRight'></div>
                                            <div className='borderBottom'></div>
                                            <div className='borderLeft'></div>
                                        </div>
                                        <span>
                                            login<b className='pink_dot'>.</b>
                                        </span>
                                    </Button>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
                <div className='g-col-6 d-flex justify-content-center align-items-center'>
                    <Card className='border border-0 rounded-0'>
                        <Card.Header className='rounded-0 d-flex justify-content-start align-items-end'>
                            <h4>
                                Signup<b className='pink_dot'>.</b>
                            </h4>
                        </Card.Header>
                        <Card.Body className='rounded-0'>
                            <Form
                                className='d-flex flex-column justify-content-center align-items-start'
                                onSubmit={(event) => _toSignup(event)}
                            >
                                <h6>Welcome to boutaleb.</h6>
                                <p>To speak louder.</p>
                                <Button
                                    type='submit'
                                    className='border border-0 rounded-0 w-100'
                                    variant='outline-light'
                                >
                                    <div className='buttonBorders'>
                                        <div className='borderTop'></div>
                                        <div className='borderRight'></div>
                                        <div className='borderBottom'></div>
                                        <div className='borderLeft'></div>
                                    </div>
                                    <span>
                                        Signup<b className='pink_dot'>.</b>
                                    </span>
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
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

export default Login;
