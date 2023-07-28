import React, { useCallback, useEffect, useState } from 'react';
import { _useStore } from '../../store/store';
import { useForm } from 'react-hook-form';
import {
    NavLink,
    useNavigate,
    useLocation
} from 'react-router-dom';
import axios from 'axios';
import Moment from 'react-moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faGear, faRightFromBracket, faWallet, faBarsProgress, faPen, faCamera } from '@fortawesome/free-solid-svg-icons';
import { faBell, faNewspaper, faRectangleXmark, faCalendar } from '@fortawesome/free-regular-svg-icons';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import Downshift from 'downshift';
import SimpleBar from 'simplebar-react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import logo from '../../assets/_images/b..svg';
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

const Dashboard = (props) => {
    const setUserIsAuthenticated = _useStore((state) => state.setUserIsAuthenticated);

    const _user = _useStore((state) => state._user);
    const setUser = _useStore((state) => state.setUser);
    const addUser = _useStore((state) => state.addUser);
    const deleteUser = _useStore((state) => state.deleteUser);

    const _users = _useStore((state) => state._users);
    const setUsers = _useStore((state) => state.setUsers);
    const updateUsers = _useStore((state) => state.updateUsers);

    const _userToEdit = _useStore((state) => state._userToEdit);
    const setUserToEdit = _useStore((state) => state.setUserToEdit);
    const clearUserToEdit = _useStore((state) => state.clearUserToEdit);

    const [_typedCharactersCountry, setTypedCharactersCountry] = useState('');
    const [_countrySuggestion, setCountrySuggestion] = useState('');
    const [_countryItems, setCountryItems] = useState([]);

    const [_typedCharactersCity, setTypedCharactersCity] = useState('');
    const [_citySuggestion, setCitySuggestion] = useState('');
    const [_cityItems, setCityItems] = useState([]);

    const _fingerprint = usePersistentFingerprint();
    const [isFingerprintLoaded, setIsFingerprintLoaded] = useState(false);

    let location = useLocation();
    let navigate = useNavigate();

    // use resetField in all project
    const {
        register,
        handleSubmit,
        watch,
        getValues,
        setValue,
        setError,
        reset,
        resetField,
        formState: { errors }
    } = useForm({
        mode: 'onTouched',
        reValidateMode: 'onChange',
        reValidateMode: 'onSubmit',
        defaultValues: {
            _user_email: '',
            _user_username: '',
            _user_password: '',
            _user_passwordNew: '',
            _user_passwordNewConfirm: '',
            _user_picture: '',
            _user_firstname: '',
            _user_lastname: '',
            _user_city: '',
            _user_country: {
                _code: '',
                _country: ''
            },
            _user_phone: '',
            _user_toDelete: false
        }
    });

    const [_userEmailFocused, setUseremailFocused] = useState(false);
    const [_userUsernameFocused, setUserusernameFocused] = useState(false);
    const [_userFirstnameFocused, setUserfirstnameFocused] = useState(false);
    const [_userLastnameFocused, setUserlastnameFocused] = useState(false);
    const [_userCityFocused, setUsercityFocused] = useState(false);
    const [_userCountryFocused, setUsercountryFocused] = useState(false);
    const [_userPhoneFocused, setUserphoneFocused] = useState(false);

    const [_userPasswordFocused, setUserpasswordFocused] = useState(false);
    const [_userPasswordNewFocused, setUserpasswordNewFocused] = useState(false);
    const [_userPasswordNewConfirmFocused, setUserpasswordNewConfirmFocused] = useState(false);

    const [_showModal, setShowModal] = useState(false);
    const [_modalHeader, setModalHeader] = useState('');
    const [_modalBody, setModalBody] = useState('');
    const [_modalIcon, setModalIcon] = useState('');

    const _getUsers = useCallback(
        async () => {
            try {
                axios('/api/user')
                    .then((response) => {
                        setUsers(response.data._users);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setUsers]
    );

    const _getCountries = useCallback(
        async () => {
            try {
                axios('https://restcountries.com/v3.1/all')
                    .then((response) => {
                        const data = response.data;
                        const countryList = _.map(data, country => ({
                            value: country.name.common,
                            code: country.cca2,
                            flag: country.flags.svg
                        }));
                        setCountryItems(countryList);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setCountryItems]
    );

    const _getCities = useCallback(
        async (countryCode) => {
            try {
                !_.isEmpty(countryCode) &&
                    axios(`http://api.geonames.org/searchJSON?country=${countryCode}&username=thranduilurm0m`)
                        .then((response) => {
                            const data = response.data;
                            const cityList = _.map(data.geonames, city => ({
                                value: city.name
                            }));
                            setCityItems(cityList);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
            } catch (error) {
                console.log(error);
            }
        },
        [setCityItems]
    );

    const _handleLogout = async () => {
        return axios.post(`/api/user/_logout/${_user._id}`, _user)
            .then((response) => {
                localStorage.setItem('jwtToken', '');

                setUser({});
                setUserIsAuthenticated(false);
                _socket.emit('action', { type: '_userDisonnected', data: response.data._user });
                navigate('/login', { replace: true, state: { from: location } });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const _handleEdit = (_index) => {
        setUserToEdit(_user);
    };

    const _handleCancel = (_index) => {
        // Reset the form fields
        reset({
            _user_password: '',
            _user_passwordNew: '',
            _user_passwordNewConfirm: '',
        });

        clearUserToEdit();
    };

    const onSubmit = async (values) => {
        const formData = new FormData();
        values._user_fingerprint = _fingerprint;

        try {
            // Check if any of the password fields is not empty
            if (
                (values._user_password || values._user_passwordNew || values._user_passwordNewConfirm) &&
                (!values._user_password || !values._user_passwordNew || !values._user_passwordNewConfirm)
            ) {
                setError('_user_password', {
                    type: 'manual',
                    message: 'This must be filled.'
                });
                setError('_user_passwordNew', {
                    type: 'manual',
                    message: 'This must be filled.'
                });
                setError('_user_passwordNewConfirm', {
                    type: 'manual',
                    message: 'This must be filled.'
                });
                return;
            }

            // Custom validation for password confirmation
            if (values._user_passwordNew !== values._user_passwordNewConfirm) {
                setError('_user_passwordNewConfirm', {
                    type: 'manual',
                    message: 'Confirmation doesn\'t match.'
                });
                return;
            }

            for (const [key, value] of Object.entries(values)) {
                if (!_.isEmpty(value)) {
                    if (key === '_user_picture') {
                        formData.append(key, value[0]);
                    } else {
                        formData.append(key, value);
                    }
                }
            }

            return axios.patch(`/api/user/${_userToEdit._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important: set the content type to 'multipart/form-data'
                },
            })
                .then((res) => {
                    setUser(res.data._user);
                    _socket.emit('action', { type: '_userUpdated', data: res.data._user });

                    // Clear the _userToEdit state
                    clearUserToEdit();
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

    const onError = (error) => {
        setModalHeader('We\'re sorry !');
        setModalBody('Please check the fields for valid information.');
        setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
        setShowModal(true);
    };

    const checkAuthentication = useCallback(async () => {
		try {
			// Check if the token is valid by calling the new endpoint
			const response = await axios.get('/api/user/_checkToken', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
		} catch (error) {
			// User is authenticated, set the state and redirect to a certain page
            setUserIsAuthenticated(false);
            navigate('/login', { replace: true, state: { from: location } });
		}
	}, [setUserIsAuthenticated, navigate, location]);

    useEffect(() => {
        _getUsers();
        _getCountries();

		checkAuthentication();

        setValue('_user_email', _user._user_email);
        setValue('_user_username', _user._user_username);
        setValue('_user_picture', _user._user_picture);
        setValue('_user_firstname', _user._user_firstname);
        setValue('_user_lastname', _user._user_lastname);
        setValue('_user_city', _user._user_city);
        setValue('_user_country', _user._user_country);
        setValue('_user_toDelete', _user._user_toDelete);

        const handleBeforeUnload = () => {
            clearUserToEdit();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        const subscription = watch((value, { name, type }) => { });
        return () => {
            subscription.unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [_getUsers, _getCountries, _getCities, watch, clearUserToEdit]);

    return (
        <main className='_dashboard'>
            <section className='_s1 grid'>
                <Tab.Container defaultActiveKey='_home'>
                    <div className='g-col-2'>
                        <Nav variant='pills' className='flex-column'>
                            <Nav.Item>
                                <NavLink to='/' className='logo d-flex align-items-center justify-content-center'>
                                    <img className='img-fluid' src={logo} alt='#' />
                                </NavLink>
                            </Nav.Item>
                            <Nav.Item>
                                <h5>Personal</h5>
                                <Nav.Link className='d-flex align-items-start' eventKey='_home'>
                                    <FontAwesomeIcon icon={faHouse} />
                                    <p>Home<b className='pink_dot'>.</b></p>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link className='d-flex align-items-start' eventKey='_financials'>
                                    <FontAwesomeIcon icon={faWallet} />
                                    <p>Financials<b className='pink_dot'>.</b></p>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link className='d-flex align-items-start' eventKey='_projects'>
                                    <FontAwesomeIcon icon={faBarsProgress} />
                                    <p>Projects<b className='pink_dot'>.</b></p>
                                </Nav.Link>
                            </Nav.Item>

                            <Nav.Item>
                                <h5>Blog</h5>
                                <Nav.Link className='d-flex align-items-start' eventKey='_articles'>
                                    <FontAwesomeIcon icon={faNewspaper} />
                                    <p>Articles<b className='pink_dot'>.</b></p>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link className='d-flex align-items-start' eventKey='_portfolio'>
                                    <FontAwesomeIcon icon={faBarsProgress} />
                                    <p>Portfolio<b className='pink_dot'>.</b></p>
                                </Nav.Link>
                            </Nav.Item>

                            <Nav.Item className='mt-auto'>
                                <Nav.Link className='d-flex align-items-start' onClick={() => _handleLogout()}>
                                    <FontAwesomeIcon icon={faRightFromBracket} />
                                    <p>Logout<b className='pink_dot'>.</b></p>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                    <div className='g-col-10 d-flex flex-column'>
                        <Nav className='align-items-center'>
                            <Nav.Item className='_name d-flex'>
                                <span className='d-flex align-items-center justify-content-center'><img src={_.isEmpty(_user._user_picture) ? logo : _user._user_picture} alt='' /></span>
                                <span className='d-flex flex-column justify-content-center'>
                                    <p>{_.isEmpty(_user._user_lastname) && _.isEmpty(_user._user_firstname) ? _.capitalize(_user._user_email) : (!_.isEmpty(_user._user_lastname) ? _user._user_lastname + ' ' + _user._user_firstname : _user._user_firstname)}</p>
                                    <p>{_.isEmpty(_user.Permission) ? 'boutaleb.dev/' + _user._user_username : _.capitalize(_user.Permission._permission_titre)}</p>
                                    <p>{_.isEmpty(_user._user_city) && _.isEmpty(_user._user_country) ? '' : (!_.isEmpty(_user._user_city) ? _user._user_city + ', ' + _user._user_country : _user._user_country)}</p>
                                </span>
                            </Nav.Item>
                            <Nav.Item className='_date'>
                                <Nav.Link className='d-flex align-items-center justify-content-center'>
                                    <FontAwesomeIcon icon={faCalendar} />
                                    <Moment format='D MMM' local>{new Date()}</Moment>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item className='_notifications ms-auto'>
                                <Nav.Link className='d-flex align-items-center justify-content-center' eventKey='_notifications'><FontAwesomeIcon icon={faBell} /></Nav.Link>
                            </Nav.Item>
                            <Nav.Item className='_settings'>
                                <Nav.Link className='d-flex align-items-center justify-content-center' eventKey='_settings'><FontAwesomeIcon icon={faGear} /></Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey='_home'>
                                <div className='_pane d-flex flex-column'>
                                    <div className='_header'>

                                    </div>
                                    <div className='_body flex-grow-1'>
                                        <SimpleBar style={{ maxHeight: '100%' }} forceVisible='y' autoHide={false}>
                                            <div>_agenda</div>
                                            <div>_testimonies</div>
                                            <div>_projects graphs</div>
                                            <div>_articles graphs</div>
                                            <div>_financials graphs</div>
                                        </SimpleBar>
                                    </div>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey='_financials'>
                                <div className='_pane d-flex flex-column'>
                                    <div className='_header'>

                                    </div>
                                    <div className='_body flex-grow-1'>
                                        <SimpleBar style={{ maxHeight: '100%' }} forceVisible='y' autoHide={false}>
                                            <div>_financials</div>
                                        </SimpleBar>
                                    </div>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey='_projects'>
                                <div className='_pane d-flex flex-column'>
                                    <div className='_header'>

                                    </div>
                                    <div className='_body flex-grow-1'>
                                        <SimpleBar style={{ maxHeight: '100%' }} forceVisible='y' autoHide={false}>
                                            <div>_projects</div>
                                        </SimpleBar>
                                    </div>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey='_articles'>
                                <div className='_pane d-flex flex-column'>
                                    <div className='_header'>

                                    </div>
                                    <div className='_body flex-grow-1'>
                                        <SimpleBar style={{ maxHeight: '100%' }} forceVisible='y' autoHide={false}>
                                            <div>_articles</div>
                                        </SimpleBar>
                                    </div>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey='_portfolio'>
                                <div className='_pane d-flex flex-column'>
                                    <div className='_header'>

                                    </div>
                                    <div className='_body flex-grow-1'>
                                        <SimpleBar style={{ maxHeight: '100%' }} forceVisible='y' autoHide={false}>
                                            <div>_portfolio</div>
                                        </SimpleBar>
                                    </div>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey='_notifications'>
                                <div className='_pane d-flex flex-column'>
                                    <div className='_header'>

                                    </div>
                                    <div className='_body flex-grow-1'>
                                        <SimpleBar style={{ maxHeight: '100%' }} forceVisible='y' autoHide={false}>
                                            <div>_notifications</div>
                                        </SimpleBar>
                                    </div>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey='_settings'>
                                <div className='_pane d-flex flex-column'>
                                    <SimpleBar style={{ maxHeight: '100%' }} forceVisible='y' autoHide={false}>
                                        <Card className='rounded-0'>
                                            <Card.Body className='border border-0 rounded-0 no-shadow'>
                                                <Form onSubmit={handleSubmit(onSubmit, onError)} className='grid'>
                                                    {/* Header */}
                                                    <Row className='g-col-12 grid'>
                                                        <Col className='g-col-3'>
                                                            <span>
                                                                Account Settings.
                                                                <p className='text-muted'>Update your Profile photo and details Here.</p>
                                                            </span>
                                                        </Col>
                                                        <Col className='g-col-3'></Col>
                                                        <Col className='g-col-3'></Col>
                                                        <Col className='g-col-3 ms-auto d-flex justify-content-end'>
                                                            {
                                                                //Upon click it just disapears or appears too fast
                                                                !_.isEmpty(_userToEdit) && (
                                                                    <Button
                                                                        type='button'
                                                                        className='border border-0 rounded-0 _red'
                                                                        variant='link'
                                                                        onClick={() => _handleCancel('_first')}
                                                                    >
                                                                        Cancel<b className='pink_dot'>.</b>
                                                                    </Button>
                                                                )
                                                            }
                                                            <Button
                                                                type={`${_.isEmpty(_userToEdit) ? 'button' : 'submit'}`}
                                                                className={`border border-0 rounded-0 inverse ${_.isEmpty(_userToEdit) ? '' : '_edit'}`}
                                                                variant='outline-light'
                                                                onClick={(ev) => {
                                                                    if (_.isEmpty(_userToEdit)) {
                                                                        ev.preventDefault();
                                                                        _handleEdit();
                                                                    }
                                                                }}
                                                            >
                                                                <div className='buttonBorders'>
                                                                    <div className='borderTop'></div>
                                                                    <div className='borderRight'></div>
                                                                    <div className='borderBottom'></div>
                                                                    <div className='borderLeft'></div>
                                                                </div>
                                                                <span>
                                                                    {_.isEmpty(_userToEdit) ? 'Edit.' : 'Save Changes.'}
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </span>
                                                            </Button>
                                                        </Col>
                                                    </Row>

                                                    {/* Public information */}
                                                    <Row className='g-col-12 grid'>
                                                        <Col className='g-col-3'>
                                                            <span>
                                                                Public information.
                                                                <p className='text-muted'>This will be displayed on your profile.</p>
                                                            </span>
                                                        </Col>
                                                        <Col className='g-col-3'>
                                                            <Form.Group
                                                                controlId='_user_lastname'
                                                                className={`_formGroup ${_userLastnameFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                            >
                                                                <FloatingLabel
                                                                    label='Last Name.'
                                                                    className={`_formLabel ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                >
                                                                    <Form.Control
                                                                        {...register('_user_lastname', {
                                                                            pattern: {
                                                                                value: /^[a-zA-Z\s]{2,}$/i,
                                                                                message: 'No numbers or symbols.'
                                                                            },
                                                                            onBlur: () => { setUserlastnameFocused(false) }
                                                                        })}
                                                                        placeholder='Lastname.'
                                                                        autoComplete='new-password'
                                                                        type='text'
                                                                        className={`_formControl border rounded-0 ${errors._user_lastname ? 'border-danger' : ''}`}
                                                                        name='_user_lastname'
                                                                        onFocus={() => { setUserlastnameFocused(true) }}
                                                                        disabled={_.isEmpty(_userToEdit)}
                                                                    />
                                                                    {
                                                                        errors._user_lastname && (
                                                                            <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_user_lastname')) ? '' : 'toClear'}`}>
                                                                                {errors._user_lastname.message}
                                                                            </Form.Text>
                                                                        )
                                                                    }
                                                                    {
                                                                        (!_.isEmpty(watch('_user_lastname')) && !_.isEmpty(_userToEdit)) && (
                                                                            <div className='_formClear'
                                                                                onClick={() => {
                                                                                    resetField('_user_lastname');
                                                                                }}
                                                                            ></div>
                                                                        )
                                                                    }
                                                                </FloatingLabel>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col className='g-col-3'>
                                                            <Form.Group
                                                                controlId='_user_firstname'
                                                                className={`_formGroup ${_userFirstnameFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                            >
                                                                <FloatingLabel
                                                                    label='First Name.'
                                                                    className={`_formLabel ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                >
                                                                    <Form.Control
                                                                        {...register('_user_firstname', {
                                                                            pattern: {
                                                                                value: /^[a-zA-Z\s]{2,}$/i,
                                                                                message: 'No numbers or symbols.'
                                                                            },
                                                                            onBlur: () => { setUserfirstnameFocused(false) }
                                                                        })}
                                                                        placeholder='Firstname.'
                                                                        autoComplete='new-password'
                                                                        type='text'
                                                                        className={`_formControl border rounded-0 ${errors._user_firstname ? 'border-danger' : ''}`}
                                                                        name='_user_firstname'
                                                                        onFocus={() => { setUserfirstnameFocused(true) }}
                                                                        disabled={_.isEmpty(_userToEdit)}
                                                                    />
                                                                    {
                                                                        errors._user_firstname && (
                                                                            <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_user_firstname')) ? '' : 'toClear'}`}>
                                                                                {errors._user_firstname.message}
                                                                            </Form.Text>
                                                                        )
                                                                    }
                                                                    {
                                                                        (!_.isEmpty(watch('_user_firstname')) && !_.isEmpty(_userToEdit)) && (
                                                                            <div className='_formClear'
                                                                                onClick={() => {
                                                                                    resetField('_user_firstname');
                                                                                }}
                                                                            ></div>
                                                                        )
                                                                    }
                                                                </FloatingLabel>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row className='g-col-12 grid'>
                                                        <Col className='g-col-3'></Col>
                                                        <Col className='g-col-3'>
                                                            <Form.Group
                                                                controlId='_user_email'
                                                                className={`_formGroup ${_userEmailFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                            >
                                                                <FloatingLabel
                                                                    label='Email.'
                                                                    className={`_formLabel ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                >
                                                                    <Form.Control
                                                                        {...register('_user_email', {
                                                                            pattern: {
                                                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                                                                message: 'Email invalid.'
                                                                            },
                                                                            onBlur: () => { setUseremailFocused(false) }
                                                                        })}
                                                                        placeholder='Email.'
                                                                        autoComplete='new-password'
                                                                        type='text'
                                                                        className={`_formControl border rounded-0 ${errors._user_email ? 'border-danger' : ''}`}
                                                                        name='_user_email'
                                                                        onFocus={() => { setUseremailFocused(true) }}
                                                                        disabled={_.isEmpty(_userToEdit)}
                                                                    />
                                                                    {
                                                                        errors._user_email && (
                                                                            <Form.Text className={`bg-danger text-white bg-opaPhone-75 rounded-1 ${!_.isEmpty(watch('_user_email')) ? '' : 'toClear'}`}>
                                                                                {errors._user_email.message}
                                                                            </Form.Text>
                                                                        )
                                                                    }
                                                                    {
                                                                        (!_.isEmpty(watch('_user_email')) && !_.isEmpty(_userToEdit)) && (
                                                                            <div className='_formClear'
                                                                                onClick={() => {
                                                                                    resetField('_user_email');
                                                                                }}
                                                                            ></div>
                                                                        )
                                                                    }
                                                                </FloatingLabel>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col className='g-col-3'>
                                                            <Form.Group
                                                                controlId='_user_username'
                                                                className={`_formGroup ${_userUsernameFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                            >
                                                                <FloatingLabel
                                                                    label='Username.'
                                                                    className={`_formLabel ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                >
                                                                    <Form.Control
                                                                        {...register('_user_username', {
                                                                            pattern: {
                                                                                value: /^[a-zA-Z0-9_]{3,20}$/,
                                                                                message: 'Must be 3 to 20 long.'
                                                                            },
                                                                            onBlur: () => { setUserusernameFocused(false) }
                                                                        })}
                                                                        placeholder='Username.'
                                                                        autoComplete='new-password'
                                                                        type='text'
                                                                        className={`_formControl border rounded-0 ${errors._user_username ? 'border-danger' : ''}`}
                                                                        name='_user_username'
                                                                        onFocus={() => { setUserusernameFocused(true) }}
                                                                        disabled={_.isEmpty(_userToEdit)}
                                                                    />
                                                                    {
                                                                        errors._user_username && (
                                                                            <Form.Text className={`bg-danger text-white bg-opaPhone-75 rounded-1 ${!_.isEmpty(watch('_user_username')) ? '' : 'toClear'}`}>
                                                                                {errors._user_username.message}
                                                                            </Form.Text>
                                                                        )
                                                                    }
                                                                    {
                                                                        (!_.isEmpty(watch('_user_username')) && !_.isEmpty(_userToEdit)) && (
                                                                            <div className='_formClear'
                                                                                onClick={() => {
                                                                                    resetField('_user_username');
                                                                                }}
                                                                            ></div>
                                                                        )
                                                                    }
                                                                </FloatingLabel>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>

                                                    {/* Profile photo */}
                                                    <Row className='g-col-12 grid'>
                                                        <Col className='g-col-3'>
                                                            <span>
                                                                Profile photo.
                                                                <p className='text-muted'>Update your profile photo.</p>
                                                            </span>
                                                        </Col>
                                                        <Col className='g-col-3'>
                                                            {/* Replace all one option terniary conditions with the && */}
                                                            <span className={`d-flex align-items-center justify-content-center ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}>
                                                                <img src={_.isEmpty(_user._user_picture) ? logo : _user._user_picture} alt='' />
                                                                <Form.Group
                                                                    controlId='_user_picture'
                                                                    className={`_formGroup ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                                >
                                                                    <FloatingLabel
                                                                        className={`_formLabel ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                    >
                                                                        <Form.Control
                                                                            {...register('_user_picture', {})}
                                                                            type='file'
                                                                            className='_formFile'
                                                                            name='_user_picture'
                                                                            /* ref={register('_user_picture')} */
                                                                            disabled={_.isEmpty(_userToEdit)}
                                                                        />
                                                                    </FloatingLabel>
                                                                </Form.Group>
                                                            </span>
                                                            {!_.isEmpty(_userToEdit) && (<span className='_editing d-flex justify-content-center align-items-center'><FontAwesomeIcon icon={faCamera} /></span>)}
                                                        </Col>
                                                    </Row>

                                                    {/* Contact information */}
                                                    <Row className='g-col-12 grid'>
                                                        <Col className='g-col-3'>
                                                            <span>
                                                                Contact information.
                                                                <p className='text-muted'>Update your profile photo.</p>
                                                            </span>
                                                        </Col>
                                                        <Col className='g-col-3'>
                                                            <Downshift
                                                                onSelect={
                                                                    selection => {
                                                                        if (selection) {
                                                                            setValue('_user_country', { _code: selection.code, _country: selection.value });
                                                                            _getCities(selection.code);
                                                                        }
                                                                    }
                                                                }
                                                                itemToString={
                                                                    item => (item ? item.value : getValues('_user_country._country') || '')
                                                                }
                                                            >
                                                                {({
                                                                    getInputProps,
                                                                    getItemProps,
                                                                    getMenuProps,
                                                                    clearSelection,
                                                                    isOpen,
                                                                    inputValue,
                                                                    getRootProps,
                                                                    openMenu
                                                                }) => (
                                                                    <Form.Group
                                                                        controlId='_user_country'
                                                                        className={`_formGroup ${_userCountryFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                                    >
                                                                        <FloatingLabel
                                                                            label='Country.'
                                                                            className={`_formLabel _autocomplete ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                            {...getRootProps({}, { suppressRefError: true })}
                                                                        >
                                                                            <Form.Control
                                                                                {...register('_user_country', { persist: true })}
                                                                                placeholder='Country.'
                                                                                autoComplete='new-password'
                                                                                type='text'
                                                                                className={`_formControl border rounded-0 ${errors._user_country ? 'border-danger' : ''} ${!_.isEmpty(_typedCharactersCountry) ? '_typing' : ''}`}
                                                                                name='_user_country'
                                                                                {...getInputProps({
                                                                                    onChange: (event) => {
                                                                                        const firstSuggestion = _.orderBy(
                                                                                            _.uniqBy(
                                                                                                _.filter(
                                                                                                    _countryItems,
                                                                                                    (item) =>
                                                                                                        !event.target.value ||
                                                                                                        _.includes(
                                                                                                            _.lowerCase(item.value),
                                                                                                            _.lowerCase(event.target.value)
                                                                                                        )
                                                                                                ),
                                                                                                'value'
                                                                                            ),
                                                                                            ['value'],
                                                                                            ['asc']
                                                                                        )[0];

                                                                                        setTypedCharactersCountry(event.target.value);
                                                                                        setCountrySuggestion(firstSuggestion && (firstSuggestion.value));
                                                                                    },
                                                                                    onFocus: () => {
                                                                                        openMenu();
                                                                                        setUsercountryFocused(true)
                                                                                    },
                                                                                    onBlur: () => {
                                                                                        const firstSuggestion = _.orderBy(
                                                                                            _.uniqBy(
                                                                                                _.filter(
                                                                                                    _countryItems,
                                                                                                    (item) =>
                                                                                                        !inputValue ||
                                                                                                        _.includes(
                                                                                                            _.lowerCase(item.value),
                                                                                                            _.lowerCase(inputValue)
                                                                                                        )
                                                                                                ),
                                                                                                'value'
                                                                                            ),
                                                                                            ['value'],
                                                                                            ['asc']
                                                                                        )[0];

                                                                                        if (firstSuggestion && _typedCharactersCountry) {
                                                                                            setValue('_user_country', {
                                                                                                _code: firstSuggestion.code,
                                                                                                _country: firstSuggestion.value,
                                                                                            });
                                                                                            _getCities(firstSuggestion.code); // Fetch cities based on the first suggestion
                                                                                        } else {
                                                                                            // Handle the case where no matching suggestion is found
                                                                                            resetField('_user_country');
                                                                                            setCityItems([]); // Clear the cities list
                                                                                        }

                                                                                        setTypedCharactersCountry('');
                                                                                        setCountrySuggestion('');

                                                                                        setUsercountryFocused(false);
                                                                                    }
                                                                                })}
                                                                                disabled={_.isEmpty(_userToEdit)}
                                                                            />
                                                                            <span className='d-flex align-items-center _autocorrect'>
                                                                                {_.size(_.slice(_.lowerCase(_countrySuggestion), 0, _.lowerCase(_countrySuggestion).indexOf(_.lowerCase(_typedCharactersCountry)))) > 0 && <p className='_countrySuggestion'>{_.slice(_.lowerCase(_countrySuggestion), 0, _.lowerCase(_countrySuggestion).indexOf(_.lowerCase(_typedCharactersCountry)))}</p>}
                                                                                {_.size(_.lowerCase(_typedCharactersCountry)) > 0 && <p className='_typedCharacters'>{_.lowerCase(_countrySuggestion).indexOf(_.lowerCase(_typedCharactersCountry)) < 1 ? _.capitalize(_typedCharactersCountry) : _typedCharactersCountry}</p>}
                                                                                {_.size(_.slice(_.lowerCase(_countrySuggestion), _.lowerCase(_countrySuggestion).indexOf(_.lowerCase(_typedCharactersCountry)) + _.size(_.lowerCase(_typedCharactersCountry)))) > 0 && <p className='_countrySuggestion'>{_.slice(_.lowerCase(_countrySuggestion), _.lowerCase(_countrySuggestion).indexOf(_.lowerCase(_typedCharactersCountry)) + _.size(_.lowerCase(_typedCharactersCountry)))}</p>}
                                                                            </span>
                                                                            {
                                                                                errors._user_country && (
                                                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_user_country._country')) ? '' : 'toClear'}`}>
                                                                                        {errors._user_country.message}
                                                                                    </Form.Text>
                                                                                )
                                                                            }
                                                                            {
                                                                                ((!_.isEmpty(watch('_user_country._country')) || !_.isEmpty(_typedCharactersCountry)) && !_.isEmpty(_userToEdit)) && (
                                                                                    <div className='_formClear'
                                                                                        onClick={() => {
                                                                                            setTypedCharactersCountry('');
                                                                                            setCountrySuggestion('');
                                                                                            resetField('_user_country');
                                                                                            setCityItems([]);
                                                                                            clearSelection();
                                                                                        }}
                                                                                    ></div>
                                                                                )
                                                                            }
                                                                        </FloatingLabel>
                                                                        <SimpleBar className='_SimpleBar' style={{ maxHeight: '40vh' }} forceVisible='y' autoHide={false}>
                                                                            <ListGroup
                                                                                className='border border-0 rounded-0 d-block'
                                                                                {...getMenuProps()}
                                                                            >
                                                                                {
                                                                                    isOpen &&
                                                                                    _.map(
                                                                                        _.orderBy(
                                                                                            _.uniqBy(
                                                                                                _.filter(
                                                                                                    _countryItems,
                                                                                                    (item) =>
                                                                                                        !inputValue ||
                                                                                                        _.includes(
                                                                                                            _.lowerCase(item.value),
                                                                                                            _.lowerCase(inputValue)
                                                                                                        )
                                                                                                ),
                                                                                                'value'
                                                                                            ),
                                                                                            ['value'],
                                                                                            ['asc']
                                                                                        )
                                                                                        , (item, index) => {
                                                                                            return (
                                                                                                <ListGroup.Item
                                                                                                    className='border border-0 rounded-0'
                                                                                                    {...getItemProps({
                                                                                                        key: item.code,
                                                                                                        index,
                                                                                                        item
                                                                                                    })}
                                                                                                >
                                                                                                    <span>
                                                                                                        <img src={item.flag} alt={item.value} />
                                                                                                    </span>
                                                                                                    <span>
                                                                                                        {item.value}
                                                                                                    </span>
                                                                                                </ListGroup.Item>
                                                                                            )
                                                                                        }
                                                                                    )
                                                                                }
                                                                            </ListGroup>
                                                                        </SimpleBar>
                                                                    </Form.Group>
                                                                )}
                                                            </Downshift>
                                                        </Col>
                                                        <Col className='g-col-3'>
                                                            <Downshift
                                                                onSelect={
                                                                    selection => {
                                                                        if (selection) {
                                                                            setValue('_user_city', selection.value);
                                                                        }
                                                                    }
                                                                }
                                                                itemToString={
                                                                    item => (item ? item.value : getValues('_user_city') || '')
                                                                }
                                                            >
                                                                {({
                                                                    getInputProps,
                                                                    getItemProps,
                                                                    getMenuProps,
                                                                    clearSelection,
                                                                    isOpen,
                                                                    inputValue,
                                                                    getRootProps,
                                                                    openMenu,
                                                                }) => (
                                                                    <Form.Group
                                                                        controlId='_user_city'
                                                                        className={`_formGroup ${_userCityFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                                    >
                                                                        <FloatingLabel
                                                                            label='City.'
                                                                            className={`_formLabel _autocomplete ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                            {...getRootProps({}, { suppressRefError: true })}
                                                                        >
                                                                            <Form.Control
                                                                                {...register('_user_city', { persist: true })}
                                                                                placeholder='City.'
                                                                                autoComplete='new-password'
                                                                                type='text'
                                                                                className={`_formControl border rounded-0 ${errors._user_city ? 'border-danger' : ''} ${!_.isEmpty(_typedCharactersCity) ? '_typing' : ''}`}
                                                                                name='_user_city'
                                                                                {...getInputProps({
                                                                                    onChange: (event) => {
                                                                                        const firstSuggestion = _.orderBy(
                                                                                            _.uniqBy(
                                                                                                _.filter(
                                                                                                    _cityItems,
                                                                                                    (item) =>
                                                                                                        !event.target.value ||
                                                                                                        _.includes(
                                                                                                            _.lowerCase(item.value),
                                                                                                            _.lowerCase(event.target.value)
                                                                                                        )
                                                                                                ),
                                                                                                'value'
                                                                                            ),
                                                                                            ['value'],
                                                                                            ['asc']
                                                                                        )[0];

                                                                                        setTypedCharactersCity(event.target.value);
                                                                                        setCitySuggestion((!_.isEmpty(event.target.value) && firstSuggestion) && (firstSuggestion.value));
                                                                                        setValue('_user_city', event.target.value);
                                                                                    },
                                                                                    onFocus: () => {
                                                                                        !_.isEmpty(watch('_user_country')) && openMenu();
                                                                                        setUsercityFocused(true)
                                                                                    },
                                                                                    onBlur: () => {
                                                                                        const firstSuggestion = _.orderBy(
                                                                                            _.uniqBy(
                                                                                                _.filter(
                                                                                                    _cityItems,
                                                                                                    (item) =>
                                                                                                        !inputValue ||
                                                                                                        _.includes(
                                                                                                            _.lowerCase(item.value),
                                                                                                            _.lowerCase(inputValue)
                                                                                                        )
                                                                                                ),
                                                                                                'value'
                                                                                            ),
                                                                                            ['value'],
                                                                                            ['asc']
                                                                                        )[0];

                                                                                        if (firstSuggestion) {
                                                                                            setValue('_user_city', firstSuggestion.value);
                                                                                        } else {
                                                                                            resetField('_user_city');
                                                                                        }

                                                                                        setTypedCharactersCity('');
                                                                                        setCitySuggestion('');

                                                                                        setUsercityFocused(false)
                                                                                    }
                                                                                })}
                                                                                disabled={_.isEmpty(watch('_user_country._country')) && _.isEmpty(_userToEdit)}
                                                                            />
                                                                            <span className='d-flex align-items-center _autocorrect'>
                                                                                {_.size(_.slice(_.lowerCase(_citySuggestion), 0, _.lowerCase(_citySuggestion).indexOf(_.lowerCase(_typedCharactersCity)))) > 0 && <p className='_citySuggestion'>{_.slice(_.lowerCase(_citySuggestion), 0, _.lowerCase(_citySuggestion).indexOf(_.lowerCase(_typedCharactersCity)))}</p>}
                                                                                {_.size(_.lowerCase(_typedCharactersCity)) > 0 && <p className='_typedCharacters'>{_.lowerCase(_citySuggestion).indexOf(_.lowerCase(_typedCharactersCity)) < 1 ? _.capitalize(_typedCharactersCity) : _typedCharactersCity}</p>}
                                                                                {_.size(_.slice(_.lowerCase(_citySuggestion), _.lowerCase(_citySuggestion).indexOf(_.lowerCase(_typedCharactersCity)) + _.size(_.lowerCase(_typedCharactersCity)))) > 0 && <p className='_citySuggestion'>{_.slice(_.lowerCase(_citySuggestion), _.lowerCase(_citySuggestion).indexOf(_.lowerCase(_typedCharactersCity)) + _.size(_.lowerCase(_typedCharactersCity)))}</p>}
                                                                            </span>
                                                                            {
                                                                                errors._user_city && (
                                                                                    <Form.Text className={`bg-danger text-white bg-opacity-75 rounded-1 ${!_.isEmpty(watch('_user_city')) ? '' : 'toClear'}`}>
                                                                                        {errors._user_city.message}
                                                                                    </Form.Text>
                                                                                )
                                                                            }
                                                                            {
                                                                                ((!_.isEmpty(watch('_user_city')) || !_.isEmpty(_typedCharactersCity)) && !_.isEmpty(_userToEdit)) && (
                                                                                    <div
                                                                                        className='_formClear'
                                                                                        onClick={() => {
                                                                                            setTypedCharactersCity('');
                                                                                            setCitySuggestion('');
                                                                                            resetField('_user_city');
                                                                                            clearSelection();
                                                                                        }}
                                                                                    ></div>
                                                                                )
                                                                            }
                                                                        </FloatingLabel>
                                                                        <SimpleBar className='_SimpleBar' style={{ maxHeight: '40vh' }} forceVisible='y' autoHide={false}>
                                                                            <ListGroup
                                                                                className='border border-0 rounded-0 d-block'
                                                                                {...getMenuProps()}
                                                                            >
                                                                                {
                                                                                    isOpen
                                                                                    &&
                                                                                    _.map(
                                                                                        _.orderBy(
                                                                                            _.uniqBy(
                                                                                                _.filter(
                                                                                                    _cityItems,
                                                                                                    (item) =>
                                                                                                        !inputValue ||
                                                                                                        _.includes(
                                                                                                            _.lowerCase(item.value),
                                                                                                            _.lowerCase(inputValue)
                                                                                                        )
                                                                                                ),
                                                                                                'value'
                                                                                            ),
                                                                                            ['value'],
                                                                                            ['asc']
                                                                                        )
                                                                                        , (item, index) => {
                                                                                            return (
                                                                                                <ListGroup.Item
                                                                                                    className='border border-0 rounded-0'
                                                                                                    {...getItemProps({
                                                                                                        key: item.value,
                                                                                                        index,
                                                                                                        item,
                                                                                                    })}
                                                                                                >
                                                                                                    {item.value}
                                                                                                </ListGroup.Item>
                                                                                            );
                                                                                        }
                                                                                    )
                                                                                }
                                                                            </ListGroup>
                                                                        </SimpleBar>
                                                                    </Form.Group>
                                                                )}
                                                            </Downshift>
                                                        </Col>
                                                    </Row>
                                                    <Row className='g-col-12 grid'>
                                                        <Col className='g-col-3'></Col>
                                                        <Col className='g-col-3'>
                                                            <Form.Group
                                                                controlId='_user_phone'
                                                                className={`_formGroup ${_userPhoneFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                            >
                                                                <FloatingLabel
                                                                    label='Phone.'
                                                                    className={`_formLabel ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                >
                                                                    <Form.Control
                                                                        {...register('_user_phone', {
                                                                            pattern: {
                                                                                value: /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
                                                                                message: 'Phone number invalid.'
                                                                            },
                                                                            onBlur: () => { setUserphoneFocused(false) }
                                                                        })}
                                                                        placeholder='Phone.'
                                                                        autoComplete='new-password'
                                                                        type='text'
                                                                        className={`_formControl border rounded-0 ${errors._user_phone ? 'border-danger' : ''}`}
                                                                        name='_user_phone'
                                                                        onFocus={() => { setUserphoneFocused(true) }}
                                                                        disabled={_.isEmpty(_userToEdit)}
                                                                    />
                                                                    {
                                                                        errors._user_phone && (
                                                                            <Form.Text className={`bg-danger text-white bg-opaPhone-75 rounded-1 ${!_.isEmpty(watch('_user_phone')) ? '' : 'toClear'}`}>
                                                                                {errors._user_phone.message}
                                                                            </Form.Text>
                                                                        )
                                                                    }
                                                                    {
                                                                        (!_.isEmpty(watch('_user_phone')) && !_.isEmpty(_userToEdit)) && (
                                                                            <div className='_formClear'
                                                                                onClick={() => {
                                                                                    resetField('_user_phone');
                                                                                }}
                                                                            ></div>
                                                                        )
                                                                    }
                                                                </FloatingLabel>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>

                                                    {/* Security */}
                                                    {/* Resetting password if forgotten, but the motherfucker is already logged in, so WTF */}
                                                    <Row className='g-col-12 grid'>
                                                        <Col className='g-col-3'>
                                                            <span>
                                                                Security.
                                                                <p className='text-muted'>Update your password.</p>
                                                            </span>
                                                        </Col>
                                                        <Col className='g-col-3'>
                                                            <Form.Group
                                                                controlId='_user_password'
                                                                className={`_formGroup ${_userPasswordFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                            >
                                                                <FloatingLabel
                                                                    label='Password.'
                                                                    className={`_formLabel ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                >
                                                                    <Form.Control
                                                                        {...register('_user_password', {
                                                                            pattern: {
                                                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]{8,}$/,
                                                                                message: 'At least 1 upper and 1 lowercase letter, 1 number and 1 symbol.'
                                                                            },
                                                                            onBlur: () => { setUserpasswordFocused(false) }
                                                                        })}
                                                                        placeholder='Password.'
                                                                        autoComplete='new-password'
                                                                        type='password'
                                                                        className={`_formControl border rounded-0 ${errors._user_password ? 'border-danger' : ''}`}
                                                                        name='_user_password'
                                                                        onFocus={() => { setUserpasswordFocused(true) }}
                                                                        disabled={_.isEmpty(_userToEdit)}
                                                                    />
                                                                    {
                                                                        errors._user_password && (
                                                                            <Form.Text className={`bg-danger text-white bg-opaPhone-75 rounded-1 ${!_.isEmpty(watch('_user_password')) ? '' : 'toClear'}`}>
                                                                                {errors._user_password.message}
                                                                            </Form.Text>
                                                                        )
                                                                    }
                                                                    {
                                                                        //Compare with Country and City Form.Control to see changes
                                                                        (!_.isEmpty(watch('_user_password')) && !_.isEmpty(_userToEdit)) && (
                                                                            <div className='_formClear'
                                                                                onClick={() => {
                                                                                    resetField('_user_password');
                                                                                }}
                                                                            ></div>
                                                                        )
                                                                    }
                                                                </FloatingLabel>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row className='g-col-12 grid'>
                                                        <Col className='g-col-3'></Col>
                                                        <Col className='g-col-3'>
                                                            <Form.Group
                                                                controlId='_user_passwordNew'
                                                                className={`_formGroup ${_userPasswordNewFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                            >
                                                                <FloatingLabel
                                                                    label='New Password.'
                                                                    className={`_formLabel ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                >
                                                                    <Form.Control
                                                                        {...register('_user_passwordNew', {
                                                                            pattern: {
                                                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]{8,}$/,
                                                                                message: 'At least 1 upper and 1 lowercase letter, 1 number and 1 symbol.'
                                                                            },
                                                                            onBlur: () => { setUserpasswordNewFocused(false) }
                                                                        })}
                                                                        placeholder='New Password.'
                                                                        autoComplete='new-password'
                                                                        type='password'
                                                                        className={`_formControl border rounded-0 ${errors._user_passwordNew ? 'border-danger' : ''}`}
                                                                        name='_user_passwordNew'
                                                                        onFocus={() => { setUserpasswordNewFocused(true) }}
                                                                        disabled={_.isEmpty(_userToEdit)}
                                                                    />
                                                                    {
                                                                        errors._user_passwordNew && (
                                                                            <Form.Text className={`bg-danger text-white bg-opaPhone-75 rounded-1 ${!_.isEmpty(watch('_user_passwordNew')) ? '' : 'toClear'}`}>
                                                                                {errors._user_passwordNew.message}
                                                                            </Form.Text>
                                                                        )
                                                                    }
                                                                    {
                                                                        (!_.isEmpty(watch('_user_passwordNew')) && !_.isEmpty(_userToEdit)) && (
                                                                            <div className='_formClear'
                                                                                onClick={() => {
                                                                                    resetField('_user_passwordNew');
                                                                                }}
                                                                            ></div>
                                                                        )
                                                                    }
                                                                </FloatingLabel>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col className='g-col-3'>
                                                            <Form.Group
                                                                controlId='_user_passwordNewConfirm'
                                                                className={`_formGroup ${_userPasswordNewConfirmFocused ? 'focused' : ''} ${_.isEmpty(_userToEdit) ? '_disabled' : ''}`}
                                                            >
                                                                <FloatingLabel
                                                                    label='Confirm Password.'
                                                                    className={`_formLabel ${_.isEmpty(_userToEdit) ? '' : '_labelWhite'}`}
                                                                >
                                                                    <Form.Control
                                                                        {...register('_user_passwordNewConfirm', {
                                                                            pattern: {
                                                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]{8,}$/,
                                                                                message: 'At least 1 upper and 1 lowercase letter, 1 number and 1 symbol.'
                                                                            },
                                                                            onBlur: () => { setUserpasswordNewConfirmFocused(false) }
                                                                        })}
                                                                        placeholder='Confirm Password.'
                                                                        autoComplete='new-password'
                                                                        type='password'
                                                                        className={`_formControl border rounded-0 ${errors._user_passwordNewConfirm ? 'border-danger' : ''}`}
                                                                        name='_user_passwordNewConfirm'
                                                                        onFocus={() => { setUserpasswordNewConfirmFocused(true) }}
                                                                        disabled={_.isEmpty(_userToEdit)}
                                                                    />
                                                                    {
                                                                        errors._user_passwordNewConfirm && (
                                                                            <Form.Text className={`bg-danger text-white bg-opaPhone-75 rounded-1 ${!_.isEmpty(watch('_user_passwordNewConfirm')) ? '' : 'toClear'}`}>
                                                                                {errors._user_passwordNewConfirm.message}
                                                                            </Form.Text>
                                                                        )
                                                                    }
                                                                    {
                                                                        (!_.isEmpty(watch('_user_passwordNewConfirm')) && !_.isEmpty(_userToEdit)) && (
                                                                            <div className='_formClear'
                                                                                onClick={() => {
                                                                                    resetField('_user_passwordNewConfirm');
                                                                                }}
                                                                            ></div>
                                                                        )
                                                                    }
                                                                </FloatingLabel>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>

                                                    {/* Footer */}
                                                    <Row className='g-col-12 grid'>
                                                        <Col className='g-col-3'></Col>
                                                        <Col className='g-col-3'></Col>
                                                        <Col className='g-col-3'></Col>
                                                        <Col className='g-col-3 ms-auto d-flex justify-content-end'>
                                                            {
                                                                //Upon click it just disapears or appears too fast
                                                                !_.isEmpty(_userToEdit) && (
                                                                    <Button
                                                                        type='button'
                                                                        className='border border-0 rounded-0 _red'
                                                                        variant='link'
                                                                        onClick={() => _handleCancel('_first')}
                                                                    >
                                                                        Cancel<b className='pink_dot'>.</b>
                                                                    </Button>
                                                                )
                                                            }
                                                            <Button
                                                                type={`${_.isEmpty(_userToEdit) ? 'button' : 'submit'}`}
                                                                className={`border border-0 rounded-0 inverse ${_.isEmpty(_userToEdit) ? '' : '_edit'}`}
                                                                variant='outline-light'
                                                                onClick={(ev) => {
                                                                    if (_.isEmpty(_userToEdit)) {
                                                                        ev.preventDefault();
                                                                        _handleEdit();
                                                                    }
                                                                }}
                                                            >
                                                                <div className='buttonBorders'>
                                                                    <div className='borderTop'></div>
                                                                    <div className='borderRight'></div>
                                                                    <div className='borderBottom'></div>
                                                                    <div className='borderLeft'></div>
                                                                </div>
                                                                <span>
                                                                    {_.isEmpty(_userToEdit) ? 'Edit.' : 'Save Changes.'}
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </span>
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </SimpleBar>
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </Tab.Container>
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
}

export default Dashboard;