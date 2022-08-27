import React, { useEffect, useState } from 'react';
import { _useStore } from '../../store/store';
import {
	useNavigate,
	useLocation
} from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import API from '../../utils/API';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRectangleXmark, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import _ from 'lodash';
import { io } from "socket.io-client";

const _socketURL = _.isEqual(process.env.NODE_ENV, 'production')
	? window.location.hostname
	: 'localhost:8800';
const _socket = io(_socketURL, { 'transports': ['websocket', 'polling'] });

const Signup = (props) => {
	const fpPromise = FingerprintJS.load();

	let location = useLocation();
	let navigate = useNavigate();

	const _user = _useStore((state) => state._user);

	const [_userEmailValue, setUserEmailValue] = useState('');
	const [_userEmailFocused, setUserEmailFocused] = useState(false);
	const [_userUsernameValue, setUserUsernameValue] = useState('');
	const [_userUsernameFocused, setUserUsernameFocused] = useState(false);
	const [_userPasswordValue, setUserPasswordValue] = useState('');
	const [_userPasswordFocused, setUserPasswordFocused] = useState(false);
	const [_userPasswordConfirmValue, setUserPasswordConfirmValue] = useState('');
	const [_userPasswordConfirmFocused, setUserPasswordConfirmFocused] = useState(false);

	const [_showModal, setShowModal] = useState(false);
	const [_modalHeader, setModalHeader] = useState('');
	const [_modalBody, setModalBody] = useState('');
	const [_modalIcon, setModalIcon] = useState('');

	useEffect(() => {
		if (!_.isEmpty(_user)) {
			navigate('/dashboard', { replace: true, state: { from: location } });
		}
	}, [location, navigate, _user]);

	const _handleClose = () => {
		setShowModal(false);
	}

	const _handleShow = () => {
		setShowModal(true);
	}

	const _signup = async (event) => {
		const fp = await fpPromise;
		const result = await fp.get();
		let _fingerprint = result.visitorId;

		event.preventDefault();
		try {
			if (_userPasswordValue !== _userPasswordConfirmValue) throw new Error('Please check your password confirmation');
			await API.signup({ _userEmailValue, _userUsernameValue, _userPasswordValue, _fingerprint })
				.then((res) => {
					setUserEmailValue('');
					setUserUsernameValue('');
					setUserPasswordValue('');
					setUserPasswordConfirmValue('');
					setModalHeader('Hello ✔ and Welcome !');
					setModalBody('We have sent you a verification email, all you have to do next is just click the link in the email and boom you are one of us now.');
					setModalIcon(<FontAwesomeIcon icon={faSquareCheck} />);
					_handleShow();
					_socket.emit('action', { type:'_userCreated', data: res.data._user });
				})
				.catch((error) => {
					setModalHeader('We\'re sorry !');
					setModalBody(error.response.data.text);
					setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
					_handleShow();
				});
		} catch (error) {
			setModalHeader('We\'re sorry !');
			setModalBody(JSON.stringify(error));
			setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
			_handleShow();
		}
	}

	const _toLogin = async (event) => {
		event.preventDefault();
		navigate('/login', { replace: true, state: { from: location } });
	}

	return (
		<main className='_signup'>
			<section className='grid'>
				<div className='g-col-6 d-flex justify-content-center align-items-center'>
					<Card className='border border-0 rounded-0'>
						<Card.Header className='rounded-0'>
							<h4>Login<b className='pink_dot'>.</b></h4>
						</Card.Header>
						<Card.Body>
							<Form className='d-flex flex-column justify-content-center align-items-start' onSubmit={(event) => _toLogin(event)}>
								<h6>Welcome to boutaleb.</h6>
								<p>To speak louder.</p>
								<Button
									type='submit'
									className='border border-0 rounded-0'
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
							</Form>
						</Card.Body>
					</Card>
				</div>
				<div className='g-col-6 d-flex justify-content-center align-items-center'>
					<Card className='border border-0 rounded-0'>
						<Card.Header className='rounded-0'>
							<h3>Signup<b className='pink_dot'>.</b></h3>
						</Card.Header>
						<Card.Body>
							<Form>
								<Form.Group controlId='_userEmailInput' className={`_formGroup ${_userEmailFocused ? 'focused' : ''}`}>
									<Form.Control autoComplete='new-password' type='email' className='_formControl border border-0 rounded-0' name='_userEmailInput' value={_userEmailValue} onChange={(event) => setUserEmailValue(event.target.value)} onFocus={() => setUserEmailFocused(true)} onBlur={() => setUserEmailFocused(false)} />
									<Form.Label className={`_formLabel ${_userEmailValue ? 'active' : ''}`}>
										Email.
									</Form.Label>
								</Form.Group>
								<Form.Group controlId='_userUsernameInput' className={`_formGroup ${_userUsernameFocused ? 'focused' : ''}`}>
									<Form.Control autoComplete='new-password' type='text' className='_formControl border border-0 rounded-0' name='_userUsernameInput' value={_userUsernameValue} onChange={(event) => setUserUsernameValue(event.target.value)} onFocus={() => setUserUsernameFocused(true)} onBlur={() => setUserUsernameFocused(false)} />
									<Form.Label className={`_formLabel ${_userUsernameValue ? 'active' : ''}`}>
										Username.
									</Form.Label>
								</Form.Group>
								<Form.Group controlId='_userPasswordInput' className={`_formGroup ${_userPasswordFocused ? 'focused' : ''}`}>
									<Form.Control autoComplete='new-password' type='password' className='_formControl border border-0 rounded-0' name='_userPasswordInput' value={_userPasswordValue} onChange={(event) => setUserPasswordValue(event.target.value)} onFocus={() => setUserPasswordFocused(true)} onBlur={() => setUserPasswordFocused(false)} />
									<Form.Label className={`_formLabel ${_userPasswordValue ? 'active' : ''}`}>
										Password.
									</Form.Label>
								</Form.Group>
								<Form.Group controlId='_userPasswordConfirmInput' className={`_formGroup ${_userPasswordConfirmFocused ? 'focused' : ''}`}>
									<Form.Control autoComplete='new-password' type='password' className='_formControl border border-0 rounded-0' name='_userPasswordConfirmInput' value={_userPasswordConfirmValue} onChange={(event) => setUserPasswordConfirmValue(event.target.value)} onFocus={() => setUserPasswordConfirmFocused(true)} onBlur={() => setUserPasswordConfirmFocused(false)} />
									<Form.Label className={`_formLabel ${_userPasswordConfirmValue ? 'active' : ''}`}>
										Confirm your Password.
									</Form.Label>
								</Form.Group>
								<Button
									type='button'
									className='border border-0 rounded-0'
									variant='outline-light'
									onClick={(event) => _signup(event)}
								>
									<div className='buttonBorders'>
										<div className='borderTop'></div>
										<div className='borderRight'></div>
										<div className='borderBottom'></div>
										<div className='borderLeft'></div>
									</div>
									<span>
										signup<b className='pink_dot'>.</b>
									</span>
								</Button>
							</Form>
						</Card.Body>
					</Card>
				</div>
			</section>

			<Modal show={_showModal} onHide={() => _handleClose()} centered>
				<Form>
					<Modal.Header closeButton>
						<Modal.Title>{_modalHeader}</Modal.Title>
					</Modal.Header>
					<Modal.Body className='text-muted'>{_modalBody}</Modal.Body>
					<Modal.Footer>
						{_modalIcon}
						<Button className='border border-0 rounded-0 inverse' variant='outline-light' onClick={() => _handleClose()}>
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

export default Signup;