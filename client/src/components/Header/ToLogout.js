import React from 'react';
import { _useStore } from '../../store/store';
import {
    useNavigate,
    useLocation
} from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import API from '../../utils/API';
import _ from 'lodash';
import { io } from "socket.io-client";

const _socketURL = _.isEqual(process.env.NODE_ENV, 'production')
    ? window.location.hostname
    : 'localhost:8800';
const _socket = io(_socketURL, { 'transports': ['websocket', 'polling'] });

const ToLogout = (props) => {
    let location = useLocation();
    let navigate = useNavigate();

	const _user = _useStore((state) => state._user);
	const setUser = _useStore((state) => state.setUser);

    const _handleClick = async () => {
        await API.logout(_user)
			.then(() => {
                setUser({});
                _socket.emit('action', { type:'_userDisonnected', data: _user });
                navigate("/login", { replace: true, state: { from: location } });
			})
			.catch((error) => {
                console.log(error);
			});
    }

    return (
        <Dropdown.Menu className='border rounded-0'>
            {
                _.isEqual(location.pathname, '/dashboard') ?
                ''
                :
                <Dropdown.Item
                    href='/dashboard'
                >
                    Dashboard<b className='pink_dot'>.</b>
                </Dropdown.Item>
            }
            <Dropdown.Item
                href='/login'
                onClick={() => _handleClick()}
            >
                Logout<b className='pink_dot'>.</b>
            </Dropdown.Item>
        </Dropdown.Menu>
    );
}

export default ToLogout;