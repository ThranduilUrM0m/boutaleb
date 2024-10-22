import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';

const PWallet = (props) => {
    const [_showModalIncome, setShowModalIncome] = useState(false);
    const [_showModalExpense, setShowModalExpense] = useState(false);
    const [_showModalLoan, setShowModalLoan] = useState(false);
    const [_showModalSaving, setShowModalSaving] = useState(false);

    return (
        <div className='_pane d-flex flex-column'>
            <div className='_header'></div>
            <div className='_body flex-grow-1'>
                <SimpleBar style={{ maxHeight: '100%' }} forceVisible='y' autoHide={false}>
                    <Container className='grid'>
                        <Card className='g-col-6'>
                            <Card.Body className='border border-0 no-shadow'>
                                <Button variant='link' onClick={() => setShowModalIncome(true)}>
                                    Income
                                </Button>

                                <Modal show={_showModalIncome} onHide={() => setShowModalIncome(false)} centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title></Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <h1>Manage Income</h1>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button
                                            type='button'
                                            className='border border-0 rounded-0 inverse w-50'
                                            variant='outline-light'
                                            onClick={() => setShowModalIncome(false)}
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
                                </Modal>
                            </Card.Body>
                        </Card>
                        <Card className='g-col-6'>
                            <Card.Body className='border border-0 no-shadow'>
                                <Button variant='link' onClick={() => setShowModalExpense(true)}>
                                    Expenses
                                </Button>

                                <Modal show={_showModalExpense} onHide={() => setShowModalExpense(false)} centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title></Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <h1>Manage Expenses</h1>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button
                                            type='button'
                                            className='border border-0 rounded-0 inverse w-50'
                                            variant='outline-light'
                                            onClick={() => setShowModalExpense(false)}
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
                                </Modal>
                            </Card.Body>
                        </Card>
                        <Card className='g-col-6'>
                            <Card.Body className='border border-0 no-shadow'>
                                <Button variant='link' onClick={() => setShowModalLoan(true)}>
                                    Loans
                                </Button>

                                <Modal show={_showModalLoan} onHide={() => setShowModalLoan(false)} centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title></Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <h1>Manage Loans</h1>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button
                                            type='button'
                                            className='border border-0 rounded-0 inverse w-50'
                                            variant='outline-light'
                                            onClick={() => setShowModalLoan(false)}
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
                                </Modal>
                            </Card.Body>
                        </Card>
                        <Card className='g-col-6'>
                            <Card.Body className='border border-0 no-shadow'>
                                <Button variant='link' onClick={() => setShowModalSaving(true)}>
                                    Savings
                                </Button>

                                <Modal show={_showModalSaving} onHide={() => setShowModalSaving(false)} centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title></Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <h1>Manage Savings</h1>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button
                                            type='button'
                                            className='border border-0 rounded-0 inverse w-50'
                                            variant='outline-light'
                                            onClick={() => setShowModalSaving(false)}
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
                                </Modal>
                            </Card.Body>
                        </Card>
                    </Container>
                </SimpleBar>
            </div>
        </div>
    );
}

export default PWallet;