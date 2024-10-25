// React Hooks
import { useCallback, useEffect } from 'react';

// Third-Party State Management
import _useStore from '../../store';

// HTTP Client
import axios from 'axios';

// Slider Component
import Slider from 'react-slick';

// Bootstrap Components
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

// Custom Components
import Inquiry from '../Parts/Inquiry';

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBezierCurve,
    faPenRuler,
    faQuoteLeft,
    faRoadBridge,
} from '@fortawesome/free-solid-svg-icons';
import {
    faCalendarCheck,
    faThumbsDown,
    faThumbsUp,
} from '@fortawesome/free-regular-svg-icons';

// Utility Libraries
import _ from 'lodash';
import $ from 'jquery';

const AboutUs = (props) => {
    const { testimonial } = _useStore();

    // Access your states and actions like this:
    const _testimonials = testimonial._testimonials;
    const setTestimonials = testimonial['_testimonials_SET_STATE'];

    const _sliderTestimonialsSettings1 = {
        dots: false,
        arrows: false,
        infinite:
            _.size(
                _.orderBy(
                    _.filter(_testimonials, (_t) => {
                        return !_t._testimonial_isPrivate && _t.Parent === null;
                    }),
                    ['_testimonial_upvotes'],
                    ['desc']
                )
            ) > 2,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        speed: 5000,
        autoplaySpeed: 0,
        pauseOnHover: false,
        cssEase: 'ease-in-out',
    };

    const _sliderTestimonialsSettings2 = {
        dots: false,
        arrows: false,
        infinite:
            _.size(
                _.orderBy(
                    _.filter(_testimonials, (_t) => {
                        return !_t._testimonial_isPrivate && _t.Parent === null;
                    }),
                    ['_testimonial_upvotes'],
                    ['desc']
                )
            ) > 6,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        speed: 5000,
        autoplaySpeed: 0,
        pauseOnHover: false,
        rtl: true,
        cssEase: 'ease-in-out',
    };

    const _getTestimonials = useCallback(async () => {
        try {
            axios('/api/testimonial')
                .then((response) => {
                    setTestimonials(response.data._testimonials);
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.log(error);
        }
    }, [setTestimonials]);

    const _typewriting = () => {
        $(function () {
            var typeText = $('[data-type]').attr('data-type');
            var period = $('[data-type]').attr('data-period');

            if (typeText) {
                new TypeWriter($('.typewrite'), typeText, period);
            }
        });
        function TypeWriter(element, typeText, period) {
            this.element = element;
            this.typeText = JSON.parse(typeText);
            this.period = parseInt(period, 10) || 2000;
            this.txt = '';
            this.currentTextIndex = 0;
            this.isDeleting = false;

            this.tick();
        }

        TypeWriter.prototype.tick = function () {
            var self = this;
            var currentIndex = self.currentTextIndex % self.typeText.length;
            var currentText = self.typeText[currentIndex];

            if (self.isDeleting) {
                self.txt = currentText.substring(0, self.txt.length - 1);
            } else {
                self.txt = currentText.substring(0, self.txt.length + 1);
            }

            self.element.find('.wrap').text(self.txt);

            var delta = 200 - Math.random() * 100;

            if (self.isDeleting) {
                delta /= 2;
            }

            if (!self.isDeleting && self.txt === currentText) {
                delta = self.period;
                self.isDeleting = true;
            } else if (self.isDeleting && self.txt === '') {
                self.isDeleting = false;
                self.currentTextIndex++;
                delta = 500;
            }

            setTimeout(function () {
                self.tick();
            }, delta);
        };
    };

    useEffect(() => {
        _typewriting();
        _getTestimonials();
    }, [_getTestimonials]);

    return (
        <main className='_aboutus'>
            <section className='_s1 d-flex align-items-end'>
                <div>
                    <h1>
                        <span>About</span>
                    </h1>
                    <h1 className='d-flex'>
                        <div
                            className='typewrite'
                            data-period='2000'
                            data-type={`[ 'boutaleb.', 'A Web Designer.', 'A Teacher.' ]`}
                        >
                            <span className='wrap'></span>
                            <span className='cursor'>_</span>
                        </div>
                    </h1>
                </div>
            </section >
            <section className='_s2 d-flex flex-column align-items-center justify-content-center'>
                <h1 className='mb-auto'>
                    What makes my work different<b className='pink_dot'>.</b>
                </h1>
                <Col
                    className='grid'
                    style={{
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gridTemplateRows: 'repeat(2, 1fr)',
                    }}
                >
                    <Card className='border border-0 rounded-0'>
                        <Card.Body className='d-flex align-items-center border border-0 rounded-0 no-shadow'>
                            <FontAwesomeIcon icon={faRoadBridge} />
                            <div className='d-flex flex-column'>
                                <span className='description'>
                                    Going Far and Delivering More
                                    <b className='pink_dot'>.</b>
                                </span>
                                <span className='foot'>
                                    Committed to going above and beyond. Delivering a reflection
                                    of your identity and resonating with your audience.
                                    <br />I strive to exceed by truly understanding your goals and
                                    requirements.
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className='border border-0 rounded-0'>
                        <Card.Body className='d-flex align-items-center border border-0 rounded-0 no-shadow'>
                            <FontAwesomeIcon icon={faBezierCurve} />
                            <div className='d-flex flex-column'>
                                <span className='description'>
                                    Simple and Easy<b className='pink_dot'>.</b>
                                </span>
                                <span className='foot'>
                                    I ensure not only minimalistic aesthetics but also
                                    user-friendly, easy to navigate, clean and intuitive designs,
                                    making it effortless for your visitors to interact with your
                                    content.
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className='border border-0 rounded-0'>
                        <Card.Body className='d-flex align-items-center border border-0 rounded-0 no-shadow'>
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            <div className='d-flex flex-column'>
                                <span className='description'>
                                    Committed Timelines
                                    <b className='pink_dot'>.</b>
                                </span>
                                <span className='foot'>
                                    I provide achievable timelines by breaking down the process
                                    into manageable stages. With continuous communication and
                                    collaboration, keeping you informed and providing
                                    opportunities for feedback and discussion.
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className='border border-0 rounded-0'>
                        <Card.Body className='d-flex align-items-center border border-0 rounded-0 no-shadow'>
                            <FontAwesomeIcon icon={faPenRuler} />
                            <div className='d-flex flex-column'>
                                <span className='description'>
                                    Tailored Solutions
                                    <b className='pink_dot'>.</b>
                                </span>
                                <span className='foot'>
                                    I offer customized solutions for your unique requirements,
                                    creating tailor-made solutions that align with your business
                                    objectives. Together, we will build a presence that stands out
                                    from the competition and drives your success.
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </section>
            <section className='_s3'>
                <h1 className='text-center'>
                    Words of praise from others
                    <br />
                    about our presence<b className='pink_dot'>.</b>
                </h1>
                <div className='_sliderTestimonials'>
                    <Slider {..._sliderTestimonialsSettings1}>
                        {_.map(
                            _.orderBy(
                                _.filter(_testimonials, (_t) => {
                                    return !_t._testimonial_isPrivate && _t.Parent === null;
                                }),
                                ['_testimonial_upvotes'],
                                ['desc']
                            ).slice(0, Math.min(4, _testimonials.length)),
                            (_testimonial, index) => {
                                return (
                                    <Card
                                        className={`border border-0 rounded-0 card_${index}`}
                                        key={index}
                                    >
                                        <Card.Body>
                                            <Form className='d-flex flex-column'>
                                                <FontAwesomeIcon icon={faQuoteLeft} />
                                                <span className='firstPhrase mb-auto'>
                                                    {_testimonial._testimonial_body}
                                                </span>
                                                <div className='_footerInformation d-flex'>
                                                    <span className='d-flex flex-column align-items-start text-muted _author'>
                                                        <p>{_testimonial._testimonial_author}</p>
                                                        <p>{_testimonial._testimonial_email}</p>
                                                    </span>
                                                    <p className='d-flex align-items-center text-muted _upvotes'>
                                                        <b>{_.size(_testimonial._testimonial_upvotes)}</b>
                                                        <FontAwesomeIcon icon={faThumbsUp} />
                                                    </p>
                                                    <p className='d-flex align-items-center text-muted _downvotes'>
                                                        <b>{_.size(_testimonial._testimonial_downvotes)}</b>
                                                        <FontAwesomeIcon icon={faThumbsDown} />
                                                    </p>
                                                </div>
                                                <div className='_shadowIndex'>
                                                    <p>
                                                        {_.head(
                                                            _testimonial._testimonial_author.split(/[\s.]+/)
                                                        ).length <= 2
                                                            ? _.head(
                                                                _testimonial._testimonial_author.split(
                                                                    /[\s.]+/
                                                                )
                                                            ) +
                                                            ' ' +
                                                            _.nth(
                                                                _testimonial._testimonial_author.split(
                                                                    /[\s.]+/
                                                                ),
                                                                1
                                                            )
                                                            : _.head(
                                                                _testimonial._testimonial_author.split(
                                                                    /[\s.]+/
                                                                )
                                                            )}
                                                        <b className='pink_dot'>.</b>
                                                    </p>
                                                </div>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                );
                            }
                        )}
                    </Slider>
                    <Slider {..._sliderTestimonialsSettings2}>
                        {_.map(
                            _.orderBy(
                                _.filter(_testimonials, (_t) => {
                                    return !_t._testimonial_isPrivate && _t.Parent === null;
                                }),
                                ['_testimonial_upvotes'],
                                ['desc']
                            ).slice(4, Math.min(4 * 2, _testimonials.length)),
                            (_testimonial, index) => {
                                return (
                                    <Card
                                        className={`border border-0 rounded-0 card_${index}`}
                                        key={index}
                                    >
                                        <Card.Body>
                                            <Form className='d-flex flex-column'>
                                                <FontAwesomeIcon icon={faQuoteLeft} />
                                                <span className='firstPhrase mb-auto'>
                                                    {_testimonial._testimonial_body}
                                                </span>
                                                <div className='_footerInformation d-flex'>
                                                    <span className='d-flex flex-column align-items-start text-muted _author'>
                                                        <p>{_testimonial._testimonial_author}</p>
                                                        <p>{_testimonial._testimonial_email}</p>
                                                    </span>
                                                    <p className='d-flex align-items-center text-muted _upvotes'>
                                                        <b>{_.size(_testimonial._testimonial_upvotes)}</b>
                                                        <FontAwesomeIcon icon={faThumbsUp} />
                                                    </p>
                                                    <p className='d-flex align-items-center text-muted _downvotes'>
                                                        <b>{_.size(_testimonial._testimonial_downvotes)}</b>
                                                        <FontAwesomeIcon icon={faThumbsDown} />
                                                    </p>
                                                </div>
                                                <div className='_shadowIndex'>
                                                    <p>
                                                        {_.head(
                                                            _testimonial._testimonial_author.split(/[\s.]+/)
                                                        ).length <= 2
                                                            ? _.head(
                                                                _testimonial._testimonial_author.split(
                                                                    /[\s.]+/
                                                                )
                                                            ) +
                                                            ' ' +
                                                            _.nth(
                                                                _testimonial._testimonial_author.split(
                                                                    /[\s.]+/
                                                                ),
                                                                1
                                                            )
                                                            : _.head(
                                                                _testimonial._testimonial_author.split(
                                                                    /[\s.]+/
                                                                )
                                                            )}
                                                        <b className='pink_dot'>.</b>
                                                    </p>
                                                </div>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                );
                            }
                        )}
                    </Slider>
                </div>
            </section>
            <Inquiry className={'_s4 grid'} />
        </main >
    );
};

export default AboutUs;
