// React Hooks
import { useCallback, useEffect, useState } from 'react';

// React Router
import { NavLink, useLocation } from 'react-router-dom';

// Third-Party State Management
import _useStore from '../../store';

// HTTP Client
import axios from 'axios';

// Date Formatting
import Moment from 'react-moment';

// Virtual Scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

// Bootstrap Components
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';

// Form Handling & Validation
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// Combobox (Dropdown Autocomplete)
import { useCombobox } from 'downshift';

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faUser } from '@fortawesome/free-regular-svg-icons';
import {
    faCommentAlt,
    faHashtag,
    faMagnifyingGlass,
    faThumbsDown,
    faThumbsUp,
} from '@fortawesome/free-solid-svg-icons';

// Utility Libraries
import _ from 'lodash';
import $ from 'jquery';

// Static Assets
import logo from '../../assets/_images/logo.svg';

/*
 * @Purpose: Handle specific cases for search box and tag selection behavior.
 *
 * 1. Clear the search box on modal close to avoid retaining the previous input 
 *    when navigating to another page.
 * 2. Prevent re-selection of a tag that has already been selected.
 */

const Header = (props) => {
    const { article, project } = _useStore();

    // Access your states and actions like this:
    const _articles = article._articles;
    const setArticles = article['_articles_SET_STATE'];

    const _projects = project._projects;
    const setProjects = project['_projects_SET_STATE'];

    let location = useLocation();

    const _validationSchema = Yup.object().shape({
        _searchInput: Yup.string().default(''),
    });

    const { watch, setFocus, setValue, trigger, control } = useForm({
        mode: 'onTouched',
        reValidateMode: 'onChange',
        resolver: yupResolver(_validationSchema),
        defaultValues: {
            _searchInput: '',
        },
    });

    /* Focus State Variables */
    const [_searchFocused, setSearchFocused] = useState(false);

    /* Dropdown State Variables */
    const [_showAccountDropdown, setShowAccountDropdown] = useState(false);

    /* Modal State Variables */
    const [_currentPage, setCurrentPage] = useState(1);
    const [_cardsPerPage] = useState(4);
    const [_showModal, setShowModal] = useState(false);

    /* Form.Control data */
    let _articleTags = _.map(
        _.uniq(
            _.flattenDeep(
                _.map(
                    _.filter(_articles, (_article) => {
                        return !_article._article_isPrivate;
                    }),
                    '_article_tags'
                )
            )
        ),
        (_tag, _index) => {
            return {
                value: _tag,
            };
        }
    );
    let _projectTags = _.map(
        _.uniq(
            _.flattenDeep(
                _.map(
                    _.filter(_projects, (_project) => {
                        return !_project._project_toDisplay;
                    }),
                    '_project_tags'
                )
            )
        ),
        (_tag, _index) => {
            return {
                value: _tag,
            };
        }
    );
    let _articleItems = _.orderBy(
        _.uniqBy(
            _.map(
                _.union(
                    _.flattenDeep(
                        _.map(
                            _.filter(_articles, (_article) => {
                                return !_article._article_isPrivate;
                            }),
                            '_article_tags'
                        )
                    ),
                    _.map(
                        _.filter(_articles, (_article) => {
                            return !_article._article_isPrivate;
                        }),
                        '_article_title'
                    ),
                    _.compact(
                        _.flatMap(
                            _.map(
                                _.filter(_articles, (_article) => {
                                    return !_article._article_isPrivate;
                                }),
                                (_article) => ({
                                    username: _article._article_author._user_username,
                                    firstname: _article._article_author._user_firstname,
                                    lastname: _article._article_author._user_lastname,
                                    email: _article._article_author._user_email
                                })
                            ),
                            (__u) => [
                                __u.email,
                                __u.firstname,
                                __u.lastname,
                                __u.teamTitle,
                                __u.username,
                            ]
                        )
                    ),
                    _.map(
                        _.filter(_articles, (_article) => {
                            return !_article._article_isPrivate;
                        }),
                        '_article_category'
                    )
                ),
                (_search, _index) => {
                    return {
                        value: _.toLower(_search.replace(/\.$/, '')),
                    };
                }
            ),
            'value'
        ),
        ['value'],
        ['asc']
    );
    let _projectItems = _.orderBy(
        _.uniqBy(
            _.map(
                _.union(
                    _.flattenDeep(
                        _.map(
                            _.filter(_projects, (_project) => {
                                return !_project._project_toDisplay;
                            }),
                            '_project_tags'
                        )
                    ),
                    _.map(
                        _.filter(_projects, (_project) => {
                            return !_project._project_toDisplay;
                        }),
                        '_project_title'
                    )
                ),
                (_search, _index) => {
                    return {
                        value: _.toLower(_search.replace(/\.$/, '')),
                    };
                }
            ),
            'value'
        ),
        ['value'],
        ['asc']
    );

    const _getArticles = useCallback(async () => {
        axios('/api/article')
            .then((response) => {
                setArticles(response.data._articles);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [setArticles]);

    const _getProjects = useCallback(async () => {
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
    }, [setProjects]);

    const _handleJSONTOHTML = (_target, _input, index) => {
        const html = $.parseHTML(_input);
        $('.' + _target + ' .card_' + index + ' figure').html(
            $(html).find('img').first()
        );
    };

    const _handleClickPage = (_number) => {
        setCurrentPage(_.toNumber(_number));
    };

    const _articlesToShow = (_articles, _projects) => {
        return _.filter(
            _.union(
                _.orderBy(
                    _.filter(_articles, (_articleSort) => {
                        return !_articleSort._article_isPrivate;
                    }),
                    ['updatedAt'],
                    ['desc']
                ),
                _.orderBy(
                    _.filter(_projects, (_projectSort) => {
                        return !_projectSort._project_toDisplay;
                    }),
                    ['updatedAt'],
                    ['desc']
                )
            ),
            (_search) => {
                let _filterSearch = _.map(
                    _.filter(_.union(_articleItems, _projectItems), (item) => {
                        return _.includes(
                            _.lowerCase(item.value),
                            _.lowerCase(watch(['_searchInput'])[0])
                        );
                    }),
                    (item, index) => {
                        return item.value;
                    }
                );
                let _lowerFilterSearch = _.map(_filterSearch, (_filter) => {
                    return _.lowerCase(_filter);
                });
                let _lowerInformation = _.map(
                    _.flattenDeep(_.values(_search)),
                    (_information) => {
                        return _.lowerCase(_information);
                    }
                );
                return _.isEmpty(watch(['_searchInput']))
                    ? true
                    : _.some(_lowerFilterSearch, (_filter) =>
                        _.includes(_lowerInformation, _filter)
                    );
            }
        );
    };

    /* Downshift */
    const [_typedCharactersSearch, setTypedCharactersSearch] = useState('');
    const [_searchSuggestion, setSearchSuggestion] = useState('');
    const [__items, setItems] = useState(
        _.orderBy(
            _.uniqBy(_.union(_articleItems, _projectItems), 'value'),
            ['value'],
            ['asc']
        )
    );
    const _handleSelect = (__selectedItem) => {
        if (__selectedItem) {
            /* calling setValue from react-hook-form only updates the value of the specified field, it does not trigger any event handlers associated with that field in useCombobox */
            setValue('_searchInput', __selectedItem.value);
            _handleChange(__selectedItem.value);
        }
    };
    const _handleChange = (__inputValue) => {
        const firstSuggestions = _.orderBy(
            _.uniqBy(
                _.filter(
                    _.union(_articleItems, _projectItems),
                    (item) =>
                        !__inputValue ||
                        _.includes(_.lowerCase(item.value), _.lowerCase(__inputValue))
                ),
                'value'
            ),
            ['value'],
            ['asc']
        );

        setTypedCharactersSearch(__inputValue);
        setSearchSuggestion(
            !_.isEmpty(__inputValue) && firstSuggestions[0]
                ? firstSuggestions[0].value
                : ''
        );
        setShowModal(!_.isEmpty(__inputValue) ? true : false);
        setCurrentPage(_.toNumber(1));
        setItems(firstSuggestions);
    };
    const _handleBlur = () => {
        setSearchFocused(!_.isEmpty(watch('_searchInput')) ? true : false);
        trigger('_searchInput');
    };
    const _handleFocus = () => {
        setSearchFocused(true);
    };
    const {
        getLabelProps,
        getInputProps,
        getItemProps,
        getMenuProps,
        highlightedIndex,
        selectedItem,
        isOpen,
    } = useCombobox({
        items: __items,
        onInputValueChange({ inputValue }) {
            _handleChange(inputValue);
        },
        onSelectedItemChange: ({ selectedItem: __selectedItem }) =>
            _handleSelect(__selectedItem),
        itemToString: (item) => (item ? item.value : ''),
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
        },
    });
    /* Downshift */

    useEffect(() => {
        _getArticles();
        _getProjects();

        const subscription = watch((value, { name, type }) => { });
        return () => subscription.unsubscribe();
    }, [_getArticles, _getProjects, watch]);

    return (
        <header>
            <Navbar key='xxl' expand='xxl' collapseOnSelect>
                <Container fluid>
                    <Navbar.Toggle aria-controls='offcanvasNavbar-expand-xxl'>
                        <span className='hamburger'>
                            <svg
                                width='300'
                                height='300'
                                version='1.1'
                                id='Layer_1'
                                viewBox='-50 -50 100 100'
                                preserveAspectRatio='none'
                            >
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
                                    <Controller
                                        name='_searchInput'
                                        control={control}
                                        render={({ field }) => (
                                            <Form.Group
                                                controlId='_searchInput'
                                                className={`_formGroup _searchGroup ${_searchFocused ? 'focused' : ''
                                                    }`}
                                            >
                                                <FloatingLabel
                                                    label='Search.'
                                                    className='_formLabel _autocomplete'
                                                    {...getLabelProps()}
                                                >
                                                    <Form.Control
                                                        {...getInputProps({
                                                            ...field,
                                                            onFocus: _handleFocus,
                                                            onBlur: _handleBlur,
                                                        })}
                                                        placeholder='Search.'
                                                        className={`_formControl rounded-0 ${!_.isEmpty(_typedCharactersSearch)
                                                            ? '_typing'
                                                            : ''
                                                            }`}
                                                    />
                                                    <span className='d-flex align-items-center _autocorrect'>
                                                        {(() => {
                                                            const __searchSuggestionSplit = _.split(
                                                                _searchSuggestion,
                                                                ''
                                                            );
                                                            const __typedCharactersSearchSplit = _.split(
                                                                _typedCharactersSearch,
                                                                ''
                                                            );
                                                            const __startIndex = _.indexOf(
                                                                __searchSuggestionSplit,
                                                                _.head(__typedCharactersSearchSplit)
                                                            );

                                                            return (
                                                                <>
                                                                    {__startIndex !== -1 && (
                                                                        <>
                                                                            <p className='_searchSuggestion'>
                                                                                {_.join(
                                                                                    _.slice(
                                                                                        __searchSuggestionSplit,
                                                                                        0,
                                                                                        __startIndex
                                                                                    ),
                                                                                    ''
                                                                                )}
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                    <p className='_typedCharacters'>
                                                                        {_typedCharactersSearch}
                                                                    </p>
                                                                    {__startIndex !== -1 && (
                                                                        <>
                                                                            <p className='_searchSuggestion'>
                                                                                {_.join(
                                                                                    _.slice(
                                                                                        __searchSuggestionSplit,
                                                                                        __startIndex +
                                                                                        _.size(
                                                                                            __typedCharactersSearchSplit
                                                                                        )
                                                                                    ),
                                                                                    ''
                                                                                )}
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </span>
                                                </FloatingLabel>
                                                {!_.isEmpty(watch('_searchInput')) ||
                                                    !_.isEmpty(_typedCharactersSearch) ? (
                                                    <div
                                                        className='_searchButton __close'
                                                        onClick={() => {
                                                            /* calling setValue from react-hook-form only updates the value of the specified field, it does not trigger any event handlers associated with that field in useCombobox */
                                                            setValue('_searchInput', '');
                                                            _handleChange('');
                                                        }}
                                                    ></div>
                                                ) : (
                                                    <div className='_searchButton'></div>
                                                )}
                                                <SimpleBar
                                                    className='_SimpleBar'
                                                    style={{
                                                        maxHeight: '40vh',
                                                    }}
                                                    forceVisible='y'
                                                    autoHide={false}
                                                >
                                                    <ListGroup
                                                        className={`border border-0 rounded-0 d-block ${!(isOpen && __items.length) && 'hidden'
                                                            }`}
                                                        {...getMenuProps()}
                                                    >
                                                        {isOpen &&
                                                            !_showAccountDropdown &&
                                                            _.map(__items, (item, index) => {
                                                                return (
                                                                    <ListGroup.Item
                                                                        className={`border border-0 rounded-0 d-flex align-items-center ${highlightedIndex === index &&
                                                                            'bg-blue-300'
                                                                            } ${selectedItem === item && 'font-bold'}`}
                                                                        key={`${item.value}${index}`}
                                                                        {...getItemProps({
                                                                            item,
                                                                            index,
                                                                        })}
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={faMagnifyingGlass}
                                                                            className='me-2'
                                                                        />
                                                                        {item.value}
                                                                    </ListGroup.Item>
                                                                );
                                                            })}
                                                    </ListGroup>
                                                </SimpleBar>
                                            </Form.Group>
                                        )}
                                    />
                                </Form>
                            </Nav.Item>
                            <Nav.Item>
                                <Dropdown
                                    show={_showAccountDropdown}
                                    onMouseEnter={() => setShowAccountDropdown(true)}
                                    onMouseLeave={() => setShowAccountDropdown(false)}
                                >
                                    <Dropdown.Toggle as='span'>
                                        <span className='d-flex align-items-center justify-content-center'>
                                            <FontAwesomeIcon icon={faUser} />
                                            <span className='hover_effect'></span>
                                        </span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className='border rounded-0'>
                                        {_.isEqual(location.pathname, '/login') ? (
                                            ''
                                        ) : (
                                            <Dropdown.Item href='/login'>
                                                Login
                                                <b className='pink_dot'>.</b>
                                            </Dropdown.Item>
                                        )}
                                        {_.isEqual(location.pathname, '/signup') ? (
                                            ''
                                        ) : (
                                            <Dropdown.Item href='/signup'>
                                                Signup
                                                <b className='pink_dot'>.</b>
                                            </Dropdown.Item>
                                        )}
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

            <Modal
                className='_searchModal'
                enforceFocus={false}
                show={_showModal}
                onEntered={() => setFocus('_searchInput')}
                onHide={() => setShowModal(false)}
                fullscreen
            >
                <Modal.Header></Modal.Header>
                <Modal.Body>
                    <div className='_page grid m-auto'>
                        {_.map(
                            _.slice(
                                _articlesToShow(_articles, _projects),
                                _currentPage * _cardsPerPage - _cardsPerPage,
                                _currentPage * _cardsPerPage
                            ),
                            (_object, index) => {
                                return (
                                    <Card
                                        className={`g-col-3 border border-0 rounded-0 card_${index}`}
                                        key={index}
                                    >
                                        <Card.Body className='d-flex flex-column'>
                                            <figure>
                                                {_handleJSONTOHTML(
                                                    '_searchModal',
                                                    _object._article_body
                                                        ? _object._article_body
                                                        : _object._project_image,
                                                    index
                                                )}
                                            </figure>
                                            <p className='text-muted author'>
                                                {!_.isEmpty(_object._project_teams) ||
                                                    !_.isEmpty(_object._article_author) ? (
                                                    <>
                                                        by{' '}
                                                        <b>
                                                            {_object._article_author
                                                                ? _.isEmpty(
                                                                    _object._article_author._user_lastname
                                                                ) &&
                                                                    _.isEmpty(
                                                                        _object._article_author._user_firstname
                                                                    )
                                                                    ? _object._article_author._user_username
                                                                    : !_.isEmpty(
                                                                        _object._article_author._user_lastname
                                                                    )
                                                                        ? _object._article_author._user_lastname +
                                                                        ' ' +
                                                                        _object._article_author._user_firstname
                                                                        : _object._article_author._user_firstname
                                                                : _.join(
                                                                    _.map(
                                                                        _object._project_teams,
                                                                        'Team._team_title'
                                                                    ),
                                                                    ', '
                                                                )}
                                                        </b>
                                                        ,{' '}
                                                        <Moment local fromNow>
                                                            {_object.updatedAt}
                                                        </Moment>
                                                    </>
                                                ) : (
                                                    <>&nbsp;</>
                                                )}
                                            </p>
                                            <h4>
                                                {_object._article_title
                                                    ? _object._article_title
                                                    : _object._project_title}
                                            </h4>
                                            <p className='category align-self-end'>
                                                {_object._article_category
                                                    ? _object._article_category
                                                    : 'Project'}
                                            </p>
                                            <ul className='text-muted tags d-flex flex-row align-items-start'>
                                                {_object._article_tags
                                                    ? _.map(_object._article_tags, (_t, _i) => {
                                                        return (
                                                            <li
                                                                className={`border rounded-0 d-flex align-items-center`}
                                                                key={`${_t}${_i}`}
                                                            >
                                                                <FontAwesomeIcon icon={faHashtag} />
                                                                <p>{_.upperFirst(_t)}.</p>
                                                            </li>
                                                        );
                                                    })
                                                    : _.map(_object._project_tags, (_t, _i) => {
                                                        return (
                                                            <li
                                                                className={`border rounded-0 d-flex align-items-center`}
                                                                key={`${_t}${_i}`}
                                                            >
                                                                <FontAwesomeIcon icon={faHashtag} />
                                                                <p>{_.upperFirst(_t)}.</p>
                                                            </li>
                                                        );
                                                    })}
                                            </ul>
                                            <Button
                                                type='button'
                                                className='border border-0 rounded-0 inverse align-self-end'
                                                variant='outline-light'
                                                href={
                                                    _object._project_link
                                                        ? _object._project_link
                                                        : `/blog/${_object._id}`
                                                }
                                                data-am-linearrow='tooltip tooltip-bottom'
                                                display-name={
                                                    _object._project_link ? 'Visit' : 'Read More'
                                                }
                                            >
                                                <div className='line line-1'></div>
                                                <div className='line line-2'></div>
                                            </Button>
                                            <div className='_footerInformation d-flex'>
                                                {!_.isEmpty(_object._article_title) && (
                                                    <>
                                                        <p className='d-flex align-items-center text-muted _views'>
                                                            <b>{_.size(_object._article_views)}</b>
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </p>
                                                    </>
                                                )}
                                                {!_.isEmpty(_object._article_title) && (
                                                    <>
                                                        <p className='d-flex align-items-center text-muted _comments'>
                                                            <b>{_.size(_object._article_comments)}</b>
                                                            <FontAwesomeIcon icon={faCommentAlt} />
                                                        </p>
                                                    </>
                                                )}
                                                {!_.isEmpty(_object._article_title) && (
                                                    <>
                                                        <p className='d-flex align-items-center text-muted _upvotes'>
                                                            <b>{_.size(_object._article_upvotes)}</b>
                                                            <FontAwesomeIcon icon={faThumbsUp} />
                                                        </p>
                                                    </>
                                                )}
                                                {!_.isEmpty(_object._article_title) && (
                                                    <>
                                                        <p className='d-flex align-items-center text-muted _downvotes'>
                                                            <b>{_.size(_object._article_downvotes)}</b>
                                                            <FontAwesomeIcon icon={faThumbsDown} />
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                );
                            }
                        )}
                    </div>
                    <ul className='_pageNumbers d-flex justify-content-center m-auto w-80'>
                        {_.map(
                            _.keys([
                                ...Array(
                                    _.ceil(
                                        _.size(_articlesToShow(_articles, _projects)) /
                                        _cardsPerPage
                                    )
                                ),
                            ]),
                            (_number) => {
                                _number++;
                                return (
                                    <li
                                        key={_number}
                                        onClick={() => _handleClickPage(_number)}
                                        className={`border-0 ${_.isEqual(_.toNumber(_currentPage), _.toNumber(_number))
                                            ? 'current'
                                            : ''
                                            }`}
                                    ></li>
                                );
                            }
                        )}
                    </ul>
                    <div className='_suggestions m-auto'>
                        <div className='togglebtn'>
                            <span role='img' aria-label='sheep'>
                                👉
                            </span>{' '}
                            May we suggest?
                        </div>
                        <ul className='text-muted tags d-flex flex-row align-items-start'>
                            {_.map(
                                _.union(
                                    _articleTags,
                                    _projectTags,
                                    _articleItems,
                                    _projectItems
                                ),
                                (data, index) => {
                                    return (
                                        <li
                                            key={`${index}`}
                                            className={`tag_item border rounded-0 d-flex align-items-center`}
                                            onClick={() => {
                                                /* calling setValue from react-hook-form only updates the value of the specified field, it does not trigger any event handlers associated with that field in useCombobox */
                                                setValue('_searchInput', data.value);
                                                _handleChange(data.value);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faHashtag} />
                                            <p>{_.upperFirst(data.value)}.</p>
                                        </li>
                                    );
                                }
                            )}
                        </ul>
                    </div>
                </Modal.Body>
                <Modal.Footer className='d-flex justify-content-start align-items-center'>
                    <div>
                        Showing &nbsp;
                        <strong>{_currentPage * _cardsPerPage - _cardsPerPage + 1}</strong>
                        &nbsp; to &nbsp;
                        <strong>
                            {_currentPage * _cardsPerPage -
                                _cardsPerPage +
                                _.toNumber(
                                    _.size(
                                        _.slice(
                                            _articlesToShow(_articles, _projects),
                                            _currentPage * _cardsPerPage - _cardsPerPage,
                                            _currentPage * _cardsPerPage
                                        )
                                    )
                                )}
                        </strong>
                        &nbsp; of &nbsp;
                        <strong>
                            {_.toNumber(_.size(_articlesToShow(_articles, _projects)))}
                        </strong>
                        &nbsp; articles.
                    </div>
                </Modal.Footer>
            </Modal>
        </header>
    );
};

export default Header;
