import { useCallback, useEffect, useState } from 'react';
import {
    NavLink,
    useLocation
} from 'react-router-dom';
import { _useStore } from '../../store/store';
import axios from 'axios';
import Moment from 'react-moment';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { useForm } from 'react-hook-form';
import Downshift from 'downshift';
import logo from '../../assets/_images/logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye } from '@fortawesome/free-regular-svg-icons';
import { faCommentAlt, faThumbsDown, faThumbsUp, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import $ from 'jquery';

const Header = (props) => {
    const _articles = _useStore((state) => state._articles);
    const setArticles = _useStore((state) => state.setArticles);
    const _projects = _useStore((state) => state._projects);
    const setProjects = _useStore((state) => state.setProjects);

    const [_typedCharactersSearch, setTypedCharactersSearch] = useState('');
    const [_searchSuggestion, setSearchSuggestion] = useState('');

    let location = useLocation();

    const {
        register,
        watch,
        resetField,
        setFocus,
        getValues,
        setValue
    } = useForm({
        mode: 'onTouched',
        reValidateMode: 'onSubmit',
        defaultValues: {
            _searchInput: ''
        }
    });

    const [_searchFocused, setSearchFocused] = useState(false);
    const [_showAccountDropdown, setShowAccountDropdown] = useState(false);

    const [_currentPage, setCurrentPage] = useState(1);
    const [_cardsPerPage] = useState(4);
    const [_showModal, setShowModal] = useState(false);

    let _articleTags = _.map(_.uniq(_.flattenDeep(_.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), ('_article_tags')))), (_tag, _index) => {
        return {
            value: _tag
        }
    });
    let _projectTags = _.map(_.uniq(_.flattenDeep(_.map(_.filter(_projects, (_project) => { return !_project._project_hide }), ('_project_tag')))), (_tag, _index) => {
        return {
            value: _tag
        }
    });
    let _articleItems = _.orderBy(_.uniqBy(_.map(_.union(_.flattenDeep(_.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_tags')), _.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_title'), _.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_author'), _.map(_.filter(_articles, (_article) => { return !_article._article_isPrivate }), '_article_category')), (_search, _index) => {
        return {
            value: _.toLower(_search.replace(/\.$/, ""))
        }
    }), 'value'), ['value'], ['asc']);
    let _projectItems = _.orderBy(_.uniqBy(_.map(_.union(_.flattenDeep(_.map(_.filter(_projects, (_project) => { return !_project._project_hide }), '_project_tag')), _.map(_.filter(_projects, (_project) => { return !_project._project_hide }), '_project_title'), _.map(_.filter(_projects, (_project) => { return !_project._project_hide }), '_project_author')), (_search, _index) => {
        return {
            value: _.toLower(_search.replace(/\.$/, ""))
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

    const _handleJSONTOHTML = (_target, _input, index) => {
        const html = $.parseHTML(_input);
        $('.' + _target + ' .card_' + index + ' figure').html($(html).find('img').first());
    }

    const _handleClickPage = (_number) => {
        setCurrentPage(_.toNumber(_number));
    }

    const _articlesToShow = (_articles, _projects) => {
        return _.filter(
            _.union(
                _.orderBy(_.filter(_articles, (_articleSort) => { return !_articleSort._article_isPrivate }), ['updatedAt'], ['desc']),
                _.orderBy(_.filter(_projects, (_projectSort) => { return !_projectSort._project_hide }), ['updatedAt'], ['desc'])
            ),
            (_search) => {
                let _filterSearch = _.map(_.filter(_.union(_articleItems, _projectItems), (item) => { return _.includes(_.lowerCase(item.value), _.lowerCase(watch(['_searchInput'])[0])) }), (item, index) => { return (item.value) });
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

    useEffect(() => {
        _getArticles();
        _getProjects();

        const subscription = watch((value, { name, type }) => { });
        return () => subscription.unsubscribe();
    }, [_getArticles, _getProjects, watch, setFocus]);

    return (
        <header>
            <Navbar key='xxl' expand='xxl' collapseOnSelect>
                <Container fluid>
                    <Navbar.Toggle aria-controls='offcanvasNavbar-expand-xxl'>
                        <span className='hamburger'>
                            <svg width='300' height='300' version='1.1' id='Layer_1' viewBox='-50 -50 100 100' preserveAspectRatio='none'>
                                <g strokeWidth='2' strokeLinecap='round' strokeMiterlimit='10'>
                                    <line className='one' x1='0' y1='20' x2='50' y2='20'></line>
                                    <line className='three' x1='0' y1='30' x2='50' y2='30'></line>
                                </g>
                            </svg>
                        </span>
                    </Navbar.Toggle>
                    <Navbar.Collapse className='show'>
                        <Nav className='d-flex flex-row justify-content-end'>
                            <Nav.Item className='me-auto'>
                                <NavLink to='/' className='logo d-flex align-items-center'>
                                    <img className='img-fluid' src={logo} alt='#' />
                                </NavLink>
                            </Nav.Item>
                            <Nav.Item>
                                <Form onClick={() => setFocus('_searchInput')}>
                                    <Downshift
                                        onSelect={
                                            selection => {
                                                if (selection) {
                                                    setValue('_searchInput', selection.value);
                                                    setShowModal(!_.isEmpty(selection.value) ? true : false);
                                                }
                                            }
                                        }
                                        itemToString={
                                            item => (item ? item.value : getValues('_searchInput') || '')
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
                                                className={`_formGroup _searchGroup ${_searchFocused || !_.isEmpty(getValues('_searchInput')) ? 'focused' : ''}`}
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
                                                        className={`_formControl border border-0 rounded-0 ${!_.isEmpty(_typedCharactersSearch) ? '_typing' : ''}`}
                                                        name='_searchInput'
                                                        {...getInputProps({
                                                            onChange: (event) => {
                                                                const firstSuggestion = _.orderBy(
                                                                    _.uniqBy(
                                                                        _.filter(
                                                                            _.union(_articleItems, _projectItems),
                                                                            (item) =>
                                                                                !event.target.value ||
                                                                                _.includes(
                                                                                    _.lowerCase(item.value),
                                                                                    _.lowerCase(event.target.value)
                                                                                )
                                                                        ),
                                                                        'value'
                                                                    ),
                                                                    ['value'],
                                                                    ['asc']
                                                                )[0];

                                                                setTypedCharactersSearch(event.target.value);
                                                                //Using && returns false so if you are using it to affect to a variable, keep in mind it will affect in false
                                                                setSearchSuggestion((!_.isEmpty(event.target.value) && firstSuggestion) ? (firstSuggestion.value) : '');

                                                                setCurrentPage(_.toNumber(1));
                                                                setValue('_searchInput', event.target.value);
                                                                setShowModal(!_.isEmpty(event.target.value) ? true : false);
                                                            },
                                                            onFocus: () => {
                                                                openMenu();
                                                                setSearchFocused(true);
                                                            },
                                                            onBlur: (event) => {
                                                                // This onBlur will fire everytime the form changes instead of when loosing focus, 
                                                                // because the Downshift is interacting with outside elements
                                                                setSearchFocused(!_.isEmpty(event.target.value) ? true : false);
                                                            }
                                                        })}
                                                    />
                                                    <span className='d-flex align-items-center _autocorrect'>
                                                        {_.size(_.slice(_.lowerCase(_searchSuggestion), 0, _.lowerCase(_searchSuggestion).indexOf(_.lowerCase(_typedCharactersSearch)))) > 0 && <p className='_searchSuggestion'>{_.slice(_.lowerCase(_searchSuggestion), 0, _.lowerCase(_searchSuggestion).indexOf(_.lowerCase(_typedCharactersSearch)))}</p>}
                                                        {_.size(_.lowerCase(_typedCharactersSearch)) > 0 && <p className='_typedCharacters'>{_.lowerCase(_searchSuggestion).indexOf(_.lowerCase(_typedCharactersSearch)) < 1 ? _.capitalize(_typedCharactersSearch) : _typedCharactersSearch}</p>}
                                                        {_.size(_.slice(_.lowerCase(_searchSuggestion), _.lowerCase(_searchSuggestion).indexOf(_.lowerCase(_typedCharactersSearch)) + _.size(_.lowerCase(_typedCharactersSearch)))) > 0 && <p className='_searchSuggestion'>{_.slice(_.lowerCase(_searchSuggestion), _.lowerCase(_searchSuggestion).indexOf(_.lowerCase(_typedCharactersSearch)) + _.size(_.lowerCase(_typedCharactersSearch)))}</p>}
                                                    </span>
                                                </FloatingLabel>
                                                {
                                                    (!_.isEmpty(watch('_searchInput')) || !_.isEmpty(_typedCharactersSearch)) 
                                                        ?
                                                        <div className='_searchButton _formClear'
                                                            onClick={() => {
                                                                setTypedCharactersSearch('');
                                                                setSearchSuggestion('');
                                                                resetField('_searchInput');
                                                                clearSelection();
                                                                setShowModal(false);
                                                            }}
                                                        ></div>
                                                        :
                                                        <div className='_searchButton'></div>
                                                }
                                                <ListGroup
                                                    className='border border-0 rounded-0 d-block'
                                                    {...getMenuProps()}
                                                >
                                                    {
                                                        (isOpen && !_showAccountDropdown) &&
                                                        _.map(
                                                            _.orderBy(
                                                                _.uniqBy(
                                                                    _.filter(
                                                                        _.union(_articleItems, _projectItems),
                                                                        (item) => 
                                                                            !inputValue ||
                                                                            _.includes(
                                                                                _.lowerCase(item.value),
                                                                                _.lowerCase(inputValue)
                                                                            )
                                                                    ),
                                                                    'value'
                                                                ),
                                                                ['value'],
                                                                ['asc']
                                                            )
                                                            , (item, index) => {
                                                                return (
                                                                    <ListGroup.Item
                                                                        className='border border-0 rounded-0 d-flex align-items-center'
                                                                        {...getItemProps({
                                                                            key: index,
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
                                                    }
                                                </ListGroup>
                                            </Form.Group>
                                        )}
                                    </Downshift>
                                </Form>
                            </Nav.Item>
                            <Nav.Item>
                                <Dropdown
                                    show={_showAccountDropdown}
                                    onMouseEnter={() => setShowAccountDropdown(true)}
                                    onMouseLeave={() => setShowAccountDropdown(false)}>
                                    <Dropdown.Toggle as='span'>
                                        <span className='d-flex align-items-center justify-content-center'>
                                            <FontAwesomeIcon icon={faUser} />
                                            <span className='hover_effect'></span>
                                        </span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className='border rounded-0'>
                                        {
                                            _.isEqual(location.pathname, '/login') ?
                                                ''
                                                :
                                                <Dropdown.Item
                                                    href='/login'
                                                >
                                                    Login<b className='pink_dot'>.</b>
                                                </Dropdown.Item>
                                        }
                                        {
                                            _.isEqual(location.pathname, '/signup') ?
                                                ''
                                                :
                                                <Dropdown.Item
                                                    href='/signup'
                                                >
                                                    Signup<b className='pink_dot'>.</b>
                                                </Dropdown.Item>
                                        }
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav.Item>
                        </Nav>
                    </Navbar.Collapse>
                    <Navbar.Offcanvas
                        id='offcanvasNavbar-expand-xxl'
                        aria-labelledby='offcanvasNavbarLabel-expand-xxl'
                        placement='start'
                    >
                        <Offcanvas.Header />
                        <Offcanvas.Body className='d-flex flex-column justify-content-center'>
                            <Nav className='align-items-center'>
                                {/* The active thingy is only working through navigation somehow, but if i hit previous or i go into a post */}
                                <Nav.Item className='text-center'>
                                    <Nav.Link
                                        as={NavLink}
                                        to='/'
                                        eventKey='0'
                                        className='nav-link d-flex align-items-center'
                                        end
                                    >
                                        Home<b className='pink_dot'>.</b>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className='text-center'>
                                    <Nav.Link
                                        as={NavLink}
                                        to='/blog'
                                        eventKey='1'
                                        className='nav-link d-flex align-items-center'
                                    >
                                        Blog<b className='pink_dot'>.</b>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className='text-center'>
                                    <Nav.Link
                                        as={NavLink}
                                        to='/process'
                                        eventKey='2'
                                        className='nav-link d-flex align-items-center'
                                    >
                                        Process<b className='pink_dot'>.</b>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className='text-center'>
                                    <Nav.Link
                                        as={NavLink}
                                        to='/feedback'
                                        eventKey='3'
                                        className='nav-link d-flex align-items-center'
                                    >
                                        Feedback<b className='pink_dot'>.</b>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className='text-center'>
                                    <Nav.Link
                                        as={NavLink}
                                        to='/aboutus'
                                        eventKey='4'
                                        className='nav-link d-flex align-items-center'
                                    >
                                        About Us<b className='pink_dot'>.</b>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>

            <Modal className='_searchModal' enforceFocus={false} show={_showModal} onEntered={() => setFocus('_searchInput')} onHide={() => setShowModal(false)} fullscreen>
                <Modal.Header></Modal.Header>
                <Modal.Body>
                    <div className='_page grid m-auto'>
                        {
                            _.map(
                                _.slice(
                                    _articlesToShow(_articles, _projects),
                                    ((_currentPage * _cardsPerPage) - _cardsPerPage),
                                    (_currentPage * _cardsPerPage)
                                ),
                                (_object, index) => {
                                    return (
                                        <Card className={`g-col-3 border border-0 rounded-0 card_${index}`} key={index}>
                                            <Card.Body className='d-flex flex-column'>
                                                <figure>{_handleJSONTOHTML('_searchModal', _object._article_body ? _object._article_body : _object._project_image, index)}</figure>
                                                <p className='text-muted author'>by <b>{_object._article_author ? _object._article_author : _object._project_author}</b>, {<Moment local fromNow>{_object.updatedAt}</Moment>}</p>
                                                <h4>{_object._article_title ? _object._article_title : _object._project_title}</h4>
                                                <p className='category align-self-end'>{_object._article_category ? _object._article_category : 'Project'}</p>
                                                <ul className='text-muted tags'>
                                                    {
                                                        _object._article_tags ?
                                                            _.map(_object._article_tags, (_t, _i) => {
                                                                return (
                                                                    <li key={_i} className='tag_item'>{_t}</li>
                                                                )
                                                            })
                                                            :
                                                            _.map(_object._project_tag, (_t, _i) => {
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
                                                    href={_object._project_link ? _object._project_link : `/blog/${_object._id}`}
                                                    data-am-linearrow='tooltip tooltip-bottom'
                                                    display-name={_object._project_link ? 'Visit' : 'Read More'}
                                                >
                                                    <div className='line line-1'></div>
                                                    <div className='line line-2'></div>
                                                </Button>
                                                <div className='_footerInformation d-flex'>
                                                    <p className='d-flex align-items-center text-muted _views'><b>{_.size(_object._article_views ? _object._article_views : _object._project_view)}</b><FontAwesomeIcon icon={faEye} /></p>
                                                    <p className='d-flex align-items-center text-muted _comments'><b>{_.size(_object._article_comments ? _object._article_comments : _object._project_comment)}</b><FontAwesomeIcon icon={faCommentAlt} /></p>
                                                    <p className='d-flex align-items-center text-muted _upvotes'><b>{_.size(_object._article_upvotes ? _object._article_upvotes : _object._project_upvotes)}</b><FontAwesomeIcon icon={faThumbsUp} /></p>
                                                    <p className='d-flex align-items-center text-muted _downvotes'><b>{_.size(_object._article_downvotes ? _object._article_downvotes : _object._project_downvotes)}</b><FontAwesomeIcon icon={faThumbsDown} /></p>
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
                                                _.size(_articlesToShow(_articles, _projects)) / _cardsPerPage
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
                    <div className='_suggestions m-auto'>
                        <div className='togglebtn'><span role='img' aria-label='sheep'>👉</span> May we suggest?</div>
                        <ul className='text-muted tags'>
                            {
                                _.map(
                                    _.union(_articleTags, _projectTags, _articleItems, _projectItems), (data, index) => {
                                        return (
                                            <li
                                                key={index}
                                                className='tag_item'
                                                onClick={() => { setValue('_searchInput', data.value) }}
                                            >
                                                {data.value}
                                            </li>
                                        )
                                    }
                                )
                            }
                        </ul>
                    </div>
                </Modal.Body>
                <Modal.Footer className='d-flex justify-content-start align-items-center'>
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
                                            _articlesToShow(_articles, _projects),
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
                                        _articlesToShow(_articles, _projects)
                                    )
                                )
                            }
                        </strong>
                        &nbsp; articles.
                    </div>
                </Modal.Footer>
            </Modal>
        </header>
    );
}

export default Header;