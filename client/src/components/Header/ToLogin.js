import React from 'react';
import {
    useLocation
} from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import _ from 'lodash';

const ToLogin = (props) => {
    let location = useLocation();

    return (
        <Dropdown.Menu className='border rounded-0'>
            {
                _.isEqual(location.pathname, '/login') ?
                ''
                :
                <Dropdown.Item
                    href='/login'
                >
                    Login<b className='pink_dot'>.</b>
                </Dropdown.Item>
            }
            {
                _.isEqual(location.pathname, '/signup') ?
                ''
                :
                <Dropdown.Item
                    href='/signup'
                >
                    Signup<b className='pink_dot'>.</b>
                </Dropdown.Item>
            }
        </Dropdown.Menu>
    );
}

export default ToLogin;