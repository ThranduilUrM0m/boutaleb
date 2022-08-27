import React, { useState, useRef } from 'react';
import { _useStore } from '../../store/store';
import {
    NavLink,
} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import logo from '../../logo.svg';
import ToLogin from './ToLogin';
import ToLogout from './ToLogout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import _ from 'lodash';

const Header = (props) => {
    const _user = _useStore((state) => state._user);

    const [_searchValue, setSearchValue] = useState('');
    const [_searchFocused, setSearchFocused] = useState(false);
    const [_showAccountDropdown, setShowAccountDropdown] = useState(false);
    const ref = useRef(null);

    const showDropdown = () => {
        setShowAccountDropdown(!_showAccountDropdown);
    }
    const hideDropdown = () => {
        setShowAccountDropdown(false);
    }

    return (
        <header className='sticky-top'>
            <Navbar key='xxl' collapseOnSelect expand='xxl'>
                <Container fluid>
                    <Navbar.Toggle aria-controls='offcanvasNavbar-expand-xxl'>
                        <span className='hamburger'>
                            <svg width='300' height='300' version='1.1' id='Layer_1' viewBox='-50 -50 100 100' preserveAspectRatio='none'>
                                <g strokeWidth='2' strokeLinecap='round' strokeMiterlimit='10'>
                                    <line className='one' x1='0' y1='20' x2='50' y2='20'></line>
                                    <line className='three' x1='0' y1='30' x2='50' y2='30'></line>
                                </g>
                            </svg>
                        </span>
                    </Navbar.Toggle>
                    <Navbar.Collapse id='responsive-navbar-nav' className='show'>
                        <Nav className='justify-content-end'>
                            <Nav.Item className='me-auto'>
                                <NavLink to='/' className='logo'>
                                    <img className='img-fluid' src={logo} alt='#' />
                                </NavLink>
                            </Nav.Item>
                            <Nav.Item>
                                <Form onClick={() => ref.current.focus()}>
                                    <Form.Group controlId='_searchControl' className={`_formGroup _searchGroup ${_searchFocused ? 'focused' : ''}`}>
                                        <Form.Control type='text' className='_formControl border border-0 rounded-0' name='_searchControl' value={_searchValue} onChange={(event) => setSearchValue(event.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} ref={ref} />
                                        <Form.Label className={`_formLabel ${_searchValue ? 'active' : ''}`}>Search.</Form.Label>
                                        {/* onClick={(event) => _handleSearch(event.target.value)} */}
                                        <div className='_searchButton'></div>
                                    </Form.Group>
                                </Form>
                            </Nav.Item>
                            <Nav.Item>
                                <Dropdown
                                    show={_showAccountDropdown}
                                    onMouseEnter={() => showDropdown()}
                                    onMouseLeave={() => hideDropdown()}>
                                    <Dropdown.Toggle as='span'>
                                        <span className='account'>
                                            <FontAwesomeIcon icon={faUser} />
                                            <span className='hover_effect'></span>
                                        </span>
                                    </Dropdown.Toggle>
                                    {
                                        _.isEmpty(_user) ? <ToLogin /> : <ToLogout />
                                    }
                                </Dropdown>
                            </Nav.Item>
                        </Nav>
                    </Navbar.Collapse>
                    <Navbar.Offcanvas
                        id='offcanvasNavbar-expand-xxl'
                        aria-labelledby='offcanvasNavbarLabel-expand-xxl'
                        placement='start'
                    >
                        <Offcanvas.Header />
                        <Offcanvas.Body className='d-flex flex-column justify-content-center'>
                            <Nav className='align-items-center'>
                                <Nav.Item className='text-center'>
                                    <Nav.Link
                                        as={NavLink}
                                        to='/'
                                        eventKey='0'
                                        className='nav-link d-flex align-items-center'
                                    >
                                        Home<b className='pink_dot'>.</b>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
        </header>
    );
}

export default Header;