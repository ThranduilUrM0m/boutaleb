import React from 'react';
import Inquiry from '../Parts/Inquiry';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faDolly, faPencil, faRoute } from '@fortawesome/free-solid-svg-icons';
import { faHandshake } from '@fortawesome/free-regular-svg-icons';
import $ from 'jquery';

const Process = (props) => {
    return (
        <main className='_process'>
            <section className='_s1'>
                <Card className='border border-0 rounded-0'>
                    <Card.Body className='d-flex align-items-end'>
                        <FontAwesomeIcon icon={faCode} />
                        <h1>Let’s start a<br></br>project <span>together</span><b className='pink_dot'>.</b></h1>
                    </Card.Body>
                </Card>
            </section>
            <section className='_s2 d-flex align-items-end justify-content-center'>
                <Form className='d-flex flex-column align-items-center justify-content-center'>
                    <h1>We shape the products and<br></br>services that improve the lives of<br></br>millions every single day<b className='pink_dot'>.</b></h1>
                    <p>We do this by following a simple approach<b className='pink_dot'>.</b></p>
                    <Button
                        type='button'
                        className='border border-0 rounded-0 inverse w-25'
                        variant='outline-light'
                        onClick={() => { $([document.documentElement, document.body]).animate({ scrollTop: $('._s4').offset().top }, 0); $('input[name=\'_userNameInput\']').trigger('focus'); }}
                    >
                        <div className='buttonBorders'>
                            <div className='borderTop'></div>
                            <div className='borderRight'></div>
                            <div className='borderBottom'></div>
                            <div className='borderLeft'></div>
                        </div>
                        <span>
                            Reach Out<b className='pink_dot'>.</b>
                        </span>
                    </Button>
                </Form>
            </section>
            <section className='_s3 grid'>
                <FontAwesomeIcon icon={faHandshake} />
                <Row className='g-col-12 grid'>
                    <Col className='g-col-4'>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='1' className='border border-0 rounded-0 no-shadow'>
                                <Form className='d-flex flex-column align-items-start '>
                                    <FontAwesomeIcon icon={faRoute} />
                                    <span className='_title'>Strategy Phase<b className='pink_dot'>.</b></span>
                                    <span className='_description'>Laying the groundwork for the project. It involves listening to your needs, conducting research, and designing a plan to achieve your goals<b className='pink_dot'>.</b></span>
                                    <Button
                                        type='button'
                                        className='border border-0 rounded-0'
                                        variant='link'
                                        href='#'
                                    >
                                        Read More<b className='pink_dot'>.</b>

                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className='g-col-4'>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='1' className='border border-0 rounded-0 no-shadow'>
                                <Form className='d-flex flex-column align-items-start '>
                                    <FontAwesomeIcon icon={faPencil} />
                                    <span className='_title'>Creative Phase<b className='pink_dot'>.</b></span>
                                    <span className='_description'>The actual creation of the project takes place. It involves creating content, building the website, and testing it to ensure that it meets your requirements<b className='pink_dot'>.</b></span>
                                    <Button
                                        type='button'
                                        className='border border-0 rounded-0'
                                        variant='link'
                                        href='#'
                                    >
                                        Read More<b className='pink_dot'>.</b>

                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className='g-col-4'>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='1' className='border border-0 rounded-0 no-shadow'>
                                <Form className='d-flex flex-column align-items-start '>
                                    <FontAwesomeIcon icon={faDolly} />
                                    <span className='_title'>Launch Phase<b className='pink_dot'>.</b></span>
                                    <span className='_description'>Bringing the project to life. Integrating the website with other systems, launching it to the public, and providing training to ensure that it can be used effectively<b className='pink_dot'>.</b></span>
                                    <Button
                                        type='button'
                                        className='border border-0 rounded-0'
                                        variant='link'
                                        href='#'
                                    >
                                        Read More<b className='pink_dot'>.</b>

                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row className='g-col-12 d-flex flex-column align-items-center justify-content-center'>
                    <h1>How it works<b className='pink_dot'>.</b></h1>
                    <p>Building Your Vision, Step by Step<b className='pink_dot'>.</b></p>
                </Row>
                <Row className='g-col-12 grid'>
                    <Col className='g-col-6'>
                        <div data-shadow='1' className='_shadowIndex'><p>01<b className='pink_dot'>.</b></p></div>
                    </Col>
                    <Col className='g-col-6 grid' style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='1' className='_step d-flex flex-column border border-0 rounded-0 no-shadow'>
                                <span className='description align-self-start'>We study your business, set your business goals, and we determine what you want to achieve, the budget and the timeline.</span>
                                <span className='foot align-self-end mt-auto'>Listen<b className='pink_dot'>.</b></span>
                            </Card.Body>
                        </Card>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='2' className='_step d-flex flex-column border border-0 rounded-0 no-shadow'>
                                <span className='description align-self-start'>We analyze your product, we do an in-depth market analysis, competitors, targeted audience, and we We develop a strategy. We empower your business to, thrive, and make a lasting impact in your industry.</span>
                                <span className='foot align-self-end mt-auto'>Research<b className='pink_dot'>.</b></span>
                            </Card.Body>
                        </Card>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='3' className='_step d-flex flex-column border border-0 rounded-0 no-shadow'>
                                <span className='description align-self-start'>We come up with an effective branding that will help you stand out on the market, and an intuitive interface tha will increase the conversion of the website. We develop the structure and prototype, versions of the concept design, branding elements and so on.</span>
                                <span className='foot align-self-end mt-auto'>Design<b className='pink_dot'>.</b></span>
                            </Card.Body>
                        </Card>
                        <Card className='border border-0 rounded-0 _shapes _shapes-f'></Card>
                    </Col>
                </Row>
                <Row className='g-col-12 grid'>
                    <Col className='g-col-6 grid' style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='4' className='_step d-flex flex-column border border-0 rounded-0 no-shadow'>
                                <span className='description align-self-start'>We write content in accordance with the strategy you choose, we create infographics, illustrations and other graphic content that will help form your identity to your audience.</span>
                                <span className='foot align-self-end mt-auto'>Content<b className='pink_dot'>.</b></span>
                            </Card.Body>
                        </Card>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='5' className='_step d-flex flex-column border border-0 rounded-0 no-shadow'>
                                <span className='description align-self-start'>We create your website that can be open on all devices and browsers, and that can work reliably under heavy loads, we design the website's architecture, and upload the photos, videos, texts and all content.</span>
                                <span className='foot align-self-end mt-auto'>Website<b className='pink_dot'>.</b></span>
                            </Card.Body>
                        </Card>
                        <Card className='border border-0 rounded-0 _shapes _shapes-s'></Card>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='6' className='_step d-flex flex-column border border-0 rounded-0 no-shadow'>
                                <span className='description align-self-start'>We are creating a reliable tool, a website that will work fine on all devices and browsers, and so we conduct a number of tests, manual and automated.</span>
                                <span className='foot align-self-end mt-auto'>Testing<b className='pink_dot'>.</b></span>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className='g-col-6'>
                        <div data-shadow='2' className='_shadowIndex'><p>02<b className='pink_dot'>.</b></p></div>
                    </Col>
                </Row>
                <Row className='g-col-12 grid'>
                    <Col className='g-col-6'>
                        <div data-shadow='3' className='_shadowIndex'><p>03<b className='pink_dot'>.</b></p></div>
                    </Col>
                    <Col className='g-col-6 grid' style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='7' className='_step d-flex flex-column border border-0 rounded-0 no-shadow'>
                                <span className='description align-self-start'>For effective work of the website, we set up a web analytics system. we integrate the website with all tools necessary for marketing, payments systems, and other external services.</span>
                                <span className='foot align-self-end mt-auto'>Integration<b className='pink_dot'>.</b></span>
                            </Card.Body>
                        </Card>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='8' className='_step d-flex flex-column border border-0 rounded-0 no-shadow'>
                                <span className='description align-self-start'>With great care, we carry out a full-range approach to select and purchase the most appropriate domain, and configuration of hosting and publishing the website.</span>
                                <span className='foot align-self-end mt-auto'>Launch<b className='pink_dot'>.</b></span>
                            </Card.Body>
                        </Card>
                        <Card className='border rounded-0'>
                            <Card.Body data-step='9' className='_step d-flex flex-column border border-0 rounded-0 no-shadow'>
                                <span className='description align-self-start'>After launch we conduct on site technical training where we introduce you to the website and all its technical aspects.</span>
                                <span className='foot align-self-end mt-auto'>Training<b className='pink_dot'>.</b></span>
                            </Card.Body>
                        </Card>
                        <Card className='border border-0 rounded-0 _shapes _shapes-t'></Card>
                    </Col>
                </Row>
            </section>
            <Inquiry className={'_s4 grid'} />
        </main>
    );
}

export default Process;