import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

const ToLogin = (props) => {
    return (
        <Dropdown.Menu className='border rounded-0'>
            <Dropdown.Item
                href='/login'
            >
                Login<b className='pink_dot'>.</b>
            </Dropdown.Item>
            <Dropdown.Item
                href='/signup'
            >
                Signup<b className='pink_dot'>.</b>
            </Dropdown.Item>
        </Dropdown.Menu>
    );
}

export default ToLogin;