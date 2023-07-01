import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import $ from 'jquery';

//The illustrations in the cards needs to be changed
//The cards themselves needs to show more cause it's too empty
const Process = (props) => {
    return (
        <main className='_process'>
            <section className='_s1 d-flex align-items-end'>
                <h1>Let’s start a<br></br>project <span>together</span></h1>
            </section>
            <section className='_s2 d-flex align-items-end justify-content-center'>
                <Form className='d-flex flex-column align-items-center justify-content-center'>
                    <h1>We shape the products and<br></br>services that improve the lives of<br></br>millions every single day.</h1>
                    <p>We do this by following a simple approach.</p>
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
                <div className='g-col-4 d-flex align-items-center justify-content-center'>
                    <div data-step='1' className='_step d-flex flex-column'>
                        <span className='number align-self-end'>01<b className='pink_dot'>.</b></span>
                        <span className='title align-self-end'>Strategy phase</span>
                        <span className='description mt-auto'>We study your business, set your business goals, and we determine what you want to achieve, the budget and the timeline.</span>
                        <span className='foot'>Listen<b className='pink_dot'>.</b></span>
                    </div>
                </div>
                <div className='g-col-4 d-flex align-items-center justify-content-center'>
                    <div data-step='2' className='_step d-flex flex-column'>
                        <span className='number align-self-end'>02<b className='pink_dot'>.</b></span>
                        <span className='title align-self-end'>Strategy phase</span>
                        <span className='description mt-auto'>We analyze your product, we do an in-depth market analysis, competitors, targeted audience, and we We develop a strategy. We empower your business to, thrive, and make a lasting impact in your industry.</span>
                        <span className='foot'>Research<b className='pink_dot'>.</b></span>
                    </div>
                </div>
                <div className='g-col-4 d-flex align-items-center justify-content-center'>
                    <div data-step='3' className='_step d-flex flex-column'>
                        <span className='number align-self-end'>03<b className='pink_dot'>.</b></span>
                        <span className='title align-self-end'>Strategy phase</span>
                        <span className='description mt-auto'>We come up with an effective branding that will help you stand out on the market, and an intuitive interface tha will increase the conversion of the website. We develop the structure and prototype, versions of the concept design, branding elements and so on.</span>
                        <span className='foot'>Design<b className='pink_dot'>.</b></span>
                    </div>
                </div>
            </section>
            <section className='_s4 grid'>
                <div className='g-col-4 d-flex align-items-center justify-content-center'>
                    <div data-step='4' className='_step d-flex flex-column'>
                        <span className='number align-self-end'>04<b className='pink_dot'>.</b></span>
                        <span className='title align-self-end'>Creative phase</span>
                        <span className='description mt-auto'>We write content in accordance with the strategy you choose, we create infographics, illustrations and other graphic content that will help form your identity to your audience.</span>
                        <span className='foot'>Content<b className='pink_dot'>.</b></span>
                    </div>
                </div>
                <div className='g-col-4 d-flex align-items-center justify-content-center'>
                    <div data-step='5' className='_step d-flex flex-column'>
                        <span className='number align-self-end'>05<b className='pink_dot'>.</b></span>
                        <span className='title align-self-end'>Creative phase</span>
                        <span className='description mt-auto'>We create your website that can be open on all devices and browsers, and that can work reliably under heavy loads, we design the website's architecture, and upload the photos, videos, texts and all content.</span>
                        <span className='foot'>Website<b className='pink_dot'>.</b></span>
                    </div>
                </div>
                <div className='g-col-4 d-flex align-items-center justify-content-center'>
                    <div data-step='6' className='_step d-flex flex-column'>
                        <span className='number align-self-end'>06<b className='pink_dot'>.</b></span>
                        <span className='title align-self-end'>Creative phase</span>
                        <span className='description mt-auto'>We are creating a reliable tool, a website that will work fine on all devices and browsers, and so we conduct a number of tests, manual and automated.</span>
                        <span className='foot'>Testing<b className='pink_dot'>.</b></span>
                    </div>
                </div>
            </section>
            <section className='_s5 grid'>
                <div className='g-col-4 d-flex align-items-center justify-content-center'>
                    <div data-step='7' className='_step d-flex flex-column'>
                        <span className='number align-self-end'>07<b className='pink_dot'>.</b></span>
                        <span className='title align-self-end'>Launch phase</span>
                        <span className='description mt-auto'>For effective work of the website, we set up a web analytics system. we integrate the website with all tools necessary for marketing, payments systems, and other external services.</span>
                        <span className='foot'>Integration<b className='pink_dot'>.</b></span>
                    </div>
                </div>
                <div className='g-col-4 d-flex align-items-center justify-content-center'>
                    <div data-step='8' className='_step d-flex flex-column'>
                        <span className='number align-self-end'>08<b className='pink_dot'>.</b></span>
                        <span className='title align-self-end'>Launch phase</span>
                        <span className='description mt-auto'>With great care, we carry out a full-range approach to select and purchase the most appropriate domain, and configuration of hosting and publishing the website.</span>
                        <span className='foot'>Launch<b className='pink_dot'>.</b></span>
                    </div>
                </div>
                <div className='g-col-4 d-flex align-items-center justify-content-center'>
                    <div data-step='9' className='_step d-flex flex-column'>
                    <span className='number align-self-end'>09<b className='pink_dot'>.</b></span>
                        <span className='title align-self-end'>Launch phase</span>
                        <span className='description mt-auto'>After launch we conduct on site technical training where we introduce you to the website and all its technical aspects.</span>
                        <span className='foot'>Training<b className='pink_dot'>.</b></span>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Process;