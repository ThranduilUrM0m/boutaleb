// React
import React, { useCallback, useEffect, useState } from 'react';

// Third-Party State Management
import _useStore from '../../store';

// Form Handling & Validation
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// React Router
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

// HTTP Client
import axios from 'axios';

// Downshift for Combobox
import { useCombobox } from 'downshift';

// Bootstrap Components
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';

// Custom Components
import PBlog from './_pane/PBlog';
import PClients from './_pane/PClients';
import PDashboard from './_pane/PDashboard';
import PNotifications from './_pane/PNotifications';
import PProducts from './_pane/PProducts';
import PSettings from './_pane/PSettings';
import PTeams from './_pane/PTeams';
import PTestimonies from './_pane/PTestimonies';
import PWallet from './_pane/PWallet';

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBarsProgress,
    faCaretRight,
    faCircleNotch,
    faCube,
    faGear,
    faHandsClapping,
    faMagnifyingGlass,
    faRightFromBracket,
    faUserGroup,
    faWallet,
} from '@fortawesome/free-solid-svg-icons';
import {
    faBell,
    faMessage,
    faNewspaper,
} from '@fortawesome/free-regular-svg-icons';

// Assets
import logo from '../../assets/_images/b..svg';

// Utility Libraries
import _ from 'lodash';

