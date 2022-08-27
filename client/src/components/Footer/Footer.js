import React from 'react';
import moment from 'moment';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faCopyright } from '@fortawesome/free-regular-svg-icons';

const Footer = (props) => {
    return (
        <footer className='fixed-bottom'>
            <Container fluid>
                <Row className='grid'>
                    <Col className='g-col-6'>
                        <ul className='list-inline'>
                            <li className='list-inline-item'>
                                <a href='https://www.instagram.com/boutaleblcoder/'>Instagram</a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='https://fb.me/boutaleblcoder'>Facebook</a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='https://www.behance.net/boutaleblcoder/'>Behance</a>
                            </li>
                            <li className='list-inline-item'>
                                <FontAwesomeIcon icon={faCopyright} />
                                <span>{moment().format('YYYY')}</span> - With <FontAwesomeIcon icon={faHeart} /> from Zakariae boutaleb.
                            </li>
                        </ul>
                    </Col>
                    <Col className='g-col-6 d-flex justify-content-end'>
                        <ul className='list-inline'>
                            <li className='list-inline-item'>
                                <a href='# '>Legal Notice</a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='# '>Newsroom</a>
                            </li>
                            <li className='list-inline-item'>
                                <span className='name'>Zakariae.</span>
                            </li>
                        </ul>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;