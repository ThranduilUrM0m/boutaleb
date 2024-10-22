import React, { useCallback, useEffect } from 'react';
import {
    Link
} from 'react-router-dom';
import _useStore from '../../store';
import axios from 'axios';
import Moment from 'react-moment';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Inquiry from '../Parts/Inquiry';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot, faIcons } from '@fortawesome/free-solid-svg-icons';
import { faObjectGroup } from '@fortawesome/free-regular-svg-icons';
import { faJs } from '@fortawesome/free-brands-svg-icons'
import _ from 'lodash';
import $ from 'jquery';

const Home = (props) => {
    const _articles = _useStore.useArticleStore(state => state._articles);
    const setArticles = _useStore.useArticleStore(state => state['_articles_SET_STATE']);
    const _projects = _useStore.useProjectStore(state => state._projects);
    const setProjects = _useStore.useProjectStore(state => state['_projects_SET_STATE']);

    const _sliderProjectsSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        arrows: false,
        onInit: () => {
            $('._sliderProjects ._shadowIndex p').html('01');
        },
        beforeChange: (current, next) => {
            next < 9
                ? $('._sliderProjects ._shadowIndex p').html('0' + (next + 1))
                : $('._sliderProjects ._shadowIndex p').html('' + (next + 1));
        }
    };

    const _sliderArticlesSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        arrows: false,
        onInit: () => {
            _handleArticleJSONTOHTML(_articles, 0);
        },
        beforeChange: (current, next) => {
            _handleArticleJSONTOHTML(_articles, next);
        }
    };

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

    const _getProjects = useCallback(
        async () => {
            try {
                axios('/api/project')
                    .then((response) => {
                        setProjects(response.data._projects);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setProjects]
    );

    const _handleWords = useCallback(
        async () => {
            setTimeout(() => {
                _.forEach($('svg.word'), (word) => {
                    let svg = $(word);
                    let text = svg.find('text');
                    let bbox = text.get(0).getBBox();

                    svg.get(0).setAttribute('viewBox',
                        [
                            bbox.x,
                            bbox.y,
                            bbox.width,
                            bbox.height
                        ].join(' '));
                });
            }, 100);
        },
        []
    );

    const _handleJSONTOHTML = (_image, index) => {
        const html = $.parseHTML(_image);
        $('._sliderProjects .card_' + index + ' ._projectImage').html(html);
    }

    const _handleArticleJSONTOHTML = (__articles, __index) => {
        const __article = _.orderBy(_.filter(__articles, (_a) => !_a._article_isPrivate), ['_article_views'], ['desc'])[__index];
        
        if (__article && __article._article_body) {
            const _i = __index + 1;
            const html = $.parseHTML(__article._article_body);
            $('._home ._s2 ._figure').html($(html).find('img').first());
            $('._number p').html(_i < 10 ? '0' + _i : '' + _i);
            $('._number p').attr('data-text', _i < 10 ? '0' + _i : '' + _i);
        }
    }

    useEffect(() => {
        _getArticles();
        _getProjects();
        _handleWords();

        $('._home ._s3').on('mousemove', (event) => {
            let width = $('._home ._s3').width() / 2;
            let height = $('._home ._s3').height() / 2;
            let amountMovedX = ((width - event.pageX) * -1 / 12);
            let amountMovedY = ((height - event.pageY) * -1 / 12);

            $('._home ._s3 ._shadowIndex').css('marginLeft', amountMovedX);
            $('._home ._s3 ._shadowIndex').css('marginTop', amountMovedY);
        });

        $('._home ._s4').on('mousemove', (event) => {
            let width = $('._home ._s4').width() / 2;
            let amountMovedX = ((width - event.pageX) * 1 / 64);

            $('._home ._s4 .before').css('marginLeft', amountMovedX);
        });
    }, [_getArticles, _getProjects, _handleWords]);

    return (
        <main className='_home'>
            <section className='_s1 grid'>
                <div className='Hello'>
                    <svg className='word w1'>
                        <text>مرحبا</text>
                    </svg>
                    <svg className='word w2'>
                        <text>Welcome</text>
                    </svg>
                    <svg className='word w3'>
                        <text>Bienvenue</text>
                    </svg>
                    <svg className='word w4'>
                        <text>Chào mừng</text>
                    </svg>
                    <svg className='word w5'>
                        <text>Bienvenido</text>
                    </svg>
                </div>
                <div className='g-col-7 align-self-end'>
                    <Form className='d-flex flex-column'>
                        <div className='name'>
                            <p>ZAKARIAE</p><p>BOUTALEB</p>
                        </div>
                        <div>
                            <p>A Full-Stack Developer & a Graphic Designer<b className='pink_dot'>.</b></p>
                            <p>Based in <b className='web'>Morocco<b className='pink_dot'>.</b></b></p>
                        </div>
                        <Button
                            type='button'
                            className='border border-0 rounded-0 inverse w-25'
                            variant='outline-light'
                            onClick={() => { $([document.documentElement, document.body]).animate({ scrollTop: $('._s4').offset().top }, 0); }}
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
                </div>
                <div className='g-col-5 align-self-center'>
                    <div className='_sliderProjects'>
                        <div className='_title'>
                            <p>Some of My Projects.</p>
                        </div>
                        <Slider {..._sliderProjectsSettings}>
                            {
                                _.map((_.orderBy(_.filter(_projects, (_p) => { return !_p._project_toDisplay }), ['_project_view'], ['desc']).slice(0, 10)), (_project, index) => {
                                    return (
                                        <Card className={`border border-0 rounded-0 card_${index}`} key={index}>
                                            <Card.Body>
                                                <Link
                                                    to={_project._project_link}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                >
                                                    <div className='_projectImage'>
                                                        {_handleJSONTOHTML(_project._project_image, index)}
                                                    </div>
                                                </Link>
                                                {
                                                    !_.isEmpty(_project._project_teams) && (
                                                        <p className='text-muted author'>by <b>{_.join(_.map(_project._project_teams, 'Team._team_title'), ', ')}</b>, {<Moment local fromNow>{_project.updatedAt}</Moment>}</p>
                                                    )
                                                }
                                            </Card.Body>
                                        </Card>
                                    )
                                })
                            }
                        </Slider>
                        <div className='_shadowIndex d-flex'><p></p><b className='pink_dot'>.</b></div>
                        <div className='_dotsPattern'></div>
                    </div>
                </div>
            </section>
            <section className='_s2 grid'>
                <div className='g-col-5'>
                    <figure className='_figure'></figure>
                </div>
                <div className='g-col-7 align-self-end'>
                    <div className='_sliderArticles'>
                        {
                            !_.isEmpty(_articles) && (
                                <Slider {..._sliderArticlesSettings}>
                                    {
                                        _.map(_.orderBy(_.filter(_articles, (_a) => { return !_a._article_isPrivate }), ['_article_views'], ['desc']).slice(0, 10), (_article, index) => {
                                            return (
                                                <Card className={`border border-0 rounded-0 card_${index}`} key={index}>
                                                    <div className='borderTop'></div>
                                                    <div className='borderRight'></div>
                                                    <div className='borderBottom'></div>
                                                    <div className='borderLeft'></div>
                                                    <Card.Body className='no-shadow'>
                                                        <Form className='d-flex flex-column'>
                                                            <span className='text-muted category_author mb-auto'>{_article._article_category}</span>
                                                            {/* Modify the bodies in mongodb, those articles aren't kinda fit to have an intriguing first phrase */}
                                                            {/* And figure out either; get the first paragraphe, and modify the articles to fit into that, or get the first phrases just enough to fill 3 lines */}
                                                            <span className='firstPhrase'>{_.slice(_.split(_.trim($(_article._article_body).find('span').text()), /\./g), 0, 1)}</span>
                                                            <h2 className='align-self-start'>{_article._article_title}<br />by <span>{_.isEmpty(_article._article_author._user_lastname) && _.isEmpty(_article._article_author._user_firstname) ? _article._article_author._user_username : (!_.isEmpty(_article._article_author._user_lastname) ? _article._article_author._user_lastname + ' ' + _article._article_author._user_firstname : _article._article_author._user_firstname)}</span></h2>
                                                            <Button
                                                                type='button'
                                                                className='border border-0 rounded-0 inverse w-25 align-self-end'
                                                                variant='outline-light'
                                                                href={`/blog/${_article._id}`}
                                                            >
                                                                <div className='buttonBorders'>
                                                                    <div className='borderTop'></div>
                                                                    <div className='borderRight'></div>
                                                                    <div className='borderBottom'></div>
                                                                    <div className='borderLeft'></div>
                                                                </div>
                                                                <span>
                                                                    Read More About it<b className='pink_dot'>.</b>
                                                                </span>
                                                            </Button>
                                                            <span className='text-muted information align-self-end'><b>{_.size(_article._article_views)}</b> Views <FontAwesomeIcon icon={faCircleDot} /> {<Moment local fromNow>{_article.updatedAt}</Moment>}</span>
                                                            <div className='_shadowIndex'><p>{_.head(_article._article_title.split(/[\s.]+/)).length <= 2 ? _.head(_article._article_title.split(/[\s.]+/)) + ' ' + _.nth(_article._article_title.split(/[\s.]+/), 1) : _.head(_article._article_title.split(/[\s.]+/))}<b className='pink_dot'>.</b></p></div>
                                                        </Form>
                                                    </Card.Body>
                                                </Card>
                                            )
                                        })
                                    }
                                </Slider>
                            )
                        }
                        <div className='_shadowIndex _number d-flex' data-text=''><p></p><b className='pink_dot'>.</b></div>
                        <div className='_shadowIndex _number d-flex _outlined' data-text=''><p></p><b className='pink_dot'>.</b></div>
                    </div>
                </div>
            </section>
            <section className='_s3 grid'>
                <Card className='border border-0 rounded-0'>
                    <Card.Body className='grid'>
                        <div className='g-col-4 d-flex flex-column'>
                            <div className='_head d-flex flex-column align-items-center'>
                                <FontAwesomeIcon icon={faJs} />
                                <h5>Web Development<b className='pink_dot'>.</b></h5>
                            </div>
                            <div className='_content d-flex flex-column align-items-center'>
                                <h6>Languages and Technologies</h6>
                                <ul className='text-muted tags d-flex flex-wrap'>
                                    <li className='tag_item'>ReactJS</li>
                                    <li className='tag_item'>React Native</li>
                                    <li className='tag_item'>JavaScript</li>
                                    <li className='tag_item'>NodeJS</li>
                                    <li className='tag_item'>Express</li>
                                    <li className='tag_item'>Socket.io</li>
                                    <li className='tag_item'>JQuery</li>
                                    <li className='tag_item'>HTML</li>
                                    <li className='tag_item'>Css</li>
                                    <li className='tag_item'>Css Grid</li>
                                    <li className='tag_item'>Sass</li>
                                    <li className='tag_item'>PHP</li>
                                    <li className='tag_item'>Laravel</li>
                                    <li className='tag_item'>Python</li>
                                    <li className='tag_item'>Django</li>
                                    <li className='tag_item'>Java</li>
                                    <li className='tag_item'>Spring</li>
                                    <li className='tag_item'>MySQL</li>
                                    <li className='tag_item'>PostgreSQL</li>
                                    <li className='tag_item'>MongoDB</li>
                                    <li className='tag_item'>Google Cloud</li>
                                </ul>
                                <h6>Tools & Workflow</h6>
                                <ul className='text-muted tags d-flex flex-wrap'>
                                    <li className='tag_item'>Asana</li>
                                    <li className='tag_item'>Trello</li>
                                    <li className='tag_item'>Notion</li>
                                    <li className='tag_item'>Slack</li>
                                    <li className='tag_item'>Git</li>
                                    <li className='tag_item'>WordPress</li>
                                    <li className='tag_item'>Google Analytics</li>
                                </ul>
                            </div>
                        </div>
                        <div className='g-col-4 d-flex flex-column'>
                            <div className='_head d-flex flex-column align-items-center'>
                                <FontAwesomeIcon icon={faIcons} />
                            </div>
                            <div className='_content d-flex flex-column align-items-center justify-content-center'>
                                <div className='_vector'></div>
                            </div>
                        </div>
                        <div className='g-col-4 d-flex flex-column'>
                            <div className='_head d-flex flex-column align-items-center'>
                                <FontAwesomeIcon icon={faObjectGroup} />
                                <h5>Graphic Design<b className='pink_dot'>.</b></h5>
                            </div>
                            <div className='_content d-flex flex-column align-items-center'>
                                <h6>Services & Capabilities</h6>
                                <ul className='text-muted tags d-flex flex-wrap'>
                                    <li className='tag_item'>Art direction</li>
                                    <li className='tag_item'>Branding</li>
                                    <li className='tag_item'>Brand Identity</li>
                                    <li className='tag_item'>Interface Design</li>
                                    <li className='tag_item'>Illustration</li>
                                    <li className='tag_item'>Print Design</li>
                                    <li className='tag_item'>Packaging Design</li>
                                    <li className='tag_item'>Advertising Design</li>
                                    <li className='tag_item'>UX</li>
                                    <li className='tag_item'>UI</li>
                                </ul>
                                <h6>Tools & Workflow</h6>
                                <ul className='text-muted tags d-flex flex-wrap'>
                                    <li className='tag_item'>Adobe Photoshop</li>
                                    <li className='tag_item'>Adobe Illustrator</li>
                                    <li className='tag_item'>Adobe InDesign</li>
                                    <li className='tag_item'>Sketch</li>
                                    <li className='tag_item'>Figma</li>
                                    <li className='tag_item'>Canva</li>
                                </ul>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <div className='_shadowIndex'><p>skills<b className='pink_dot'>.</b></p></div>
            </section>
            <Inquiry className={'_s4 grid'}/>
        </main>
    );
}

export default Home;