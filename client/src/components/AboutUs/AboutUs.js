import { useCallback, useEffect } from 'react';
import { _useStore } from '../../store/store';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentAlt, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import _ from 'lodash';
import $ from 'jquery';

const AboutUs = (props) => {
    const _articles = _useStore((state) => state._articles);
    const setArticles = _useStore((state) => state.setArticles);

    const _getArticles = useCallback(
        async () => {
            try {
                axios('/api/article')
                    .then((response) => {
                        setArticles(response.data._articles);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setArticles]
    );

    const _typewriting = () => {
        $(document).ready(function () {
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
    }

    const _handleArticleJSONTOHTML = () => {
        const html = $.parseHTML(_.get(_.find(_articles, { '_article_title': 'boutaleb.' }), '_article_body'));
        $('._aboutus ._s3 ._figure').html($(html).find('img').first());
    }

    useEffect(() => {
        _typewriting();
        _getArticles();
    }, [_getArticles]);

    return (
        <main className='_aboutus'>
            <section className='_s1 d-flex align-items-end'>
                <div>
                    <h1>
                        <span>About</span>
                    </h1>
                    <h1 className='d-flex'>
                        <div className='typewrite' data-period='2000' data-type='[ "boutaleb.", "A Web Designer.", "A Teacher." ]'>
                            <span className='wrap'></span>
                            <span className='cursor'>_</span>
                        </div>
                    </h1>
                </div>
            </section>
            <section className='_s2 d-flex align-items-stretch'>
                <div className='d-flex flex-column align-items-start'>
                    <h2 className='mb-auto'>What makes my work different</h2>
                    <ul>
                        <li>
                            <h3>Going Far and Delivering More</h3>
                            <p>Committed to going above and beyond. Delivering a reflection of your identity and resonating with your audience.<br />I strive to exceed by truly understanding your goals and requirements.</p>
                        </li>
                        <li>
                            <h3>Simple and Easy</h3>
                            <p>I ensure not only minimalistic aesthetics but also user-friendly, easy to navigate, clean and intuitive designs, making it effortless for your visitors to interact with your content.</p>
                        </li>
                        <li>
                            <h3>Committed Timelines</h3>
                            <p>I provide achievable timelines by breaking down the process into manageable stages. With continuous communication and collaboration, keeping you informed and providing opportunities for feedback and discussion.</p>
                        </li>
                        <li>
                            <h3>Tailored Solutions for Your Success</h3>
                            <p>I offer customized solutions for your unique requirements, creating tailor-made solutions that align with your business objectives. Together, we will build a presence that stands out from the competition and drives your success.</p>
                        </li>
                    </ul>
                </div>
            </section>
        </main>
    );
}

export default AboutUs;