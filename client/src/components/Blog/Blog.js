import { useCallback, useEffect, useState } from 'react';
import { _useStore } from '../../store/store';
import axios from 'axios';
import moment from 'moment';
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
import { faAngleRight, faArrowDownLong, faArrowUpLong, faCommentAlt, faEllipsisV, faHashtag, faLeftLong, faRightLong, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import $ from 'jquery';
import { faClock, faEye, faFolder } from '@fortawesome/free-regular-svg-icons';

const Blog = (props) => {
    const _articles = _useStore((state) => state._articles);
    const setArticles = _useStore((state) => state.setArticles);

    const [_showModal, setShowModal] = useState(false);
    const [_currentPage, setCurrentPage] = useState(1);
    const [_showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [_filterSort, setFilterSort] = useState('Relevant');
    const [_showFilterSortDropdown, setShowFilterSortDropdown] = useState(false);
    const [_filterTimeframe, setFilterTimeframe] = useState('');
    const [_showFilterTimeframeDropdown, setShowFilterTimeframeDropdown] = useState(false);
    const [_filterCategory, setFilterCategory] = useState([]);
    const [_showFilterCategoryDropdown, setShowFilterCategoryDropdown] = useState(false);
    const [_filterTagsInput, setFilterTagsInput] = useState('');
    const [_filterTags, setFilterTags] = useState([]);
    const [_showFilteTagsDropdown, setShowFilterTagsDropdown] = useState(false);
    const [_filterSearchInput, setFilterSearchInput] = useState('');
    const [_filterSearch, setFilterSearch] = useState([]);

    let _tagsItems = _.map(_.uniq(_.flattenDeep(_.map(_.filter(_articles, (_article) => { return !_article._article_hide }), ('_article_tag')))), (_tag, _index) => {
        return {
            value: _tag
        }
    });
    let _Items = _.map(_.uniq(_.union(_.flattenDeep(_.map(_.filter(_articles, (_article) => { return !_article._article_hide }), '_article_tag')), _.map(_.filter(_articles, (_article) => { return !_article._article_hide }), '_article_title'), _.map(_.filter(_articles, (_article) => { return !_article._article_hide }), '_article_author'), _.map(_.filter(_articles, (_article) => { return !_article._article_hide }), '_article_category'))), (_search, _index) => {
        return {
            value: _search
        }
    });

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
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 3.25,
        slidesToScroll: 1,
        nextArrow: <FontAwesomeIcon icon={faRightLong} />,
        prevArrow: <FontAwesomeIcon icon={faLeftLong} />,
        onInit: () => $('._sliderArticles ._shadowIndex._smaller p').html('01'),
        beforeChange: (current, next) =>
            next < 9
                ? $('._sliderArticles ._shadowIndex._smaller p').html('0' + (next + 1))
                : $('._sliderArticles ._shadowIndex._smaller p').html('' + (next + 1))
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

    const _handleJSONTOHTML = (_target, _input, index) => {
        const html = $.parseHTML(_input);
        $('.' + _target + ' .card_' + index + ' figure').html($(html).find('img').first());
    }

    const _articlesToShow = (_articles) => {
        return _.filter(
            _.filter(
                _.filter(
                    _.filter(
                        (
                            _.isEqual(_filterSort, 'Relevant') ?
                                _.orderBy(_.filter(_articles, (_articleSort) => { return !_articleSort._article_hide }), ['_article_comment'], ['desc'])
                                :
                                _.isEqual(_filterSort, 'Trending') ?
                                    _.orderBy(_.filter(_articles, (_articleSort) => { return !_articleSort._article_hide }), ['_article_view'], ['desc'])
                                    :
                                    _.isEqual(_filterSort, 'Upvotes') ?
                                        _.orderBy(_.filter(_articles, (_articleSort) => { return !_articleSort._article_hide }), ['_article_upvotes'], ['desc'])
                                        :
                                        _.isEqual(_filterSort, 'Recent') ?
                                            _.orderBy(_.filter(_articles, (_articleSort) => { return !_articleSort._article_hide }), ['createdAt'], ['desc'])
                                            :
                                            _.filter(_articles, (_articleSort) => { return !_articleSort._article_hide })
                        ), (_articleTimeframe) => {
                            return _.isEqual(_filterTimeframe, 'Today') ?
                                moment(new Date(_articleTimeframe.createdAt)).isSame(moment(new Date()), 'd')
                                :
                                _.isEqual(_filterTimeframe, 'PastWeek') ?
                                    moment(new Date(_articleTimeframe.createdAt)).isSame(moment(new Date()), 'week')
                                    :
                                    _.isEqual(_filterTimeframe, 'PastMonth') ?
                                        moment(new Date(_articleTimeframe.createdAt)).isSame(moment(new Date()), 'month')
                                        :
                                        _.isEqual(_filterTimeframe, 'PastYear') ?
                                            moment(new Date(_articleTimeframe.createdAt)).isSame(moment(new Date()), 'year')
                                            :
                                            true;
                        }
                    ), (_articleCategory) => {
                        return _.isEmpty(_filterCategory)
                            ?
                            true
                            :
                            _.includes(_filterCategory, _articleCategory._article_category);
                    }
                ), (_articleTags) => {
                    let _lowerFilterTags = _.map(_filterTags, (_filterTag) => { return _.lowerCase(_filterTag) });
                    let _lowerArticleTags = _.map(_articleTags._article_tag, (_articleTag) => { return _.lowerCase(_articleTag) });
                    return _.isEmpty(_filterTags)
                        ?
                        true
                        :
                        _.some(_lowerFilterTags, _tag => _.includes(_lowerArticleTags, _tag));
                }
            ), (_articleSearch) => {
                let _lowerFilterSearch = _.map(_filterSearch, (_filter) => { return _.lowerCase(_filter) });
                let _lowerArticleInformation = _.map(_.flattenDeep(_.values(_articleSearch)), (_information) => { return _.lowerCase(_information) });
                return _.isEmpty(_filterSearch)
                    ?
                    true
                    :
                    _.some(_lowerFilterSearch, _filter => _.includes(_lowerArticleInformation, _filter));
            }
        );
    }

    const _handleClickPage = (_number) => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $('._blog').offset().top
        }, 500);
        setCurrentPage(_.toNumber(_number));
    }

    useEffect(() => {
        _getArticles();

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
    }, [_getArticles]);

    return (
        <main className='_blog'>
            <section className='_s1 grid'>
                <span className='l_name'>BoutalebBoutalebBoutalebBoutalebBoutalebBoutaleb</span>
                <span className='f_name'>ZakariaeZakariaeZakariaeZakariaeZakariaeZakariae</span>
                <div className='g-col-6'>
                    <div className='_caption d-flex flex-column justify-content-center'>
                        <p><b>The teacher</b><b className='pink_dot'>.</b></p>
                        <p>My father was an educator, My grandfather was an educator, i was born to educate, and my sons will also educate<b className='pink_dot'>.</b></p>
                    </div>
                </div>
                <div className='g-col-6'>
                    <div className='_caption d-flex flex-column justify-content-center'>
                        <p><b>The Coder</b><b className='pink_dot'>.</b></p>
                        <p>Grew up next to a computer, learned to create at a young age, i was born to create to look from all sides and discover hidden meanings<b className='pink_dot'>.</b></p>
                    </div>
                </div>
            </section>
            <section className='_s2 grid'>
                <div className='before'></div>
                <div className='g-col-4 align-self-end'>
                    <Form className='d-flex flex-column'>
                        <h1>Youth to Speek <br /> <strong>Louder<b className='pink_dot'>.</b></strong></h1>
                        <Button
                            type='button'
                            className='border border-0 rounded-0 inverse w-50'
                            variant='outline-light'
                            onClick={(event) => setShowModal(true)}
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
                <div className='g-col-8 align-self-end'>
                    <div className='_sliderArticles'>
                        <Slider {..._sliderArticlesSettings}>
                            {
                                _.map(_.slice(_.orderBy(_.filter(_articles, (_a) => { return !_a._hide }), ['_article_view'], ['desc']), 0, 10), (_article, index) => {
                                    return (
                                        <Card className={`border border-0 rounded-0 card_${index}`} key={index}>
                                            <div className='borderTop'></div>
                                            <div className='borderRight'></div>
                                            <div className='borderBottom'></div>
                                            <div className='borderLeft'></div>
                                            <Card.Body className='d-flex flex-column'>
                                                <figure>{_handleJSONTOHTML('_sliderArticles', _article._article_body, index)}</figure>
                                                <p className='text-muted author'>by <b>{_article._article_author}</b>, {moment(new Date(_article.createdAt)).fromNow()}</p>
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
                                                    <p className='d-flex align-items-center text-muted _views'><b>{_.size(_article._article_view)}</b><FontAwesomeIcon icon={faEye} /></p>
                                                    <p className='d-flex align-items-center text-muted _comments'><b>{_.size(_article._article_comment)}</b><FontAwesomeIcon icon={faCommentAlt} /></p>
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
                            onMouseEnter={() => setShowFilterDropdown(true)}
                            onMouseLeave={() => setShowFilterDropdown(false)}
                        >
                            <Dropdown.Toggle as='span'>
                                <span className='d-flex align-items-center justify-content-center'>
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className='border rounded-0'>
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
                                                    <Form.Group controlId='_filterSortInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterSortInput'
                                                            label='Trending.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='_filterSortInput' checked={_.isEqual(_filterSort, 'Trending') ? true : false} onChange={(event) => setFilterSort('Trending')}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Form.Group controlId='_filterSortInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterSortInput'
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
                                                    <Form.Group controlId='_filterSortInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterSortInput'
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
                                                    <Form.Group controlId='_filterSortInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterSortInput'
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
                                                    <Form.Group controlId='_filterTimeframeInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterTimeframeInput'
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
                                                    <Form.Group controlId='_filterTimeframeInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterTimeframeInput'
                                                            label='PastWeek.'
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
                                                    <Form.Group controlId='_filterTimeframeInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterTimeframeInput'
                                                            label='PastMonth.'
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
                                                    <Form.Group controlId='_filterTimeframeInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterTimeframeInput'
                                                            label='PastYear.'
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
                                                    <Form.Group controlId='_filterCategoryInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterCategoryInput'
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
                                                    <Form.Group controlId='_filterCategoryInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterCategoryInput'
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
                                                    <Form.Group controlId='_filterCategoryInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterCategoryInput'
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
                                                    <Form.Group controlId='_filterCategoryInput' className='_checkGroup _formGroup'>
                                                        <FloatingLabel
                                                            controlId='_filterCategoryInput'
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
                                        <Dropdown
                                            show={_showFilteTagsDropdown}
                                            drop={'end'}
                                            onMouseEnter={() => setShowFilterTagsDropdown(true)}
                                            onMouseLeave={() => setShowFilterTagsDropdown(false)}
                                        >
                                            <Dropdown.Toggle as='span'>
                                                <span className='d-flex align-items-center justify-content-star'>
                                                    <FontAwesomeIcon icon={faHashtag} className='me-2' />
                                                    Tags.
                                                    <p>
                                                        <FontAwesomeIcon icon={faAngleRight} className='ms-2' />
                                                    </p>
                                                </span>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='border rounded-0 _autocomplete'>
                                                <Downshift
                                                    onSelect={
                                                        selection => {
                                                            if (selection) {
                                                                setFilterTagsInput(selection.value);
                                                                setFilterTags(_.map(_.filter(_Items, (item) => { return _.includes(_.lowerCase(item.value), _.lowerCase(selection.value)) }), (item, index) => { return (item.value) }));
                                                            }
                                                        }
                                                    }
                                                    itemToString={
                                                        item => (item ? item.value : _filterTagsInput)
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
                                                    }) => (
                                                        <Form.Group className='_formGroup'>
                                                            <FloatingLabel
                                                                label='Search.'
                                                                className='_formLabel _autocomplete'
                                                                {...getRootProps({}, { suppressRefError: true })}
                                                            >
                                                                <Form.Control
                                                                    placeholder='Search.'
                                                                    autoComplete='new-password'
                                                                    type='text'
                                                                    className='_formControl border border-0 rounded-0'
                                                                    name='_filterTags'
                                                                    {...getInputProps({
                                                                        onChange: (event) => {
                                                                            setFilterTagsInput(event.target.value);
                                                                            setFilterTags(_.map(_.filter(_tagsItems, (item) => { return _.includes(_.lowerCase(item.value), _.lowerCase(event.target.value)) }), (item, index) => { return (item.value) }));
                                                                        },
                                                                        onBlur: (event) => {
                                                                            if (_.isEmpty(event.target.value)) clearSelection();
                                                                        }
                                                                    })}
                                                                />
                                                            </FloatingLabel>
                                                            <ListGroup
                                                                className='border border-0 rounded-0'
                                                                {...getMenuProps()}
                                                            >
                                                                {
                                                                    isOpen
                                                                        ?
                                                                        _.map(_.slice(_.filter(_tagsItems, (item) => { return !inputValue || _.includes(_.lowerCase(item.value), _.lowerCase(inputValue)) }), 0, 6), (item, index) => {
                                                                            return (
                                                                                <ListGroup.Item
                                                                                    className='border border-0 rounded-0 d-flex align-items-center'
                                                                                    {...getItemProps({
                                                                                        key: item.value,
                                                                                        index,
                                                                                        item
                                                                                    })}
                                                                                >
                                                                                    {item.value}
                                                                                </ListGroup.Item>
                                                                            )
                                                                        })
                                                                        :
                                                                        null
                                                                }
                                                            </ListGroup>
                                                        </Form.Group>
                                                    )}
                                                </Downshift>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Dropdown.Item>
                                </Form>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Form>
                            <Downshift
                                onSelect={
                                    selection => {
                                        if (selection) {
                                            setFilterSearchInput(selection.value);
                                            setFilterSearch(_.map(_.filter(_Items, (item) => { return _.includes(_.lowerCase(item.value), _.lowerCase(selection.value)) }), (item, index) => { return (item.value) }));
                                        }
                                    }
                                }
                                itemToString={
                                    item => (item ? item.value : _filterSearchInput)
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
                                }) => (
                                    <Form.Group className='_formGroup'>
                                        <FloatingLabel
                                            label='Search.'
                                            className='_formLabel _autocomplete'
                                            {...getRootProps({}, { suppressRefError: true })}
                                        >
                                            <Form.Control
                                                placeholder='Search.'
                                                autoComplete='new-password'
                                                type='text'
                                                className='_formControl border border-0 rounded-0'
                                                name='_filterSearch'
                                                {...getInputProps({
                                                    onChange: (event) => {
                                                        setFilterSearchInput(event.target.value);
                                                        setFilterSearch(_.map(_.filter(_Items, (item) => { return _.includes(_.lowerCase(item.value), _.lowerCase(event.target.value)) }), (item, index) => { return (item.value) }));
                                                    },
                                                    onBlur: (event) => {
                                                        if (_.isEmpty(event.target.value)) clearSelection();
                                                    }
                                                })}
                                            />
                                        </FloatingLabel>
                                        <ListGroup
                                            className='border border-0 rounded-0'
                                            {...getMenuProps()}
                                        >
                                            {
                                                isOpen
                                                    ?
                                                    _.map(_.slice(_.filter(_Items, (item) => { return !inputValue || _.includes(_.lowerCase(item.value), _.lowerCase(inputValue)) }), 0, 6), (item, index) => {
                                                        return (
                                                            <ListGroup.Item
                                                                className='border border-0 rounded-0 d-flex align-items-center'
                                                                {...getItemProps({
                                                                    key: item.value,
                                                                    index,
                                                                    item
                                                                })}
                                                            >
                                                                {item.value}
                                                            </ListGroup.Item>
                                                        )
                                                    })
                                                    :
                                                    null
                                            }
                                        </ListGroup>
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
                                    ((_currentPage * 6) - 6),
                                    (_currentPage * 6)
                                ),
                                (_article, index) => {
                                    return (
                                        <Card className={`g-col-4 border border-0 rounded-0 card_${index}`} key={index}>
                                            <Card.Body className='d-flex flex-column'>
                                                <figure>{_handleJSONTOHTML('_blogModal', _article._article_body, index)}</figure>
                                                <p className='text-muted author'>by <b>{_article._article_author}</b>, {moment(new Date(_article.createdAt)).fromNow()}</p>
                                                <h4>{_article._article_title}</h4>
                                                <p className='category align-self-end'>{_article._article_category}</p>
                                                <ul className='text-muted tags'>
                                                    {
                                                        _article._article_tag.map((_t, _i) => {
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
                                                    <p className='d-flex align-items-center text-muted _views'><b>{_.size(_article._article_view)}</b><FontAwesomeIcon icon={faEye} /></p>
                                                    <p className='d-flex align-items-center text-muted _comments'><b>{_.size(_article._article_comment)}</b><FontAwesomeIcon icon={faCommentAlt} /></p>
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
                                                _.size(_articlesToShow(_articles)) / 6
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
                                    ((_currentPage * 6) - 6) + 1
                                }
                            </strong>
                            &nbsp; to &nbsp;
                            <strong>
                                {
                                    ((_currentPage * 6) - 6) + _.toNumber(
                                        _.size(
                                            _.slice(
                                                _articlesToShow(_articles),
                                                ((_currentPage * 6) - 6),
                                                (_currentPage * 6)
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