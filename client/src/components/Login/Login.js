import React, { useCallback, useEffect, useState } from 'react';
import { _useStore } from '../../store/store';
import {
	useNavigate,
	useLocation
} from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRectangleXmark } from '@fortawesome/free-regular-svg-icons';
import _ from 'lodash';
import { io } from 'socket.io-client';

const _socketURL = _.isEqual(process.env.NODE_ENV, 'production')
	? window.location.hostname
	: 'localhost:8800';
const _socket = io(_socketURL, { 'transports': ['websocket', 'polling'] });

const Login = (props) => {
	const _userIsAuthenticated = _useStore((state) => state._userIsAuthenticated);
	const setUserIsAuthenticated = _useStore((state) => state.setUserIsAuthenticated);
	const setUser = _useStore((state) => state.setUser);

	let location = useLocation();
	let navigate = useNavigate();

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors }
	} = useForm({
		mode: 'onTouched',
		reValidateMode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: {
			_user_identification: '',
			_user_password: '',
		}
	});

	const [_userIdentificationFocused, setUserIdentificationFocused] = useState(false);
	const [_userPasswordFocused, setUserPasswordFocused] = useState(false);

	const [_showModal, setShowModal] = useState(false);
	const [_modalHeader, setModalHeader] = useState('');
	const [_modalBody, setModalBody] = useState('');
	const [_modalIcon, setModalIcon] = useState('');

	const checkAuthentication = useCallback(async () => {
		try {
			// Check if the token is valid by calling the new endpoint
			const response = await axios.get('/api/user/_checkToken', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});

			if (response.status === 200) {
				// User is authenticated, set the state and redirect to a certain page
				setUserIsAuthenticated(true);
				navigate('/dashboard', { replace: true, state: { from: location } });
			}
		} catch (error) {
			// User is not authenticated or an error occurred, handle the case accordingly
			// For example, you can ignore the error if the status is 401 (Unauthorized)
			if (error.response && error.response.status !== 401) {
				console.error('FUCK YOU, LOGIN YOU BASTARD');
			}
		}
	}, [setUserIsAuthenticated, navigate, location]);

	useEffect(() => {
		checkAuthentication();

		const subscription = watch((value, { name, type }) => { });
		return () => subscription.unsubscribe();
	}, [checkAuthentication, watch]);

	const onSubmit = async (values) => {
		try {
			return axios.post('/api/user/_login', values)
				.then((response) => {
					// Store the token in local storage
					localStorage.setItem('jwtToken', response.data.token);

					setUser(response.data._user);
					setUserIsAuthenticated(true);
					_socket.emit('action', { type: '_userConnected', data: response.data._user });
					navigate('/dashboard', { replace: true, state: { from: location } });
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
	}

	const onError = (error) => {
		setModalHeader('We\'re sorry !');
		setModalBody(error);
		setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
		setShowModal(true);
	};

	const _toSignup = async (event) => {
		event.preventDefault();
		navigate('/signup', { replace: true, state: { from: location } });
	}

	return (
		<main className='_login'>
			<section className='grid'>
				<div className='g-col-6 d-flex justify-content-center align-items-center'>
					<Card className='border border-0 rounded-0'>
						<Card.Header className='rounded-0'>
							<h3>Login<b className='pink_dot'>.</b></h3>
						</Card.Header>
						<Card.Body>
							<Form onSubmit={handleSubmit(onSubmit, onError)} className='grid'>
								<Row className='g-col-12'>
									<Form.Group controlId='_user_identification' className={`_formGroup ${_userIdentificationFocused ? 'focused' : ''}`}>
										<FloatingLabel
											label='Email Or Username.'
											className='_formLabel'
										>
											<Form.Control
												{...register('_user_identification', {
													required: 'Identification missing.',
													pattern: {
														value: /^(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}|[a-zA-Z0-9_]{3,20})$/i,
														message: 'Identification invalid.'
													},
													onBlur: () => { setUserIdentificationFocused(false) }
												})}
												placeholder='Email Or Username.'
												autoComplete='new-password'
												type='text'
												className='_formControl border rounded-0'
												name='_user_identification'
												onFocus={() => setUserIdentificationFocused(true)}
											/>
											{
												errors._user_identification && (
													<Form.Text className='bg-danger text-white bg-opacity-75 rounded-1'>
														{errors._user_identification.message}
													</Form.Text>
												)
											}
											{
												!_.isEmpty(watch('_user_identification')) && (
													<div className='_formClear'
														onClick={() => {
															reset({
																_user_identification: ''
															});
														}}
													></div>
												)
											}
										</FloatingLabel>
									</Form.Group>
								</Row>
								<Row className='g-col-12'>
									<Form.Group controlId='_user_password' className={`_formGroup ${_userPasswordFocused ? 'focused' : ''}`}>
										<FloatingLabel
											label='Password.'
											className='_formLabel'
										>
											<Form.Control
												{...register('_user_password', {
													required: 'Password missing.',
													pattern: {
														value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]{8,}$/,
														message: 'At least 1 upper and 1 lowercase letter, 1 number and 1 symbol.'
													},
													onBlur: () => { setUserPasswordFocused(false) }
												})}
												placeholder='Password.'
												autoComplete='new-password'
												type='password'
												className='_formControl border rounded-0'
												name='_user_password'
												onFocus={() => setUserPasswordFocused(true)}
											/>
											{
												errors._user_password && (
													<Form.Text className='bg-danger text-white bg-opacity-75 rounded-1'>
														{errors._user_password.message}
													</Form.Text>
												)
											}
											{
												!_.isEmpty(watch('_user_password')) && (
													<div className='_formClear'
														onClick={() => {
															reset({
																_user_password: ''
															});
														}}
													></div>
												)
											}
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
							<h4>Signup<b className='pink_dot'>.</b></h4>
						</Card.Header>
						<Card.Body className='rounded-0'>
							<Form className='d-flex flex-column justify-content-center align-items-start' onSubmit={(event) => _toSignup(event)}>
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
					<Modal.Body className='text-muted'><pre>{_modalBody}</pre></Modal.Body>
					<Modal.Footer>
						{_modalIcon}
						<Button className='border border-0 rounded-0 inverse w-50' variant='outline-light' onClick={() => setShowModal(false)}>
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

export default Login;