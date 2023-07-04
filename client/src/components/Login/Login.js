import React, { useEffect, useState } from 'react';
import { _useStore } from '../../store/store';
import {
	useNavigate,
	useLocation
} from 'react-router-dom';
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
	let location = useLocation();
	let navigate = useNavigate();

	const _user = _useStore((state) => state._user);
	const setUser = _useStore((state) => state.setUser);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors }
	} = useForm({
		mode: 'onTouched',
		reValidateMode: 'onSubmit',
		reValidateMode: 'onChange'
	});

	const [_userEmailFocused, setUserEmailFocused] = useState(false);
	const [_userPasswordFocused, setUserPasswordFocused] = useState(false);

	const [_showModal, setShowModal] = useState(false);
	const [_modalHeader, setModalHeader] = useState('');
	const [_modalBody, setModalBody] = useState('');
	const [_modalIcon, setModalIcon] = useState('');

	useEffect(() => {
		if (!_.isEmpty(_user)) {
			navigate('/dashboard', { replace: true, state: { from: location } });
		}

		const subscription = watch((value, { name, type }) => {});

        return () => subscription.unsubscribe();
	}, [location, navigate, _user, watch]);

	const onSubmit = async (values) => {
		try {
			/* await api.login(values)
				.then((res) => {
					setUser(res.data._user);
					_socket.emit('action', { type: '_userConnected', data: res.data._user });
					navigate('/dashboard', { replace: true, state: { from: location } });
				})
				.catch((error) => {
					setModalHeader('We\'re sorry !');
					setModalBody(error.response.data.text);
					setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
					setShowModal(true);
				}); */
		} catch (error) {
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
									<Form.Group controlId='_userEmailInput' className={`_formGroup ${_userEmailFocused ? 'focused' : ''}`}>
										<FloatingLabel
											label='Email.'
											className='_formLabel'
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
												placeholder='Name.'
												autoComplete='new-password'
												type='text'
												className='_formControl border rounded-0'
												name='_userEmailInput'
												onFocus={() => setUserEmailFocused(true)}
											/>
											{errors._userEmailInput && (
												<Form.Text className='bg-danger text-white bg-opacity-75 rounded-1'>
													{errors._userEmailInput.message}
												</Form.Text>
											)}
										</FloatingLabel>
									</Form.Group>
								</Row>
								<Row className='g-col-12'>
									<Form.Group controlId='_userPasswordInput' className={`_formGroup ${_userPasswordFocused ? 'focused' : ''}`}>
										<FloatingLabel
											label='Password.'
											className='_formLabel'
										>
											<Form.Control
												{...register('_userPasswordInput', {
													required: 'Password missing.',
													pattern: {
														value: /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9_]{8,}$/i,
														message: 'At least 1 letter and 1 number.'
													},
													onBlur: () => { setUserPasswordFocused(false) }
												})}
												placeholder='Name.'
												autoComplete='new-password'
												type='password'
												className='_formControl border rounded-0'
												name='_userPasswordInput'
												onFocus={() => setUserPasswordFocused(true)}
											/>
											{errors._userPasswordInput && (
												<Form.Text className='bg-danger text-white bg-opacity-75 rounded-1'>
													{errors._userPasswordInput.message}
												</Form.Text>
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

export default Login;