// Virtual Scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const Dashboard = (props) => {
    const { user, article, project } = _useStore();

    // Access your states and actions like this:
    const _user = user._user;
    const _articles = article._articles;
    const _projects = project._projects;

    const setUserIsAuthenticated = user['_userIsAuthenticated_SET_STATE'];
    const setUser = user['_user_SET_STATE'];

    const setArticles = article['_articles_SET_STATE'];

    const setProjects = project['_projects_SET_STATE'];

    let location = useLocation();
    let navigate = useNavigate();

    const [_searchFocused, setSearchFocused] = useState(false);

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
                                    username: _article._article_author.username,
                                    firstname: _article._article_author.firstname,
                                    lastname: _article._article_author.lastname,
                                    email: _article._article_author.email,
                                    teamTitle: _article._article_author.Team?._team_title,
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

    const _getArticles = useCallback(async () => {
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
    }, [setArticles]);

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

    const _validationSchemaSearch = Yup.object().shape({
        _searchInput: Yup.string().default(''),
    });
    const {
        watch: watchSearch,
        setFocus: setFocusSearch,
        setValue: setValueSearch,
        control: controlSearch,
    } = useForm({
        mode: 'onTouched',
        reValidateMode: 'onChange',
        resolver: yupResolver(_validationSchemaSearch),
        defaultValues: {
            _searchInput: '',
        },
    });

    /* Dropdown State Variables */
    const [_showDropdown, setShowDropdown] = useState(false);

    /* Modal State Variables */
    const [_showModal, setShowModal] = useState(false);
    const [_modalHeader, setModalHeader] = useState('');
    const [_modalBody, setModalBody] = useState('');
    const [_modalIcon, setModalIcon] = useState('');

    /* Downshift _searchInput */
    const [_typedCharactersSearch, setTypedCharactersSearch] = useState('');
    const [_searchSuggestion, setSearchSuggestion] = useState('');
    const [__searchItems, setSearchItems] = useState(
        _.orderBy(
            _.uniqBy(_.union(_articleItems, _projectItems), 'value'),
            ['value'],
            ['asc']
        )
    );
    const _handleSelectSearch = (__selectedItem) => {
        if (__selectedItem) {
            /* calling setValue from react-hook-form only updates the value of the specified field, it does not trigger any event handlers associated with that field in useCombobox */
            setValueSearch('_searchInput', __selectedItem.value);
            _handleChangeSearch(__selectedItem.value);
        }
    };
    const _handleChangeSearch = (__inputValue) => {
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
        setSearchItems(firstSuggestions);
    };
    const _handleBlurSearch = () => {
        setSearchFocused(!_.isEmpty(watchSearch('_searchInput')) ? true : false);
    };
    const _handleFocusSearch = () => {
        setSearchFocused(true);
    };
    const {
        getLabelProps: getLabelPropsSearch,
        getInputProps: getInputPropsSearch,
        getItemProps: getItemPropsSearch,
        getMenuProps: getMenuPropsSearch,
        highlightedIndex: highlightedIndexSearch,
        selectedItem: selectedItemSearch,
        isOpen: isOpenSearch,
    } = useCombobox({
        items: __searchItems,
        onInputValueChange({ inputValue }) {
            _handleChangeSearch(inputValue);
        },
        onSelectedItemChange: ({ selectedItem: __selectedItem }) =>
            _handleSelectSearch(__selectedItem),
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
    /* Downshift _searchInput */

    const _handleLogout = async () => {
        return axios
            .post(`/api/user/_logout/${_user._id}`, _user)
            .then((response) => {
                localStorage.setItem('jwtToken', '');

                setUser({});
                setUserIsAuthenticated(false);
                navigate('/login', {
                    replace: true,
                    state: { from: location },
                });
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const [timeoutId, setTimeoutId] = useState(null);
    const handleMouseEnter = () => {
        clearTimeout(timeoutId);
        setShowDropdown(true);
    };

    const handleMouseLeave = () => {
        const id = setTimeout(() => setShowDropdown(false), 500); // 500ms delay
        setTimeoutId(id);
    };

    const checkAuthentication = useCallback(async () => {
        try {
            // Check if the token is valid by calling the new endpoint
            return await axios
                .get('/api/user/_checkToken', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                })
                .then((response) => {
                    return response.data._user;
                })
                .catch((error) => {
                    return false;
                });
        } catch (error) {
            return false;
        }
    }, []);

    useEffect(() => {
        _getArticles();
        _getProjects();

        const checkUserAuthentication = async () => {
            const isAuthenticated = await checkAuthentication();
            if (!isAuthenticated) {
                localStorage.removeItem('jwtToken');

                setUser({});
                setUserIsAuthenticated(false);
                navigate('/login', {
                    replace: true,
                    state: { from: location },
                });
            }
        };
        checkUserAuthentication();
    }, [
        _user,
        _getArticles,
        _getProjects,
        checkAuthentication,
        location,
        navigate,
        setUserIsAuthenticated,
        setUser,
    ]);

    return (
        <main className='_dashboard'>
            <section className='_s1 grid'>
                <Tab.Container defaultActiveKey='_blog'>
                    <div className='g-col-2'>
                        <Nav variant='pills' className='flex-column'>
                            <Nav.Item>
                                <NavLink
                                    to='/'
                                    className='logo d-flex align-items-center justify-content-center'
                                >
                                    <img className='img-fluid' src={logo} alt='#' />
                                </NavLink>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    className='d-flex align-items-start'
                                    eventKey='_dashboard'
                                >
                                    <FontAwesomeIcon icon={faCube} />
                                    <p>
                                        Dashboard<b className='pink_dot'>.</b>
                                    </p>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    className='d-flex align-items-start'
                                    eventKey='_wallet'
                                >
                                    <FontAwesomeIcon icon={faWallet} />
                                    <p>
                                        Wallet<b className='pink_dot'>.</b>
                                    </p>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    className='d-flex align-items-start'
                                    eventKey='_products'
                                >
                                    <FontAwesomeIcon icon={faBarsProgress} />
                                    <p>
                                        Products<b className='pink_dot'>.</b>
                                    </p>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    className='d-flex align-items-start'
                                    eventKey='_clients'
                                >
                                    <FontAwesomeIcon icon={faCircleNotch} />
                                    <p>
                                        Clients<b className='pink_dot'>.</b>
                                    </p>
                                </Nav.Link>
                            </Nav.Item>

                            <Nav.Item>
                                <Nav.Link
                                    className='d-flex align-items-start'
                                    eventKey='_testimonies'
                                >
                                    <FontAwesomeIcon icon={faMessage} />
                                    <p>
                                        Testimonies<b className='pink_dot'>.</b>
                                    </p>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link className='d-flex align-items-start' eventKey='_blog'>
                                    <FontAwesomeIcon icon={faNewspaper} />
                                    <p>
                                        Blog<b className='pink_dot'>.</b>
                                    </p>
                                </Nav.Link>
                            </Nav.Item>

                            <Nav.Item className='mt-auto'>
                                <Dropdown
                                    show={_showDropdown}
                                    drop={'end'}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <Dropdown.Toggle
                                        className='d-flex justify-content-center'
                                        as='span'
                                    >
                                        <div className='d-flex _name'>
                                            <span className='d-flex align-items-center justify-content-center'>
                                                <img
                                                    src={
                                                        _.isEmpty(_user._user_picture)
                                                            ? logo
                                                            : _user._user_picture
                                                    }
                                                    alt=''
                                                />
                                            </span>
                                            <span className='d-flex flex-column justify-content-center me-auto'>
                                                <p>{_.capitalize(_user._user_email)}</p>
                                                <p>{'boutaleb.dev/' + _user._user_username}</p>
                                            </span>
                                            <span className='align-self-center'>
                                                <FontAwesomeIcon icon={faCaretRight} />
                                            </span>
                                        </div>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className='border rounded-0'>
                                        <Dropdown.Item as='span'>
                                            <Nav.Link className='_name d-flex' as='span'>
                                                <span className='d-flex align-items-center justify-content-center'>
                                                    <img
                                                        src={
                                                            _.isEmpty(_user._user_picture)
                                                                ? logo
                                                                : _user._user_picture
                                                        }
                                                        alt=''
                                                    />
                                                </span>
                                                <span className='d-flex flex-column justify-content-center'>
                                                    <p>
                                                        {_.isEmpty(_user._user_lastname) &&
                                                            _.isEmpty(_user._user_firstname)
                                                            ? 'John Doe'
                                                            : !_.isEmpty(_user._user_lastname)
                                                                ? _user._user_lastname +
                                                                ' ' +
                                                                _user._user_firstname
                                                                : _user._user_firstname}
                                                    </p>
                                                    <p>
                                                        {_.join(
                                                            _.map(_user.Permission, (__p) =>
                                                                _.capitalize(__p._permission_titre)
                                                            ),
                                                            ', '
                                                        )}
                                                    </p>
                                                    <p>
                                                        {!_.isEmpty(_user._user_city)
                                                            ? _user._user_city +
                                                            ', ' +
                                                            _user._user_country._country
                                                            : _user._user_country._country}
                                                    </p>
                                                </span>
                                            </Nav.Link>
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item as='span'>
                                            <Nav.Link
                                                className='d-flex align-items-start'
                                                eventKey='_teams'
                                            >
                                                <FontAwesomeIcon icon={faUserGroup} />
                                                <p>
                                                    Teams
                                                    <b className='pink_dot'>.</b>
                                                </p>
                                            </Nav.Link>
                                        </Dropdown.Item>
                                        <Dropdown.Item as='span'>
                                            <Nav.Link
                                                className='d-flex align-items-start'
                                                eventKey='_settings'
                                            >
                                                <FontAwesomeIcon icon={faGear} />
                                                <p>
                                                    Settings
                                                    <b className='pink_dot'>.</b>
                                                </p>
                                            </Nav.Link>
                                        </Dropdown.Item>
                                        <Dropdown.Item as='span' onClick={() => _handleLogout()}>
                                            <Nav.Link className='d-flex align-items-start'>
                                                <FontAwesomeIcon icon={faRightFromBracket} />
                                                <p>
                                                    Logout
                                                    <b className='pink_dot'>.</b>
                                                </p>
                                            </Nav.Link>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav.Item>
                        </Nav>
                    </div>
                    <div className='g-col-10 d-flex flex-column'>
                        <Nav className='align-items-center'>
                            <Nav.Item className='_welcome d-flex'>
                                <span className='d-flex flex-column align-items-start justify-content-center'>
                                    <p>
                                        Hello,{' '}
                                        {_.isEmpty(_user._user_lastname) &&
                                            _.isEmpty(_user._user_firstname)
                                            ? _.capitalize(_user._user_username)
                                            : !_.isEmpty(_user._user_lastname)
                                                ? _user._user_lastname + ' ' + _user._user_firstname
                                                : _user._user_firstname}
                                    </p>
                                    <p>Let's check your story today.</p>
                                </span>
                                <FontAwesomeIcon icon={faHandsClapping} />
                            </Nav.Item>
                            <Nav.Item className='_search ms-auto'>
                                <Form onClick={() => setFocusSearch('_searchInput')}>
                                    <Controller
                                        name='_searchInput'
                                        control={controlSearch}
                                        render={({ field }) => (
                                            <Form.Group
                                                controlId='_searchInput'
                                                className={`_formGroup _searchGroup ${_searchFocused ? 'focused' : ''
                                                    }`}
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
                                                            onBlur: _handleBlurSearch,
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
                                                {!_.isEmpty(watchSearch('_searchInput')) ||
                                                    !_.isEmpty(_typedCharactersSearch) ? (
                                                    <div
                                                        className='_searchButton __close'
                                                        onClick={() => {
                                                            /* calling setValueSettings from react-hook-form only updates the value of the specified field, it does not trigger any event handlers associated with that field in useCombobox */
                                                            setValueSearch('_searchInput', '');
                                                            _handleChangeSearch('');
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
                                                        className={`border border-0 rounded-0 d-block ${!(isOpenSearch && __searchItems.length) &&
                                                            'hidden'
                                                            }`}
                                                        {...getMenuPropsSearch()}
                                                    >
                                                        {isOpenSearch &&
                                                            _.map(__searchItems, (item, index) => {
                                                                return (
                                                                    <ListGroup.Item
                                                                        className={`border border-0 rounded-0 d-flex align-items-center ${highlightedIndexSearch === index &&
                                                                            'bg-blue-300'
                                                                            } ${selectedItemSearch === item && 'font-bold'
                                                                            }`}
                                                                        key={`${item.value}${index}`}
                                                                        {...getItemPropsSearch({
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
                            <Nav.Item className='_notifications'>
                                <Nav.Link
                                    className='d-flex align-items-center justify-content-center'
                                    eventKey='_notifications'
                                >
                                    <FontAwesomeIcon icon={faBell} />
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey='_dashboard'>
                                <PDashboard />
                            </Tab.Pane>
                            <Tab.Pane eventKey='_wallet'>
                                <PWallet />
                            </Tab.Pane>
                            <Tab.Pane eventKey='_products'>
                                <PProducts />
                            </Tab.Pane>
                            <Tab.Pane eventKey='_clients'>
                                <PClients />
                            </Tab.Pane>
                            <Tab.Pane eventKey='_testimonies'>
                                <PTestimonies />
                            </Tab.Pane>
                            <Tab.Pane eventKey='_blog'>
                                <PBlog />
                            </Tab.Pane>
                            <Tab.Pane eventKey='_teams'>
                                <PTeams />
                            </Tab.Pane>
                            <Tab.Pane eventKey='_settings'>
                                <PSettings />
                            </Tab.Pane>
                            <Tab.Pane eventKey='_notifications'>
                                <PNotifications />
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </Tab.Container>
            </section>

            <Modal show={_showModal} onHide={() => setShowModal(false)} centered>
                <Form>
                    <Modal.Header closeButton>
                        <Modal.Title>{_modalHeader}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='text-muted'>
                        <pre>{_modalBody}</pre>
                    </Modal.Body>
                    <Modal.Footer>
                        {_modalIcon}
                        <Button
                            type='button'
                            className='border border-0 rounded-0 inverse w-50'
                            variant='outline-light'
                            onClick={() => setShowModal(false)}
                        >
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
                    </Modal.Footer>
                </Form>
            </Modal>
        </main>
    );
};

export default Dashboard;
