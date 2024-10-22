import { useCallback, useEffect, useState } from 'react';
import _useStore from '../../store';
import axios from 'axios';
import moment from 'moment';
import Moment from 'react-moment';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import Slider from 'react-slick';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useCombobox } from 'downshift';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faArrowDownLong, faArrowUpLong, faCommentAlt, faEllipsisV, faHashtag, faArrowLeftLong, faMagnifyingGlass, faArrowRightLong, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faClock, faEye, faFolder } from '@fortawesome/free-regular-svg-icons';
import _ from 'lodash';
import $ from 'jquery';
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';

const Blog = (props) => {
    const _articles = _useStore.useArticleStore(state => state._articles);
    const setArticles = _useStore.useArticleStore(state => state['_articles_SET_STATE']);

    const _validationSchema = Yup
        .object()
        .shape({
            _filterSort: Yup.string()
                .default('Relevant'),
            _filterTimeframe: Yup.string()
                .default(''),
            _filterCategory: Yup.string()
                .default(''),
            _tagInput: Yup.string()
                .default(''),
            _searchInput: Yup.string()
                .default('')
        });
    const {
        watch,
        setValue,
        trigger,
        control
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onSubmit',
        resolver: yupResolver(_validationSchema),
        defaultValues: {
            _filterSort: 'Relevant',
            _filterTimeframe: '',
            _filterCategory: '',
            _tagInput: '',
            _searchInput: ''
        }
    });

    /* Focus State Variables */
    const [_tagFocused, setTagFocused] = useState(false);
    const [_searchFocused, setSearchFocused] = useState(false);

    /* Dropdown State Variables */
    const [_showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [_showFilterSortDropdown, setShowFilterSortDropdown] = useState(false);
    const [_showFilterTimeframeDropdown, setShowFilterTimeframeDropdown] = useState(false);
    const [_showFilterCategoryDropdown, setShowFilterCategoryDropdown] = useState(false);

    /* Modal State Variables */
    const [_currentPage, setCurrentPage] = useState(1);
    const [_cardsPerPage] = useState(6);
    const [_showModal, setShowModal] = useState(false);

    /* Form.Control data */
    let _articleTags = _.map(_.uniq(_.flattenDeep(_.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), ('_article_tags')))), (_tag, _index) => {
        return {
            value: _tag
        }
    });
    let _articleItems = _.orderBy(_.uniqBy(_.map(_.union(_.flattenDeep(_.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_tags')), _.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_title'), _.compact(_.flatMap(_.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), (_article) => ({ username: _article._article_author.username, firstname: _article._article_author.firstname, lastname: _article._article_author.lastname, email: _article._article_author.email, teamTitle: _article._article_author.Team?._team_title })), (__u) => [__u.email, __u.firstname, __u.lastname, __u.teamTitle, __u.username])), _.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_category')), (_search, _index) => {
        return {
            value: _.toLower(_search.replace(/\.$/, ''))
        }
    }), 'value'), ['value'], ['asc']);

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

    const _getTrendingArticles = () => {
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

    const _handleJSONTOHTML = (_target, _input, index) => {
        const html = $.parseHTML(_input);
        $('.' + _target + ' .card_' + index + ' figure').html($(html).find('img').first());
    }

    const _handleArticleJSONTOHTML = () => {
        const html = $.parseHTML(_.get(_.head(_getTrendingArticles()), '_article_body'));
        $('._blog ._s1 ._figure').html($(html).find('img').first());
    }

    const _handleClickPage = (_number) => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $('._blog').offset().top
        }, 500);
        setCurrentPage(_.toNumber(_number));
    }

    const _articlesToShow = (_articles) => {
        const filterSort = watch('_filterSort');
        const filterTimeframe = watch('_filterTimeframe');
        const filterCategory = watch('_filterCategory');
        const tagInput = watch('_tagInput');
        const searchInput = watch('_searchInput');

        const sortOptions = {
            Relevant: ['_article_comments', 'desc'],
            Trending: ['_article_views', 'desc'],
            Upvotes: ['_article_upvotes', 'desc'],
            Recent: ['updatedAt', 'desc']
        };

        const timeframeOptions = {
            Today: 'day',
            PastWeek: 'week',
            PastMonth: 'month',
            PastYear: 'year'
        };

        let filteredArticles = _.filter(_articles, (article) => !article._article_isPrivate);

        if (sortOptions[filterSort]) {
            filteredArticles = _.orderBy(filteredArticles, ...sortOptions[filterSort]);
        }

        if (timeframeOptions[filterTimeframe]) {
            filteredArticles = _.filter(filteredArticles, (article) => (
                <Moment local date={article.updatedAt} isSame={moment(new Date(), timeframeOptions[filterTimeframe])}>
                    {same => same}
                </Moment>
            ));
        }

        if (!_.isEmpty(filterCategory)) {
            filteredArticles = _.filter(filteredArticles, (article) => _.includes(filterCategory, article._article_category));
        }

        if (!_.isEmpty(searchInput)) {
            const filterSearch = _.map(
                _.filter(_articleItems, (item) => _.includes(_.lowerCase(item.value), _.lowerCase(searchInput))),
                (item) => item.value
            );
            const lowerFilterSearch = _.map(filterSearch, (filter) => _.lowerCase(filter));
            filteredArticles = _.filter(filteredArticles, (article) => {
                const lowerInformation = _.map(_.flattenDeep(_.values(article)), (information) => _.lowerCase(information));
                return _.some(lowerFilterSearch, (filter) => _.includes(lowerInformation, filter));
            });
        }

        if (!_.isEmpty(tagInput)) {
            filteredArticles = _.filter(filteredArticles, (article) => (
                _.some(article._article_tags, (tag) => tag.includes(tagInput))
            ));
        }

        return filteredArticles;
    }

    /* Slider for Articles */
    /*
        Using a ReactSlickButton is because :
        Warning: React does not recognize the `currentSlide` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `currentslide` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
        but it needs special styling though
    */
    const ReactSlickButton = ({ currentSlide, slideCount, children, ...props }) => (
        <span {...props}>{children}</span>
    );
    const _sliderArticlesSettings = {
        dots: true,
        dotsClass: 'slick-dots d-flex',
        infinite: false,
        speed: 500,
        slidesToShow: 2.5,
        slidesToScroll: 1,
        nextArrow: (
            <ReactSlickButton>
                <FontAwesomeIcon icon={faArrowRightLong} />
            </ReactSlickButton>
        ),
        prevArrow: (
            <ReactSlickButton>
                <FontAwesomeIcon icon={faArrowLeftLong} />
            </ReactSlickButton>
        ),
        beforeChange: (nextSlide) => {
            const dots = $('.slick-dots li');
            if (nextSlide === dots.length - 1.5) {
                dots[dots.length - 1].classList.add('slick-active');
            } else {
                dots[dots.length - 1].classList.remove('slick-active');
            }
        }
    };


    /* Form.Check _filterSort */
    const [_switchSort, setSwitchSort] = useState({
        Relevant: true,
        Recent: false,
        Upvotes: false,
        Trending: false
    });
    const handleSwitchSortChange = (event) => {
        const name = event.target.name;
        const checked = event.target.checked;
        if (checked) {
            setValue('_filterSort', name);
            setSwitchSort({
                Relevant: false,
                Recent: false,
                Upvotes: false,
                Trending: false,
                [name]: true
            });
        } else {
            setValue('_filterSort', '');
            setSwitchSort({
                Relevant: false,
                Recent: false,
                Upvotes: false,
                Trending: false
            });
        }
    };
    /* Form.Check _filterSort */


    /* Form.Check _filterTimeframe */
    const [_switchTimeframe, setSwitchTimeframe] = useState({
        Today: true,
        PastWeek: false,
        PastMonth: false,
        PastYear: false
    });
    const handleSwitchTimeframeChange = (event) => {
        const name = event.target.name;
        const checked = event.target.checked;
        if (checked) {
            setValue('_filterTimeframe', name);
            setSwitchTimeframe({
                Today: false,
                PastWeek: false,
                PastMonth: false,
                PastYear: false,
                [name]: true
            });
        } else {
            setValue('_filterTimeframe', '');
            setSwitchTimeframe({
                Today: false,
                PastWeek: false,
                PastMonth: false,
                PastYear: false
            });
        }
    };
    /* Form.Check _filterTimeframe */


    /* Form.Check _filterCategory */
    const [_switchCategory, setSwitchCategory] = useState(
        Object.fromEntries(_.map(_.uniq(_.map(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), '_article_category')), __aCategory => [__aCategory, false]))
    );
    const handleSwitchCategoryChange = (event) => {
        const name = event.target.name;
        const checked = event.target.checked;
        if (checked) {
            setValue('_filterCategory', name);
            setSwitchCategory(prevState => {
                const newState = { ...prevState };
                _.uniq(_.map(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), '_article_category')).forEach(__aCategory => newState[__aCategory] = false);
                newState[name] = true;
                return newState;
            });
        } else {
            setValue('_filterCategory', '');
            setSwitchCategory(prevState => {
                const newState = { ...prevState };
                _.uniq(_.map(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), '_article_category')).forEach(__aCategory => newState[__aCategory] = false);
                return newState;
            });
        }
    };
    /* Form.Check _filterCategory */

    /* Downshift _tagInput */
    const [_typedCharactersTag, setTypedCharactersTag] = useState('');
    const [_tagSuggestion, setTagSuggestion] = useState('');
    const [__itemsTags, setItemsTags] = useState(_articleTags);
    const _handleSelectTag = (__selectedItem) => {
        if (__selectedItem) {
            // calling setValue from react-hook-form only updates the value of the specified field, it does not trigger any event handlers associated with that field in useCombobox
            setValue('_tagInput', __selectedItem.value);
            _handleChangeTag(__selectedItem.value);
        }
    }
    const _handleChangeTag = (__inputValue) => {
        const firstSuggestions = _.orderBy(
            _.uniqBy(
                _.filter(
                    _articleTags,
                    (item) =>
                        !__inputValue ||
                        _.includes(
                            _.lowerCase(item.value),
                            _.lowerCase(__inputValue)
                        )
                ),
                'value'
            ),
            ['value'],
            ['asc']
        );

        setTypedCharactersTag(__inputValue);
        setTagSuggestion((!_.isEmpty(__inputValue) && firstSuggestions[0]) ? (firstSuggestions[0].value) : '');
        setItemsTags(firstSuggestions);
    }
    const _handleBlurTag = () => {
        setTagFocused(!_.isEmpty(watch('_tagInput')) ? true : false);
        trigger('_tagInput');
    }
    const _handleFocusTag = () => {
        setTagFocused(true);
    }
    const {
        getLabelProps: getLabelPropsTag,
        getInputProps: getInputPropsTag,
        getItemProps: getItemPropsTag,
        getMenuProps: getMenuPropsTag,
        highlightedIndex: highlightedIndexTag,
        selectedItem: selectedItemTag,
        isOpen: isOpenTag
    } = useCombobox({
        items: __itemsTags,
        onInputValueChange({ inputValue }) { _handleChangeTag(inputValue) },
        onSelectedItemChange: ({ selectedItem: __selectedItem }) => _handleSelectTag(__selectedItem),
        itemToString: item => (item ? item.value : ''),
        stateReducer: (state, actionAndChanges) => {
            const { type, changes } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputClick:
                    return {
                        ...changes,
                        isOpen: true,
                    };
                default:
                    return changes;
            }
        }
    });
	getInputPropsTag({}, {suppressRefError: true});
	getMenuPropsTag({}, {suppressRefError: true});
    /* Downshift _tagInput */

    /* Downshift _searchInput */
    const [_typedCharactersSearch, setTypedCharactersSearch] = useState('');
    const [_searchSuggestion, setSearchSuggestion] = useState('');
    const [__itemsSearch, setItemsSearch] = useState(_articleItems);
    const _handleSelectSearch = (__selectedItem) => {
        if (__selectedItem) {
            // calling setValue from react-hook-form only updates the value of the specified field, it does not trigger any event handlers associated with that field in useCombobox
            setValue('_searchInput', __selectedItem.value);
            _handleChangeSearch(__selectedItem.value);
        }
    }
    const _handleChangeSearch = (__inputValue) => {
        const firstSuggestions = _.orderBy(
            _.uniqBy(
                _.filter(
                    _articleItems,
                    (item) =>
                        !__inputValue ||
                        _.includes(
                            _.lowerCase(item.value),
                            _.lowerCase(__inputValue)
                        )
                ),
                'value'
            ),
            ['value'],
            ['asc']
        );

        setTypedCharactersSearch(__inputValue);
        setSearchSuggestion((!_.isEmpty(__inputValue) && firstSuggestions[0]) ? (firstSuggestions[0].value) : '');
        setItemsSearch(firstSuggestions);
    }
    const _handleBlurSearch = () => {
        setSearchFocused(!_.isEmpty(watch('_searchInput')) ? true : false);
        trigger('_searchInput');
    }
    const _handleFocusSearch = () => {
        setSearchFocused(true);
    }
    const {
        getLabelProps: getLabelPropsSearch,
        getInputProps: getInputPropsSearch,
        getItemProps: getItemPropsSearch,
        getMenuProps: getMenuPropsSearch,
        highlightedIndex: highlightedIndexSearch,
        selectedItem: selectedItemSearch,
        isOpen: isOpenSearch
    } = useCombobox({
        items: __itemsSearch,
        onInputValueChange({ inputValue }) { _handleChangeSearch(inputValue) },
        onSelectedItemChange: ({ selectedItem: __selectedItem }) => _handleSelectSearch(__selectedItem),
        itemToString: item => (item ? item.value : ''),
        stateReducer: (state, actionAndChanges) => {
            const { type, changes } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputClick:
                    return {
                        ...changes,
                        isOpen: true,
                    };
                default:
                    return changes;
            }
        }
    });
	getInputPropsSearch({}, {suppressRefError: true});
	getMenuPropsSearch({}, {suppressRefError: true});
    /* Downshift _searchInput */

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
                                <h2 className='align-self-start mb-auto'>{_.get(_.head(_getTrendingArticles()), '_article_title')}<br />by <span>{(!_.get(_.head(_getTrendingArticles()), '_article_author._user_firstname') && !_.get(_.head(_getTrendingArticles()), '_article_author._user_lastname')) ? _.get(_.head(_getTrendingArticles()), '_article_author._user_username') : `${_.get(_.head(_getTrendingArticles()), '_article_author._user_firstname', '')} ${_.get(_.head(_getTrendingArticles()), '_article_author._user_lastname', '')}`}</span></h2>
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
                    <figure className='_figure'>{_handleArticleJSONTOHTML()}</figure>
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
                                                <p className='text-muted author'>by <b>{(_.isEmpty(_article._article_author._user_lastname) && _.isEmpty(_article._article_author._user_firstname) ? _article._article_author._user_username : (!_.isEmpty(_article._article_author._user_lastname) ? _article._article_author._user_lastname + ' ' + _article._article_author._user_firstname : _article._article_author._user_firstname))}</b>, {<Moment local fromNow>{_article.updatedAt}</Moment>}</p>
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
                            onMouseEnter={() => setShowFilterDropdown(true)}
                            onMouseLeave={() => setShowFilterDropdown(false)}
                        >
                            <Dropdown.Toggle as='span'>
                                <span className='d-flex align-items-center justify-content-center'>
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className='border-0 border-top rounded-0'>
                                <Form className='d-flex flex-column'>
                                    <Dropdown.Item as='span' eventKey='1'>
                                        <Dropdown
                                            show={_showFilterSortDropdown}
                                            drop={'end'}
                                            onMouseEnter={() => setShowFilterSortDropdown(true)}
                                            onMouseLeave={() => setShowFilterSortDropdown(false)}
                                        >
                                            <Dropdown.Toggle as='span'>
                                                <Row className='grid'>
                                                    <Col className='g-col-1 d-flex align-items-center justify-content-center'>
                                                        <FontAwesomeIcon icon={faArrowDownLong} />
                                                        <FontAwesomeIcon icon={faArrowUpLong} />
                                                    </Col>
                                                    <Col className='g-col-8 d-flex align-items-center justify-content-start'>
                                                        Sort.
                                                    </Col>
                                                    <Col className='g-col-3 d-flex align-items-center justify-content-end'>
                                                        <p>
                                                            {watch('_filterSort')}
                                                            <FontAwesomeIcon icon={faAngleRight} className='ms-2' />
                                                        </p>
                                                    </Col>
                                                </Row>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='border rounded-0'>
                                                <Dropdown.Item as='span'>
                                                    <Form.Group
                                                        controlId='_filterSort'
                                                        className='_formGroup _checkGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Relevant.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='Relevant'
                                                                onChange={handleSwitchSortChange}
                                                                checked={_switchSort.Relevant}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span'>
                                                    <Form.Group
                                                        controlId='_filterSort'
                                                        className='_formGroup _checkGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Trending.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='Trending'
                                                                onChange={handleSwitchSortChange}
                                                                checked={_switchSort.Trending}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span'>
                                                    <Form.Group
                                                        controlId='_filterSort'
                                                        className='_formGroup _checkGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Most Liked.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='Upvotes'
                                                                onChange={handleSwitchSortChange}
                                                                checked={_switchSort.Upvotes}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span'>
                                                    <Form.Group
                                                        controlId='_filterSort'
                                                        className='_formGroup _checkGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Recent.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='Recent'
                                                                onChange={handleSwitchSortChange}
                                                                checked={_switchSort.Recent}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Dropdown.Item>
                                    <Dropdown.Item as='span' eventKey='2'>
                                        <Dropdown
                                            show={_showFilterTimeframeDropdown}
                                            drop={'end'}
                                            onMouseEnter={() => setShowFilterTimeframeDropdown(true)}
                                            onMouseLeave={() => setShowFilterTimeframeDropdown(false)}
                                        >
                                            <Dropdown.Toggle as='span'>
                                                <Row className='grid'>
                                                    <Col className='g-col-1 d-flex align-items-center justify-content-center'>
                                                        <FontAwesomeIcon icon={faClock} />
                                                    </Col>
                                                    <Col className='g-col-8 d-flex align-items-center justify-content-start'>
                                                        Timeframe.
                                                    </Col>
                                                    <Col className='g-col-3 d-flex align-items-center justify-content-end'>
                                                        <p>
                                                            {watch('_filterTimeframe')}
                                                            <FontAwesomeIcon icon={faAngleRight} className='ms-2' />
                                                        </p>
                                                    </Col>
                                                </Row>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='border rounded-0'>
                                                <Dropdown.Item as='span'>
                                                    <Form.Group
                                                        controlId='_filterTimeframe'
                                                        className='_formGroup _checkGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Today.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='Today'
                                                                onChange={handleSwitchTimeframeChange}
                                                                checked={_switchTimeframe.Today}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span'>
                                                    <Form.Group
                                                        controlId='_filterTimeframe'
                                                        className='_formGroup _checkGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Past Week.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='PastWeek'
                                                                onChange={handleSwitchTimeframeChange}
                                                                checked={_switchTimeframe.PastWeek}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span'>
                                                    <Form.Group
                                                        controlId='_filterTimeframe'
                                                        className='_formGroup _checkGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Past Month.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='PastMonth'
                                                                onChange={handleSwitchTimeframeChange}
                                                                checked={_switchTimeframe.PastMonth}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span'>
                                                    <Form.Group
                                                        controlId='_filterTimeframe'
                                                        className='_formGroup _checkGroup'
                                                    >
                                                        <FloatingLabel
                                                            label='Past Year.'
                                                            className='_formLabel'
                                                        >
                                                            <Form.Check
                                                                type='switch'
                                                                className='_formSwitch'
                                                                name='PastYear'
                                                                onChange={handleSwitchTimeframeChange}
                                                                checked={_switchTimeframe.PastYear}
                                                            />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Dropdown.Item>
                                    <Dropdown.Item as='span' eventKey='3'>
                                        <Dropdown
                                            show={_showFilterCategoryDropdown}
                                            drop={'end'}
                                            onMouseEnter={() => setShowFilterCategoryDropdown(true)}
                                            onMouseLeave={() => setShowFilterCategoryDropdown(false)}
                                        >
                                            <Dropdown.Toggle as='span'>
                                                <Row className='grid'>
                                                    <Col className='g-col-1 d-flex align-items-center justify-content-center'>
                                                        <FontAwesomeIcon icon={faFolder} />
                                                    </Col>
                                                    <Col className='g-col-8 d-flex align-items-center justify-content-start'>
                                                        Category.
                                                    </Col>
                                                    <Col className='g-col-3 d-flex align-items-center justify-content-end'>
                                                        <p>
                                                            {_.size(watch('_filterCategory')) > 1 ? _.head(watch('_filterCategory')) + '...' : watch('_filterCategory')}
                                                            <FontAwesomeIcon icon={faAngleRight} className='ms-2' />
                                                        </p>
                                                    </Col>
                                                </Row>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='border rounded-0'>
                                                {
                                                    _.map(
                                                        _.uniq(_.map(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), '_article_category'))
                                                        , (__aCategory, __index) => {
                                                            return (
                                                                <Dropdown.Item as='span' key={__index}>
                                                                    <Form.Group
                                                                        controlId='_filterCategory'
                                                                        className='_formGroup _checkGroup'
                                                                    >
                                                                        <FloatingLabel
                                                                            label={`${__aCategory}.`}
                                                                            className='_formLabel __checkBox'
                                                                        >
                                                                            <Form.Check
                                                                                type='checkbox'
                                                                                className='_formCheckbox d-flex'
                                                                                name={`${__aCategory}`}
                                                                                onChange={handleSwitchCategoryChange}
                                                                                checked={_switchCategory[__aCategory]}
                                                                            />
                                                                            <Badge bg='info'>{_.size(_.filter(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), (_a) => { return _.isEqual(__aCategory, _a._article_category) }))}</Badge>
                                                                        </FloatingLabel>
                                                                    </Form.Group>
                                                                </Dropdown.Item>
                                                            )
                                                        }
                                                    )
                                                }
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item as='span' eventKey='4'>
                                        <Controller
                                            name='_tagInput'
                                            control={control}
                                            render={({ field }) => (
                                                <Form.Group
                                                    controlId='_tagInput'
                                                    className={`_formGroup _searchGroup ${_tagFocused ? 'focused' : ''}`}
                                                >
                                                    <FloatingLabel
                                                        label='Tags.'
                                                        className='_formLabel _autocomplete'
                                                        {...getLabelPropsTag()}
                                                    >
                                                        <FontAwesomeIcon icon={faHashtag} />
                                                        <Form.Control
                                                            {...getInputPropsTag({
                                                                ...field,
                                                                onFocus: _handleFocusTag,
                                                                onBlur: _handleBlurTag
                                                            }, { suppressRefError: true })}
                                                            placeholder='Tags.'
                                                            className={`_formControl border border-0 rounded-0 ${!_.isEmpty(_typedCharactersTag) ? '_typing' : ''}`}
                                                        />
                                                        <span className='d-flex align-items-center _autocorrect'>
                                                            {
                                                                (() => {
                                                                    const __tagSuggestionSplit = _.split(_tagSuggestion, '');
                                                                    const __typedCharactersTagSplit = _.split(_typedCharactersTag, '');
                                                                    const __startIndex = _.indexOf(__tagSuggestionSplit, _.head(__typedCharactersTagSplit));

                                                                    return (
                                                                        <>
                                                                            {__startIndex !== -1 && (
                                                                                <>
                                                                                    <p className='_tagSuggestion'>
                                                                                        {_.join(_.slice(__tagSuggestionSplit, 0, __startIndex), '')}
                                                                                    </p>
                                                                                </>
                                                                            )}
                                                                            <p className='_typedCharacters'>
                                                                                {_typedCharactersTag}
                                                                            </p>
                                                                            {__startIndex !== -1 && (
                                                                                <>
                                                                                    <p className='_tagSuggestion'>
                                                                                        {_.join(_.slice(__tagSuggestionSplit, __startIndex + _.size(__typedCharactersTagSplit)), '')}
                                                                                    </p>
                                                                                </>
                                                                            )}
                                                                        </>
                                                                    );
                                                                })()
                                                            }
                                                        </span>
                                                        {
                                                            (!_.isEmpty(watch('_tagInput')) || !_.isEmpty(_typedCharactersTag)) && (
                                                                <div className='_searchButton __close'
                                                                    onClick={() => {
                                                                        // calling setValue from react-hook-form only updates the value of the specified field, it does not trigger any event handlers associated with that field in useCombobox
                                                                        setValue('_tagInput', '');
                                                                        _handleChangeTag('');
                                                                    }}
                                                                >
                                                                </div>
                                                            )
                                                        }
                                                    </FloatingLabel>
                                                    <SimpleBar className='_SimpleBar' style={{ maxHeight: '40vh' }} forceVisible='y' autoHide={false}>
                                                        <ListGroup
                                                            className={`border border-0 rounded-0 d-block ${!(isOpenTag && __itemsTags.length) && 'hidden'}`}
                                                            {...getMenuPropsTag()}
                                                        >
                                                            {
                                                                isOpenTag &&
                                                                _.map(
                                                                    __itemsTags
                                                                    , (item, index) => {
                                                                        return (
                                                                            <ListGroup.Item
                                                                                className={`border border-0 rounded-0 d-flex align-items-center ${highlightedIndexTag === index && 'bg-blue-300'} ${selectedItemTag === item && 'font-bold'}`}
                                                                                key={`${item.value}${index}`}
                                                                                {...getItemPropsTag({ item, index })}
                                                                            >
                                                                                <FontAwesomeIcon icon={faHashtag} className='me-2' />
                                                                                {item.value}
                                                                            </ListGroup.Item>
                                                                        )
                                                                    }
                                                                )
                                                            }
                                                        </ListGroup>
                                                    </SimpleBar>
                                                </Form.Group>
                                            )}
                                        />
                                    </Dropdown.Item>
                                </Form>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Form>
                            <Controller
                                name='_searchInput'
                                control={control}
                                render={({ field }) => (
                                    <Form.Group
                                        controlId='_searchInput'
                                        className={`_formGroup ${_searchFocused ? 'focused' : ''}`}
                                    >
                                        <FloatingLabel
                                            label='Search.'
                                            className='_formLabel _autocomplete'
                                            {...getLabelPropsSearch()}
                                        >
                                            <Form.Control
                                                {...getInputPropsSearch({
                                                    ...field,
                                                    onFocus: _handleFocusSearch,
                                                    onBlur: _handleBlurSearch
                                                }, { suppressRefError: true })}
                                                placeholder='Search.'
                                                className={`_formControl border border-0 rounded-0 ${!_.isEmpty(_typedCharactersSearch) ? '_typing' : ''}`}
                                            />
                                            <span className='d-flex align-items-center _autocorrect'>
                                                {
                                                    (() => {
                                                        const __searchSuggestionSplit = _.split(_searchSuggestion, '');
                                                        const __typedCharactersSearchSplit = _.split(_typedCharactersSearch, '');
                                                        const __startIndex = _.indexOf(__searchSuggestionSplit, _.head(__typedCharactersSearchSplit));

                                                        return (
                                                            <>
                                                                {__startIndex !== -1 && (
                                                                    <>
                                                                        <p className='_searchSuggestion'>
                                                                            {_.join(_.slice(__searchSuggestionSplit, 0, __startIndex), '')}
                                                                        </p>
                                                                    </>
                                                                )}
                                                                <p className='_typedCharacters'>
                                                                    {_typedCharactersSearch}
                                                                </p>
                                                                {__startIndex !== -1 && (
                                                                    <>
                                                                        <p className='_searchSuggestion'>
                                                                            {_.join(_.slice(__searchSuggestionSplit, __startIndex + _.size(__typedCharactersSearchSplit)), '')}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </>
                                                        );
                                                    })()
                                                }
                                            </span>
                                            {
                                                (!_.isEmpty(watch('_searchInput')) || !_.isEmpty(_typedCharactersSearch)) && (
                                                    <div className='_searchButton __close'
                                                        onClick={() => {
                                                            // calling setValue from react-hook-form only updates the value of the specified field, it does not trigger any event handlers associated with that field in useCombobox
                                                            setValue('_searchInput', '');
                                                            _handleChangeSearch('');
                                                        }}
                                                    >
                                                    </div>
                                                )
                                            }
                                        </FloatingLabel>
                                        <SimpleBar className='_SimpleBar' style={{ maxHeight: '40vh' }} forceVisible='y' autoHide={false}>
                                            <ListGroup
                                                className={`border border-0 rounded-0 d-block ${!(isOpenSearch && __itemsSearch.length) && 'hidden'}`}
                                                {...getMenuPropsSearch()}
                                            >
                                                {
                                                    (isOpenSearch && !_showFilterDropdown) &&
                                                    _.map(
                                                        __itemsSearch
                                                        , (item, index) => {
                                                            return (
                                                                <ListGroup.Item
                                                                    className={`border border-0 rounded-0 d-flex align-items-center ${highlightedIndexSearch === index && 'bg-blue-300'} ${selectedItemSearch === item && 'font-bold'}`}
                                                                    key={`${item.value}${index}`}
                                                                    {...getItemPropsSearch({ item, index })}
                                                                >
                                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className='me-2' />
                                                                    {item.value}
                                                                </ListGroup.Item>
                                                            )
                                                        }
                                                    )
                                                }
                                            </ListGroup>
                                        </SimpleBar>
                                    </Form.Group>
                                )}
                            />
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
                                                <p className='text-muted author'>by <b>{(_.isEmpty(_article._article_author._user_lastname) && _.isEmpty(_article._article_author._user_firstname) ? _article._article_author._user_username : (!_.isEmpty(_article._article_author._user_lastname) ? _article._article_author._user_lastname + ' ' + _article._article_author._user_firstname : _article._article_author._user_firstname))}</b>, {<Moment local fromNow>{_article.updatedAt}</Moment>}</p>
                                                <h4>{_article._article_title}</h4>
                                                <p className='category align-self-end'>{_article._article_category}</p>
                                                <ul className='text-muted tags d-flex flex-row align-items-start'>
                                                    {
                                                        _.map(_article._article_tags, (_t, _i) => {
                                                            return (
                                                                <li
                                                                    key={`${_i}`}
                                                                    className={`tag_item border rounded-0 d-flex align-items-center`}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faHashtag
                                                                        }
                                                                    />
                                                                    <p>
                                                                        {_.upperFirst(
                                                                            _t
                                                                        )}
                                                                        .
                                                                    </p>
                                                                </li>
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