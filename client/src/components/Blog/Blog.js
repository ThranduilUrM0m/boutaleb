import { useCallback, useEffect, useState } from 'react';
import { _useStore } from '../../store/store';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import moment from 'moment';
import Moment from 'react-moment';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import Slider from 'react-slick';
import Downshift from 'downshift';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot, faMinus, faAngleRight, faArrowDownLong, faArrowUpLong, faCommentAlt, faEllipsisV, faHashtag, faArrowLeftLong, faMagnifyingGlass, faArrowRightLong, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faClock, faEye, faFolder } from '@fortawesome/free-regular-svg-icons';
import _ from 'lodash';
import $ from 'jquery';
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';

const Blog = (props) => {
    const _articles = _useStore((state) => state._articles);
    const setArticles = _useStore((state) => state.setArticles);

    const {
        register,
        watch,
        reset,
        getValues,
        setValue,
        formState: { errors }
    } = useForm({
        mode: 'onTouched',
        reValidateMode: 'onSubmit'
    });

    const [_showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [_showFilterSortDropdown, setShowFilterSortDropdown] = useState(false);
    const [_showFilterTimeframeDropdown, setShowFilterTimeframeDropdown] = useState(false);
    const [_showFilterCategoryDropdown, setShowFilterCategoryDropdown] = useState(false);

    const [_currentPage, setCurrentPage] = useState(1);
    const [_cardsPerPage] = useState(6);
    const [_showModal, setShowModal] = useState(false);

    const [_filterSort, setFilterSort] = useState('Relevant');
    const [_filterTimeframe, setFilterTimeframe] = useState('');
    const [_filterCategory, setFilterCategory] = useState([]);

    let _articleTags = _.map(_.uniq(_.flattenDeep(_.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), ('_article_tags')))), (_tag, _index) => {
        return {
            value: _tag
        }
    });
    let _articleItems = _.orderBy(_.uniqBy(_.map(_.union(_.flattenDeep(_.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_tags')), _.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_title'), _.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_author'), _.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_category')), (_search, _index) => {
        return {
            value: _.toLower(_search.replace(/\.$/, ''))
        }
    }), 'value'), ['value'], ['asc']);

    const handleAddCategory = (_category) => {
        setFilterCategory((prevState) => [
            ...prevState,
            _category
        ]);
    };

    const handleRemoveCategory = (_category) => {
        setFilterCategory((prevState) => _.without(prevState, _category));
    }

    const _sliderArticlesSettings = {
        dots: true,
        dotsClass: 'slick-dots d-flex',
        infinite: false,
        speed: 500,
        slidesToShow: 2.5,
        slidesToScroll: 1,
        nextArrow: <FontAwesomeIcon icon={faArrowRightLong} />,
        prevArrow: <FontAwesomeIcon icon={faArrowLeftLong} />,
        beforeChange: (currentSlide, nextSlide) => {
            const dots = $('.slick-dots li');
            if (nextSlide === dots.length - 1.5) {
                dots[dots.length - 1].classList.add('slick-active');
            } else {
                dots[dots.length - 1].classList.remove('slick-active');
            }
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

    const _articlesToShow = (_articles) => {
        return _.filter(
            _.filter(
                _.filter(
                    (
                        _.isEqual(_filterSort, 'Relevant') ?
                            _.orderBy(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), ['_article_comments'], ['desc'])
                            :
                            _.isEqual(_filterSort, 'Trending') ?
                                _.orderBy(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), ['_article_views'], ['desc'])
                                :
                                _.isEqual(_filterSort, 'Upvotes') ?
                                    _.orderBy(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), ['_article_upvotes'], ['desc'])
                                    :
                                    _.isEqual(_filterSort, 'Recent') ?
                                        _.orderBy(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), ['updatedAt'], ['desc'])
                                        :
                                        _.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate })
                    ), (_articleTimeframe) => {
                        return _.isEqual(_filterTimeframe, 'Today')
                            ? (
                                <Moment date={_articleTimeframe.updatedAt} isSame={moment(new Date(), 'day')}>
                                    {same => same}
                                </Moment>
                            )
                            : _.isEqual(_filterTimeframe, 'PastWeek')
                                ? (
                                    <Moment date={_articleTimeframe.updatedAt} isSame={moment(new Date(), 'week')}>
                                        {same => same}
                                    </Moment>
                                )
                                : _.isEqual(_filterTimeframe, 'PastMonth')
                                    ? (
                                        <Moment date={_articleTimeframe.updatedAt} isSame={moment(new Date(), 'month')}>
                                            {same => same}
                                        </Moment>
                                    )
                                    : _.isEqual(_filterTimeframe, 'PastYear')
                                        ? (
                                            <Moment date={_articleTimeframe.updatedAt} isSame={moment(new Date(), 'year')}>
                                                {same => same}
                                            </Moment>
                                        )
                                        : true;
                    }
                ), (_articleCategory) => {
                    return _.isEmpty(_filterCategory)
                        ?
                        true
                        :
                        _.includes(_filterCategory, _articleCategory._article_category);
                }
            ),
            (_search) => {
                let _filterSearch = _.map(_.filter(_articleItems, (item) => { return _.includes(_.lowerCase(item.value), _.lowerCase(watch(['_searchInput'])[0])) }), (item, index) => { return (item.value) });
                let _lowerFilterSearch = _.map(_filterSearch, (_filter) => { return _.lowerCase(_filter) });
                let _lowerInformation = _.map(_.flattenDeep(_.values(_search)), (_information) => { return _.lowerCase(_information) });
                return _.isEmpty(watch(['_searchInput']))
                    ?
                    true
                    :
                    _.some(_lowerFilterSearch, _filter => _.includes(_lowerInformation, _filter));
            }
        );
    }

    const _getTrendingArticles = () => {
        // Sorting By Created
        const _articlesByCreated = _.orderBy(_.filter(_articles, (_a) => { return !_a._hide }), ['updatedAt'], ['desc']);

        // Sorting By Updated
        const _articlesByUpdated = _.orderBy(_.filter(_articles, (_a) => { return !_a._hide }), ['updatedAt'], ['desc']);

        // Sorting By Category
        // Calculate the number of upvotes per category
        const _categoryUpvotes = _.reduce(_.filter(_articles, (_a) => { return !_a._hide }), (_result, _article) => {
            const { _article_category, _article_upvotes } = _article;
            _result[_article_category] = (_result[_article_category] || 0) + _article_upvotes.length;
            return _result;
        }, {});
        // Sort the categories based on the number of upvotes in descending order
        const _sortedCategories = _.orderBy(Object.keys(_categoryUpvotes), _category => _categoryUpvotes[_category], 'desc');
        // Sort the articles based on the order of the sorted categories
        const _articlesByCategories = _.orderBy(_.filter(_articles, (_a) => { return !_a._hide }), _article => _sortedCategories.indexOf(_article._article_category), 'desc');

        // Sorting By Tags
        // Calculate the number of upvotes per tag
        const _tagUpvotes = _.reduce(_.filter(_articles, (_a) => { return !_a._hide }), (_result, _article) => {
            const { _article_tags, _article_upvotes } = _article;
            _.forEach(_article_tags, tag => {
                _result[tag] = (_result[tag] || 0) + _article_upvotes.length;
            });
            return _result;
        }, {});
        // Sort the tags based on the number of upvotes in descending order
        const _sortedTags = _.orderBy(Object.keys(_tagUpvotes), tag => _tagUpvotes[tag], 'desc');
        // Sort the articles based on the order of the sorted tags
        const _articlesByTags = _.sortBy(_articles, article => {
            const matchingTags = _.intersection(article._article_tags, _sortedTags);
            return _sortedTags.indexOf(_.head(matchingTags));
        });

        // Sorting By Comments
        const _articlesByComments = _.orderBy(_.filter(_articles, (_a) => { return !_a._hide }), ['_article_comments'], ['desc']);

        // Sorting By Upvotes
        const _articlesByUpvotes = _.orderBy(_.filter(_articles, (_a) => { return !_a._hide }), ['_article_upvotes'], ['desc']);

        // Sorting By Views
        const _articlesByViews = _.orderBy(_.filter(_articles, (_a) => { return !_a._hide }), ['_article_views'], ['desc']);

        return _.chain(_.filter(_articles, (_a) => { return !_a._hide }))
            .sortBy([
                // Sort by view count in descending order
                (_article) => -_article._article_views.length,
                // Sort by upvotes count in descending order
                (_article) => -_article._article_upvotes.length,
                // Sort by comments count in descending order
                (_article) => -_article._article_comments.length,
                // Sort by categories with the most upvoted articles
                (_article) => {
                    const categoryArticles = _.filter(_.filter(_articles, (_a) => { return !_a._hide }), { _article_category: _article._article_category });
                    return -_.sumBy(categoryArticles, (a) => a._article_upvotes.length);
                },
                // Sort by tags with the most upvoted articles
                (_article) => {
                    const tagArticles = _.filter(_.filter(_articles, (_a) => { return !_a._hide }), (a) => _.includes(a._article_tags, _article._article_tags));
                    return -_.sumBy(tagArticles, (a) => a._article_upvotes.length);
                },
                // Sort by creation date in descending order
                '_updatedAt',
                // Sort by update date in descending order
                '_updatedAt'
            ])
            .value();
    }

    const _handleArticleJSONTOHTML = () => {
        const html = $.parseHTML(_.get(_.head(_getTrendingArticles()), '_article_body'));
        $('._blog ._s1 ._figure').html($(html).find('img').first());
    }

    const _handleJSONTOHTML = (_target, _input, index) => {
        const html = $.parseHTML(_input);
        $('.' + _target + ' .card_' + index + ' figure').html($(html).find('img').first());
    }

    const _handleClickPage = (_number) => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $('._blog').offset().top
        }, 500);
        setCurrentPage(_.toNumber(_number));
    }

    useEffect(() => {
        _getArticles();
        _handleArticleJSONTOHTML();

        $('._blog ._s1').on('mousemove', (event) => {
            let width = $('._blog ._s1').width() / 2;
            let amountMovedX = ((width - event.pageX) * -1 / 12);
            let amountMovedXN = ((width - event.pageX) * 1 / 12);

            $('._blog ._s1 .l_name').css('left', amountMovedX);
            $('._blog ._s1 .f_name').css('left', amountMovedXN);
        });

        $('._blog ._s2').on('mousemove', (event) => {
            let width = $('._blog ._s2').width() / 2;
            let amountMovedX = ((width - event.pageX) * 1 / 64);

            $('._blog ._s2 .before').css('right', amountMovedX);
        });

        const subscription = watch((value, { name, type }) => { });
        return () => subscription.unsubscribe();
    }, [_getArticles, watch]);

    return (
        <main className='_blog'>
            <section className='_s1 grid'>
                <div className='g-col-7 align-self-end'>
                    <Card className={`border border-0 rounded-0`}>
                        <Card.Body className='no-shadow'>
                            <Form className='d-flex flex-column'>
                                <span className='text-muted category_author'>{_.get(_.head(_getTrendingArticles()), '_article_category')}</span>
                                <h2 className='align-self-start mb-auto'>{_.get(_.head(_getTrendingArticles()), '_article_title')}<br />by <span>{_.get(_.head(_getTrendingArticles()), '_article_author')}</span></h2>
                                <span className='firstPhrase'>{_.slice(_.split(_.trim($(_.get(_.head(_getTrendingArticles()), '_article_body')).find('span').text()), /\./g), 0, 1)}</span>
                                <Button
                                    type='button'
                                    className='border border-0 rounded-0 inverse w-25 align-self-start'
                                    variant='outline-light'
                                    href={`/blog/${_.get(_.head(_getTrendingArticles()), '_id')}`}
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
                                {/* <div className='_shadowIndex'><p>{_.head(_.split(_.get(_.head(_getTrendingArticles()), '_article_title'), /[\s.]+/)).length <= 2 ? _.head(_.split(_.get(_.head(_getTrendingArticles()), '_article_title'), /[\s.]+/)) + ' ' + _.nth(_.split(_.get(_.head(_getTrendingArticles()), '_article_title'), /[\s.]+/), 1) : _.head(_.split(_.get(_.head(_getTrendingArticles()), '_article_title'), /[\s.]+/))}<b className='pink_dot'>.</b></p></div> */}
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className='_shadowIndex _trending'><p>Trending<b className='pink_dot'>.</b></p></div>
                    <div className='_shadowIndex _trending _outlined'><p>Trending<b className='pink_dot'>.</b></p></div>
                </div>
                <div className='g-col-5'>
                    <figure className='_figure'></figure>
                </div>
            </section>
            <section className='_s2 grid'>
                <div className='g-col-6 _s1_1'>
                    <Form>
                        <h2>blog <strong><b className='pink_dot'>.</b></strong></h2>
                        <Button
                            type='button'
                            className='border border-0 rounded-0 inverse w-25'
                            variant='outline-light'
                            onClick={() => setShowModal(true)}
                        >
                            <div className='buttonBorders'>
                                <div className='borderTop'></div>
                                <div className='borderRight'></div>
                                <div className='borderBottom'></div>
                                <div className='borderLeft'></div>
                            </div>
                            <span>
                                View More<b className='pink_dot'>.</b>
                            </span>
                        </Button>
                    </Form>
                </div>
                <div className='g-col-6 _s1_2'>
                    <div className='_sliderArticles'>
                        <Slider {..._sliderArticlesSettings}>
                            {
                                _.map(_.slice(_.orderBy(_.filter(_articles, (_a) => { return !_a._hide }), ['_article_views'], ['desc']), 0, 10), (_article, index) => {
                                    return (
                                        <Card className={`border border-0 rounded-0 card_${index}`} key={index}>
                                            <div className='borderTop'></div>
                                            <div className='borderRight'></div>
                                            <div className='borderBottom'></div>
                                            <div className='borderLeft'></div>
                                            <Card.Body className='d-flex flex-column'>
                                                <figure>{_handleJSONTOHTML('_sliderArticles', _article._article_body, index)}</figure>
                                                <p className='text-muted author'>by <b>{_article._article_author}</b>, {<Moment fromNow>{_article.updatedAt}</Moment>}</p>
                                                <h4>{_article._article_title}</h4>
                                                <p className='category align-self-end'>{_article._article_category}</p>
                                                <Button
                                                    type='button'
                                                    className='border border-0 rounded-0 inverse mt-auto align-self-end'
                                                    variant='outline-light'
                                                    href={`/blog/${_article._id}`}
                                                    data-am-linearrow='tooltip tooltip-bottom'
                                                    display-name='Read More'
                                                >
                                                    <div className='line line-1'></div>
                                                    <div className='line line-2'></div>
                                                </Button>
                                                <div className='_footerInformation d-flex'>
                                                    <p className='d-flex align-items-center text-muted _views'><b>{_.size(_article._article_views)}</b><FontAwesomeIcon icon={faEye} /></p>
                                                    <p className='d-flex align-items-center text-muted _comments'><b>{_.size(_article._article_comments)}</b><FontAwesomeIcon icon={faCommentAlt} /></p>
                                                    <p className='d-flex align-items-center text-muted _upvotes'><b>{_.size(_article._article_upvotes)}</b><FontAwesomeIcon icon={faThumbsUp} /></p>
                                                    <p className='d-flex align-items-center text-muted _downvotes'><b>{_.size(_article._article_downvotes)}</b><FontAwesomeIcon icon={faThumbsDown} /></p>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )
                                })
                            }
                        </Slider>
                    </div>
                </div>
            </section>
            <Modal className='_blogModal' show={_showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className='d-flex'>
                        <Dropdown
                            show={_showFilterDropdown}
                            onMouseEnter={() => {
                                setShowFilterDropdown(true);
                            }}
                            onMouseLeave={() => setShowFilterDropdown(false)}
                        >
                            <Dropdown.Toggle as='span'>
                                <span className='d-flex align-items-center justify-content-center'>
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className='border-0 border-top rounded-0'>
                                <Form className='d-flex flex-column'>
                                    <Dropdown.Item eventKey='1'>
                                        <Dropdown
                                            show={_showFilterSortDropdown}
                                            drop={'end'}
                                            onMouseEnter={() => setShowFilterSortDropdown(true)}
                                            onMouseLeave={() => setShowFilterSortDropdown(false)}
                                        >
                                            <Dropdown.Toggle as='span'>
                                                <span className='d-flex align-items-center justify-content-start'>
                                                    <FontAwesomeIcon icon={faArrowDownLong} />
                                                    <FontAwesomeIcon icon={faArrowUpLong} className='me-2' />
                                                    Sort.
                                                    <p>
                                                        {_filterSort}
                                                        <FontAwesomeIcon icon={faAngleRight} className='ms-2' />
                                                    </p>
                                                </span>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='border rounded-0'>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterSortInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Trending.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                {...register('_filterSort', {
                                                                    onChange: () => setFilterSort('Trending')
                                                                })}
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='_filterSort'
                                                                defaultValue={_.isEqual(_filterSort, 'Trending')}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterSortInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Relevant.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='_filterSortInput' checked={_.isEqual(_filterSort, 'Relevant') ? true : false} onChange={(event) => setFilterSort('Relevant')}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterSortInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Most Liked.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='_filterSortInput' checked={_.isEqual(_filterSort, 'Upvotes') ? true : false} onChange={(event) => setFilterSort('Upvotes')}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterSortInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Recent.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='_filterSortInput' checked={_.isEqual(_filterSort, 'Recent') ? true : false} onChange={(event) => setFilterSort('Recent')}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey='2'>
                                        <Dropdown
                                            show={_showFilterTimeframeDropdown}
                                            drop={'end'}
                                            onMouseEnter={() => setShowFilterTimeframeDropdown(true)}
                                            onMouseLeave={() => setShowFilterTimeframeDropdown(false)}
                                        >
                                            <Dropdown.Toggle as='span'>
                                                <span className='d-flex align-items-center justify-content-star'>
                                                    <FontAwesomeIcon icon={faClock} className='me-2' />
                                                    Timeframe.
                                                    <p>
                                                        {_filterTimeframe}
                                                        <FontAwesomeIcon icon={faAngleRight} className='ms-2' />
                                                    </p>
                                                </span>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='border rounded-0'>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterTimeframeInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Today.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='_filterTimeframeInput' checked={_.isEqual(_filterTimeframe, 'Today') ? true : false} onChange={(event) => setFilterTimeframe(event.target.checked ? 'Today' : '')}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterTimeframeInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Past Week.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='_filterTimeframeInput' checked={_.isEqual(_filterTimeframe, 'PastWeek') ? true : false} onChange={(event) => setFilterTimeframe(event.target.checked ? 'PastWeek' : '')}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterTimeframeInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Past Month.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='_filterTimeframeInput' checked={_.isEqual(_filterTimeframe, 'PastMonth') ? true : false} onChange={(event) => setFilterTimeframe(event.target.checked ? 'PastMonth' : '')}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterTimeframeInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Past Year.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='_filterTimeframeInput' checked={_.isEqual(_filterTimeframe, 'PastYear') ? true : false} onChange={(event) => { setFilterTimeframe(event.target.checked ? 'PastYear' : '') }}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey='3'>
                                        <Dropdown
                                            show={_showFilterCategoryDropdown}
                                            drop={'end'}
                                            onMouseEnter={() => setShowFilterCategoryDropdown(true)}
                                            onMouseLeave={() => setShowFilterCategoryDropdown(false)}
                                        >
                                            <Dropdown.Toggle as='span'>
                                                <span className='d-flex align-items-center justify-content-star'>
                                                    <FontAwesomeIcon icon={faFolder} className='me-2' />
                                                    Category.
                                                    <p>
                                                        {_.size(_filterCategory) > 1 ? _.head(_filterCategory) + '...' : _filterCategory}
                                                        <FontAwesomeIcon icon={faAngleRight} className='ms-2' />
                                                    </p>
                                                </span>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='border rounded-0'>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterCategoryInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Education.'
                                                            className='_formLabel _formLabelCheckbox'
                                                        >
                                                            <Form.Check
                                                                type='checkbox'
                                                                className='_formCheckbox'
                                                                name='_filterCategoryInput' checked={_.includes(_filterCategory, 'Education') ? true : false} onChange={(event) => event.target.checked ? handleAddCategory('Education') : handleRemoveCategory('Education')}
                                                            />
                                                            <Badge bg='info'>{_.size(_.filter(_articles, (_a) => { return _.isEqual('Education', _a._article_category) }))}</Badge>
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterCategoryInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Design.'
                                                            className='_formLabel _formLabelCheckbox'
                                                        >
                                                            <Form.Check
                                                                type='checkbox'
                                                                className='_formCheckbox'
                                                                name='_filterCategoryInput' checked={_.includes(_filterCategory, 'Design') ? true : false} onChange={(event) => event.target.checked ? handleAddCategory('Design') : handleRemoveCategory('Design')}
                                                            />
                                                            <Badge bg='info'>{_.size(_.filter(_articles, (_a) => { return _.isEqual('Design', _a._article_category) }))}</Badge>
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterCategoryInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Community.'
                                                            className='_formLabel _formLabelCheckbox'
                                                        >
                                                            <Form.Check
                                                                type='checkbox'
                                                                className='_formCheckbox'
                                                                name='_filterCategoryInput' checked={_.includes(_filterCategory, 'Community') ? true : false} onChange={(event) => event.target.checked ? handleAddCategory('Community') : handleRemoveCategory('Community')}
                                                            />
                                                            <Badge bg='info'>{_.size(_.filter(_articles, (_a) => { return _.isEqual('Community', _a._article_category) }))}</Badge>
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group
                                                        controlId='_filterCategoryInput'
                                                        className='_checkGroup _formGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Tutorials.'
                                                            className='_formLabel _formLabelCheckbox'
                                                        >
                                                            <Form.Check
                                                                type='checkbox'
                                                                className='_formCheckbox'
                                                                name='_filterCategoryInput' checked={_.includes(_filterCategory, 'Tutorials') ? true : false} onChange={(event) => event.target.checked ? handleAddCategory('Tutorials') : handleRemoveCategory('Tutorials')}
                                                            />
                                                            <Badge bg='info'>{_.size(_.filter(_articles, (_a) => { return _.isEqual('Tutorials', _a._article_category) }))}</Badge>
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item eventKey='4'>
                                        <Downshift
                                            onSelect={
                                                selection => {
                                                    if (selection) {
                                                        setValue('_filterTags', selection.value)
                                                    }
                                                }
                                            }
                                            itemToString={
                                                item => (item ? item.value : getValues('_filterTags'))
                                            }
                                        >
                                            {({
                                                getInputProps,
                                                getItemProps,
                                                getMenuProps,
                                                clearSelection,
                                                isOpen,
                                                inputValue,
                                                getRootProps,
                                                openMenu
                                            }) => (
                                                <Form.Group
                                                    controlId='_filterTags'
                                                    className='_formGroup'
                                                >
                                                    <FloatingLabel
                                                        label='Tags.'
                                                        className='_formLabel _autocomplete'
                                                        {...getRootProps({}, { suppressRefError: true })}
                                                    >
                                                        <FontAwesomeIcon icon={faHashtag} className='me-2' />
                                                        <Form.Control
                                                            {...register('_filterTags', {})}
                                                            placeholder='Tags.'
                                                            autoComplete='new-password'
                                                            type='text'
                                                            className='_formControl border border-0 rounded-0'
                                                            name='_filterTags'
                                                            {...getInputProps({
                                                                onFocus: () => {
                                                                    openMenu();
                                                                },
                                                                onBlur: (event) => {
                                                                    if (_.isEmpty(event.target.value)) clearSelection();
                                                                }
                                                            })}
                                                        />
                                                        {
                                                            watch('_filterTags', false) && (
                                                                <div className='_searchButton _formClear'
                                                                    onClick={() => {
                                                                        clearSelection();
                                                                        reset({
                                                                            _filterTags: ''
                                                                        });
                                                                    }}
                                                                ></div>
                                                            )
                                                        }
                                                    </FloatingLabel>
                                                    <SimpleBar style={{ maxHeight: '40vh' }} forceVisible='y' autoHide={false}>
                                                        <ListGroup
                                                            className='border border-0 rounded-0 d-block'
                                                            {...getMenuProps()}
                                                        >
                                                            {
                                                                isOpen
                                                                    ?
                                                                    _.map(
                                                                        _.orderBy(_.uniqBy(_.filter(_articleTags, (item) => { return !inputValue || _.includes(_.lowerCase(item.value), _.lowerCase(inputValue)) }), 'value'), ['value'], ['asc'])
                                                                        , (item, index) => {
                                                                            return (
                                                                                <ListGroup.Item
                                                                                    className='border border-0 rounded-0 d-flex align-items-center'
                                                                                    {...getItemProps({
                                                                                        key: item.value,
                                                                                        index,
                                                                                        item
                                                                                    })}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className='me-2' />
                                                                                    {item.value}
                                                                                </ListGroup.Item>
                                                                            )
                                                                        }
                                                                    )
                                                                    :
                                                                    null
                                                            }
                                                        </ListGroup>
                                                    </SimpleBar>
                                                </Form.Group>
                                            )}
                                        </Downshift>
                                    </Dropdown.Item>
                                </Form>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Form>
                            <Downshift
                                onSelect={
                                    selection => {
                                        if (selection) {
                                            setValue('_searchInput', selection.value);
                                        }
                                    }
                                }
                                itemToString={
                                    item => (item ? item.value : getValues('_searchInput'))
                                }
                            >
                                {({
                                    getInputProps,
                                    getItemProps,
                                    getMenuProps,
                                    clearSelection,
                                    isOpen,
                                    inputValue,
                                    getRootProps,
                                    openMenu
                                }) => (
                                    <Form.Group
                                        controlId='_searchInput'
                                        className='_formGroup'
                                    >
                                        <FloatingLabel
                                            label='Search.'
                                            className='_formLabel _autocomplete'
                                            {...getRootProps({}, { suppressRefError: true })}
                                        >
                                            <Form.Control
                                                {...register('_searchInput', { persist: true })}
                                                placeholder='Search.'
                                                autoComplete='new-password'
                                                type='text'
                                                className='_formControl border border-0 rounded-0'
                                                name='_searchInput'
                                                {...getInputProps({
                                                    onChange: (event) => {
                                                        setValue('_searchInput', event.target.value);
                                                    },
                                                    onFocus: () => {
                                                        openMenu();
                                                    }
                                                })}
                                            />
                                            {
                                                watch('_searchInput', false) && (
                                                    <div className='_searchButton _formClear'
                                                        onClick={() => {
                                                            clearSelection();
                                                            reset({
                                                                _searchInput: ''
                                                            });
                                                        }}
                                                    ></div>
                                                )
                                            }
                                        </FloatingLabel>
                                        <SimpleBar style={{ maxHeight: '40vh' }} forceVisible='y' autoHide={false}>
                                            <ListGroup
                                                className='border border-0 rounded-0 d-block'
                                                {...getMenuProps()}
                                            >
                                                {
                                                    isOpen && !_showFilterDropdown
                                                        ?
                                                        _.map(
                                                            _.orderBy(_.uniqBy(_.filter(_articleItems, (item) => { return !inputValue || _.includes(_.lowerCase(item.value), _.lowerCase(inputValue)) }), 'value'), ['value'], ['asc'])
                                                            , (item, index) => {
                                                                return (
                                                                    <ListGroup.Item
                                                                        className='border border-0 rounded-0 d-flex align-items-center justify-content-start'
                                                                        {...getItemProps({
                                                                            key: item.value,
                                                                            index,
                                                                            item
                                                                        })}
                                                                    >
                                                                        <FontAwesomeIcon icon={faMagnifyingGlass} className='me-2' />
                                                                        {item.value}
                                                                    </ListGroup.Item>
                                                                )
                                                            }
                                                        )
                                                        :
                                                        null
                                                }
                                            </ListGroup>
                                        </SimpleBar>
                                    </Form.Group>
                                )}
                            </Downshift>
                        </Form>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h1>Journal</h1>
                    <div className='_page grid m-auto'>
                        {
                            _.map(
                                _.slice(
                                    _articlesToShow(_articles),
                                    ((_currentPage * _cardsPerPage) - _cardsPerPage),
                                    (_currentPage * _cardsPerPage)
                                ),
                                (_article, index) => {
                                    return (
                                        <Card className={`g-col-4 border border-0 rounded-0 card_${index}`} key={index}>
                                            <Card.Body className='d-flex flex-column'>
                                                <figure>{_handleJSONTOHTML('_blogModal', _article._article_body, index)}</figure>
                                                <p className='text-muted author'>by <b>{_article._article_author}</b>, {<Moment fromNow>{_article.updatedAt}</Moment>}</p>
                                                <h4>{_article._article_title}</h4>
                                                <p className='category align-self-end'>{_article._article_category}</p>
                                                <ul className='text-muted tags'>
                                                    {
                                                        _.map(_article._article_tags, (_t, _i) => {
                                                            return (
                                                                <li key={_i} className='tag_item'>{_t}</li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                                <Button
                                                    type='button'
                                                    className='border border-0 rounded-0 inverse mt-auto align-self-end'
                                                    variant='outline-light'
                                                    href={`/blog/${_article._id}`}
                                                    data-am-linearrow='tooltip tooltip-bottom'
                                                    display-name='Read More'
                                                >
                                                    <div className='line line-1'></div>
                                                    <div className='line line-2'></div>
                                                </Button>
                                                <div className='_footerInformation d-flex'>
                                                    <p className='d-flex align-items-center text-muted _views'><b>{_.size(_article._article_views)}</b><FontAwesomeIcon icon={faEye} /></p>
                                                    <p className='d-flex align-items-center text-muted _comments'><b>{_.size(_article._article_comments)}</b><FontAwesomeIcon icon={faCommentAlt} /></p>
                                                    <p className='d-flex align-items-center text-muted _upvotes'><b>{_.size(_article._article_upvotes)}</b><FontAwesomeIcon icon={faThumbsUp} /></p>
                                                    <p className='d-flex align-items-center text-muted _downvotes'><b>{_.size(_article._article_downvotes)}</b><FontAwesomeIcon icon={faThumbsDown} /></p>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )
                                })
                        }
                    </div>
                    <ul className='_pageNumbers d-flex justify-content-center m-auto w-80'>
                        {
                            _.map(
                                _.keys(
                                    [
                                        ...Array(
                                            _.ceil(
                                                _.size(_articlesToShow(_articles)) / _cardsPerPage
                                            )
                                        )
                                    ]
                                )
                                , (_number) => {
                                    _number++;
                                    return (
                                        <li
                                            key={_number}
                                            onClick={() => _handleClickPage(_number)}
                                            className={`border-0 ${_.isEqual(_.toNumber(_currentPage), _.toNumber(_number)) ? 'current' : ''}`}
                                        >
                                        </li>
                                    );
                                }
                            )
                        }
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Form className='d-flex justify-content-between align-items-center'>
                        <div>
                            Showing &nbsp;
                            <strong>
                                {
                                    ((_currentPage * _cardsPerPage) - _cardsPerPage) + 1
                                }
                            </strong>
                            &nbsp; to &nbsp;
                            <strong>
                                {
                                    ((_currentPage * _cardsPerPage) - _cardsPerPage) + _.toNumber(
                                        _.size(
                                            _.slice(
                                                _articlesToShow(_articles),
                                                ((_currentPage * _cardsPerPage) - _cardsPerPage),
                                                (_currentPage * _cardsPerPage)
                                            )
                                        )
                                    )
                                }
                            </strong>
                            &nbsp; of &nbsp;
                            <strong>
                                {
                                    _.toNumber(
                                        _.size(
                                            _articlesToShow(_articles)
                                        )
                                    )
                                }
                            </strong>
                            &nbsp; articles.
                        </div>
                        <Button className='border border-0 rounded-0 inverse' variant='outline-light' onClick={() => setShowModal(false)}>
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
                    </Form>
                </Modal.Footer>
                <div className='_shadowIndex d-flex'><p>{_currentPage < 10 ? '0' + _currentPage : _currentPage}</p><b className='pink_dot'>.</b></div>
            </Modal>
        </main>
    );
}

export default Blog;