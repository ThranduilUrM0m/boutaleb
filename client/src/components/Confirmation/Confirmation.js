import React, { useEffect, useState } from 'react';
import {
    useNavigate,
    useLocation,
    useParams
} from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import API from "../../utils/API";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRectangleXmark, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import _ from 'lodash';
import { io } from "socket.io-client";

const _socketURL = _.isEqual(process.env.NODE_ENV, 'production')
    ? window.location.hostname
    : 'localhost:8800';
const _socket = io(_socketURL, { 'transports': ['websocket', 'polling'] });

const Confirmation = (props) => {
    let location = useLocation();
    let navigate = useNavigate();
    let { token_id } = useParams();

    const [_showModal, setShowModal] = useState(true);
    const [_modalHeader, setModalHeader] = useState('');
    const [_modalBody, setModalBody] = useState('');
    const [_modalIcon, setModalIcon] = useState('');

    useEffect(() => {
        _confirmation(token_id);
    }, [token_id]);

    const _confirmation = async (token) => {
        await API.confirmation({ token })
            .then((res) => {
                setModalHeader('Hello ✔ and Welcome !');
                setModalBody(res.data.text);
                setModalIcon(<FontAwesomeIcon icon={faSquareCheck} />);
                _socket.emit('action', { type:'_userConfirmed', data: res.data._user });
            })
            .catch((error) => {
                setModalHeader('We\'re sorry !');
                setModalBody(error.response.data.text);
                setModalIcon(<FontAwesomeIcon icon={faRectangleXmark} />);
            });
    }

    const _handleClose = () => {
        setShowModal(false);
        navigate('/login', { replace: true, state: { from: location } });
    }

    return (
        <main className="_confirmation">
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
    )
}

export default Confirmation;