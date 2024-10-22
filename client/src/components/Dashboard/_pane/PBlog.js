import React, { useCallback, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import _useStore from '../../../store';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useCombobox, useMultipleSelection } from 'downshift';
import _ from 'lodash';
import axios from 'axios';
import Moment from 'react-moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faPen,
	faMagnifyingGlass,
	faAlignCenter,
	faAlignLeft,
	faAlignRight,
	faBold,
	faChevronDown,
	faChevronUp,
	faCode,
	faHighlighter,
	faItalic,
	faListOl,
	faListUl,
	faQuoteRight,
	faStrikethrough,
	faSubscript,
	faSuperscript,
	faTextWidth,
	faUnderline,
	faAlignJustify,
	faIndent,
	faOutdent,
	faLink,
	faUnlink,
	faImage,
	faQuoteLeft,
	faUndo,
	faRedo,
	faLock,
	faEllipsisV,
	faHashtag,
} from '@fortawesome/free-solid-svg-icons';
import {
	faCircleCheck,
	faCircleXmark,
	faCommentAlt,
	faEye,
	faEyeSlash,
	faThumbsDown,
	faThumbsUp,
} from '@fortawesome/free-regular-svg-icons';
import SimpleBar from 'simplebar-react';
import { io } from 'socket.io-client';

import BootstrapTable from 'react-bootstrap-table-next';
import { Type } from 'react-bootstrap-table2-editor';

import 'simplebar-react/dist/simplebar.min.css';
import logo from '../../../assets/_images/b..svg';

import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Import the font and size formats
const Font = Quill.import('formats/font');
const Size = Quill.import('formats/size');
// Add the font families to the whitelist
Font.whitelist = [
	'arial',
	'helvetica',
	'times-new-roman',
	'georgia',
	'verdana',
	'courier-new',
	'cambria',
	'garamond',
	'trebuchet-ms',
];
// Add the sizes to the whitelist
Size.whitelist = [
	'10px',
	'12px',
	'14px',
	'16px',
	'18px',
	'20px',
	'22px',
	'24px',
];
// Register the new formats
Quill.register(Font, true);
Quill.register(Size, true);
const __modules = {
	toolbar: [
		[{ header: [1, 2, 3, 4, 5, 6, false] }],
		[
			{
				font: [
					'arial',
					'helvetica',
					'times-new-roman',
					'georgia',
					'verdana',
					'courier-new',
					'cambria',
					'garamond',
					'trebuchet-ms',
				],
			},
		],
		[
			{
				size: [
					'10px',
					'12px',
					'14px',
					'16px',
					'18px',
					'20px',
					'22px',
					'24px',
				],
			},
		],
		['bold', 'italic', 'underline', 'strike'],
		[{ script: 'sub' }, { script: 'super' }],
		['blockquote', 'code-block'],
		[{ color: [] }, { background: [] }],
		[
			{ list: 'ordered' },
			{ list: 'bullet' },
			{ indent: '-1' },
			{ indent: '+1' },
		],
		[{ align: [] }, { direction: 'rtl' }],
		['link', 'image'],
	],
};

const _socketURL = _.isEqual(process.env.NODE_ENV, 'production')
	? window.location.hostname
	: 'localhost:5000';
const _socket = io(_socketURL, { transports: ['websocket', 'polling'] });

const PBlog = (props) => {
	const _user = _useStore.useUserStore((state) => state._user);

	const addArticle = _useStore.useArticleStore(
		(state) => state['_article_ADD_STATE']
	);
	const deleteArticle = _useStore.useArticleStore(
		(state) => state['_article_DELETE_STATE']
	);

	const _articleToEdit = _useStore.useArticleStore(
		(state) => state._articleToEdit
	);
	const setArticleToEdit = _useStore.useArticleStore(
		(state) => state['_articleToEdit_SET_STATE']
	);
	const clearArticleToEdit = _useStore.useArticleStore(
		(state) => state['_articleToEdit_CLEAR_STATE']
	);

	const _articles = _useStore.useArticleStore((state) => state._articles);
	const setArticles = _useStore.useArticleStore(
		(state) => state['_articles_SET_STATE']
	);
	const updateArticles = _useStore.useArticleStore(
		(state) => state['_articles_UPDATE_STATE_ITEM']
	);

	const [_showModal, setShowModal] = useState(false);

	const _validationSchema = Yup.object()
		.shape({
			_article_title: Yup.string()
				.default('')
				.required('Please provide a title.'),
			_article_body: Yup.string()
				.default('')
				.required('Please provide some content.'),
			_article_author: Yup.string().default(null),
			_article_category: Yup.string().default(''),
			_article_isPrivate: Yup.boolean().default(false),
			_article_tags: Yup.array().default([]),
			_article_comments: Yup.array().default([]),
		})
		.required();
	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		getValues,
		resetField,
		trigger,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm({
		mode: 'onChange',
		reValidateMode: 'onSubmit',
		resolver: yupResolver(_validationSchema),
		defaultValues: {
			_article_title: '',
			_article_body: '',
			_article_author: null,
			_article_category: '',
			_article_isPrivate: false,
			_article_tags: [],
			_article_comments: [],
		},
	});

	/* Bootstrap Table For Articles */
	const [_selectedArticles, setSelectedArticles] = useState([]);

	const _columns = [
		{
			dataField: '_article_title',
			text: 'Title',
			sort: true,
			formatter: (cell, row) => {
				return (
					<Button variant='link' href={`/blog/${row._id}`}>
						{cell}
					</Button>
				);
			},
		},
		{
			dataField: '_article_author',
			text: 'Author',
			sort: true,
			formatter: (cell) => {
				return (
					<div className='d-flex _name'>
						<span className='d-flex align-items-center justify-content-center'>
							<img
								src={
									_.isEmpty(cell._user_picture)
										? logo
										: cell._user_picture
								}
								alt=''
							/>
						</span>
						<span className='d-flex flex-column justify-content-center me-auto'>
							<p>
								{_.isEmpty(cell._user_lastname) &&
									_.isEmpty(cell._user_firstname)
									? cell._user_username
									: !_.isEmpty(cell._user_lastname)
										? cell._user_lastname +
										' ' +
										_.head(cell._user_firstname) +
										'.'
										: cell._user_firstname}
							</p>
							<p>{_.capitalize(cell._user_email)}</p>
						</span>
					</div>
				);
			},
		},
		{
			dataField: '_article_category',
			text: 'Category',
			sort: true,
			formatter: (cell, row) => {
				return <p className='category'>{cell}</p>;
			},
		},
		{
			dataField: 'createdAt',
			text: 'Created At',
			sort: true,
			formatter: (cell, row) => {
				return <Moment format='MMM Do, YYYY'>{cell}</Moment>;
			},
		},
		{
			dataField: '_article_isPrivate',
			text: 'Status',
			sort: true,
			editor: {
				type: Type.CHECKBOX,
				value: 'True:False',
			},
			formatter: (cell) => {
				return cell ? (
					<Badge bg='success'>
						<FontAwesomeIcon icon={faCircleCheck} />
						Public.
					</Badge>
				) : (
					<Badge bg='danger'>
						<FontAwesomeIcon icon={faCircleXmark} />
						Private.
					</Badge>
				);
			},
		},
		{
			dataField: '_article_tags',
			text: 'Tags',
			sort: false,
			style: {
				flex: '1',
			},
			formatter: (cell) => {
				return (
					<ul className='text-muted tags d-flex flex-row align-items-start'>
						{
							_.map(cell, (_tag) => (
								<li
									key={`${_tag}`}
									className={`tag_item border rounded-0 d-flex align-items-center`}
								>
									<FontAwesomeIcon
										icon={
											faHashtag
										}
									/>
									<p>
										{_.upperFirst(
											_tag
										)}
										.
									</p>
								</li>
							))
						}
					</ul>
				);
			},
		},
		{
			dataField: '_article_comments',
			text: 'Comments',
			sort: true,
			headerAlign: 'center',
			align: 'center',
			headerFormatter: (column, colIndex) => {
				return <FontAwesomeIcon icon={faCommentAlt} />;
			},
			formatter: (cell, row) => {
				return _.size(cell.value);
			},
			type: 'number',
			editable: false,
		},
		{
			dataField: '_article_views',
			text: 'Views',
			sort: true,
			headerAlign: 'center',
			align: 'center',
			headerFormatter: (column, colIndex) => {
				return <FontAwesomeIcon icon={faEye} />;
			},
			formatter: (cell, row) => {
				return _.size(cell.value);
			},
			type: 'number',
			editable: false,
		},
		{
			dataField: '_article_upvotes',
			text: 'Upvotes',
			sort: true,
			headerAlign: 'center',
			align: 'center',
			headerFormatter: (column, colIndex) => {
				return <FontAwesomeIcon icon={faThumbsUp} />;
			},
			formatter: (cell, row) => {
				return _.size(cell.value);
			},
			type: 'number',
			editable: false,
		},
		{
			dataField: '_article_downvotes',
			text: 'Downvotes',
			sort: true,
			headerAlign: 'center',
			align: 'center',
			headerFormatter: (column, colIndex) => {
				return <FontAwesomeIcon icon={faThumbsDown} />;
			},
			formatter: (cell, row) => {
				return _.size(cell.value);
			},
			type: 'number',
			editable: false,
		},
		{
			dataField: '_edit',
			text: '',
			isDummyField: true,
			formatter: () => {
				return (
					<Button
						type='button'
						className='border border-0 rounded-0 _edit'
						onClick={() => setShowModal(true)}
					>
						<FontAwesomeIcon icon={faPen} />
					</Button>
				);
			},
		},
	];

	const _selectRow = {
		mode: 'checkbox',
		clickToSelect: false,
		onSelect: (row, isSelect, rowIndex, e) => {
			isSelect
				? setSelectedArticles([..._selectedArticles, row])
				: setSelectedArticles(
					_.filter(_selectedArticles, (_a) => {
						return _a._id !== row._id;
					})
				);

			return true;
		},
		onSelectAll: (isSelect, rows, e) => {
			isSelect ? setSelectedArticles(rows) : setSelectedArticles([]);
		},
		selectionRenderer: ({ mode, checked, disabled }) => (
			<Form.Group className='_formGroup _checkGroup'>
				<FloatingLabel label='' className='_formLabel __checkBox'>
					<Form.Check
						type={mode}
						className='_formCheckbox d-flex'
						checked={checked}
						/*
							Since react-bootstrap-table-next manages selection and
							I provide the checked state through the selectionRenderer
							and selectionHeaderRenderer functions, we need to ensure
							the checkboxes are correctly set up without additional
							state management in the render functions.

							To fix the warning, ensure that the onChange handler
							is included, even if it just acts as a placeholder because
							the actual state management is handled elsewhere.
						*/
						onChange={() => { }}
					/>
				</FloatingLabel>
			</Form.Group>
		),
		selectionHeaderRenderer: ({ mode, checked, indeterminate }) => (
			<Form.Group className='_formGroup _checkGroup'>
				<FloatingLabel label='' className='_formLabel __checkBox'>
					<Form.Check
						type={mode}
						className='_formCheckbox d-flex'
						checked={checked}
						/*
							Since react-bootstrap-table-next manages selection and
							I provide the checked state through the selectionRenderer
							and selectionHeaderRenderer functions, we need to ensure
							the checkboxes are correctly set up without additional
							state management in the render functions.

							To fix the warning, ensure that the onChange handler
							is included, even if it just acts as a placeholder because
							the actual state management is handled elsewhere.
						*/
						onChange={() => { }}
						ref={(input) => {
							if (input) input.indeterminate = indeterminate;
						}}
					/>
				</FloatingLabel>
			</Form.Group>
		),
	};
	/* Bootstrap Table For Articles */

	const [_articleTitleFocused, setArticleTitleFocused] = useState(false);
	const [_articleBodyFocused, setArticleBodyFocused] = useState(false);


	/* Temporary Value for the React Quill */
	const [__reactQuill, setReactQuill] = useState('');
	/* Temporary Value for the React Quill */


	/*** Category ***/
	/** Variables **/
	/* FormControl Focus variable */
	const [_articleCategoryFocused, setArticleCategoryFocused] = useState(false);
	/* Dropdown show variable */
	const [_showCategoryDropdown, setShowCategoryDropdown] = useState(false);
	/* Categories state variable */
	const [__categories, setCategories] = useState([]);
	/* 4 Top Categories state variable */
	const [__4topCategories, set4topCategories] = useState([]);

	/* Handling the onChange of the Form.Check */
	const handleSwitchCategoryChange = (__category) => {
		if (watch('_article_category') === __category) {
			resetField(
				'_article_category'
			);
			_handleChangeCategory(
				''
			);
			set4topCategories((__prevCat) => {
				return [..._.orderBy(__prevCat, ['frequency'], ['desc'])];
			});
		} else {
			setValue('_article_category', __category);
			_handleChangeCategory(
				__category
			);
			set4topCategories((__prevCat) => {
				const __existsingIndex = _.findIndex(__prevCat, {
					name: __category,
				});
				return [
					{
						...__prevCat[__existsingIndex],
						frequency: __prevCat[__existsingIndex].frequency,
					},
					..._.filter(
						__prevCat,
						(category, index) => index !== __existsingIndex
					),
				];
			});
		}
	};
	/* Handling the onChange of the Form.Check */


	/* Downshift _article_category */
	const [_typedCharactersCategory, setTypedCharactersCategory] = useState('');
	const [_categorySuggestion, setCategorySuggestion] = useState('');
	const [__categoryItems, setItemsCategory] = useState([]);
	const _handleSelectCategory = (__selectedItem) => {
		if (__selectedItem) {
			/*
			Calling setValue from react-hook-form only updates the value of the specified field,
			it does not trigger any event handlers associated with that field in useCombobox
			*/
			set4topCategories((__prevCat) => {
				const __existsingIndex = _.findIndex(__prevCat, {
					name: __selectedItem.value,
				});
				if (__existsingIndex !== -1) {
					// If __selectedItem.value exists in __4topCategories, move it to the top
					return [
						{
							...__prevCat[__existsingIndex],
							frequency: __prevCat[__existsingIndex].frequency,
						},
						..._.filter(
							__prevCat,
							(category, index) => index !== __existsingIndex
						),
					];
				} else {
					// If __selectedItem.value does not exist, remove the last item if reached 4 entries and add __selectedItem.value to the top
					const __newCat = [
						{ name: __selectedItem.value, frequency: 1 },
						...__prevCat,
					];
					return __newCat.length > 4
						? _.slice(__newCat, 0, 4)
						: __newCat;
				}
			});
			setCategories((__prevCat) => {
				return [
					{ value: __selectedItem.value },
					..._.filter(__prevCat, (item) => {
						return item.value !== __selectedItem.value;
					}),
				];
			});
			setValue('_article_category', __selectedItem.value);
			setCategorySuggestion('');
			setTypedCharactersCategory(__selectedItem.value);
		}
	};
	const _handleChangeCategory = (__inputValue) => {
		/* If it includes it, it could mean that the suggestion is 'world' and the typped value is only 'orl' */
		let firstSuggestions = _.orderBy(
			_.uniqBy(
				_.filter(
					__categories,
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

		/* The degree of similarity between the suggestion and input */
		let __similarity =
			_.intersection(
				_.split(
					_.toLower(
						!_.isEmpty(__inputValue) && firstSuggestions[0]
							? firstSuggestions[0].value
							: ''
					),
					''
				),
				_.split(_.toLower(_.trim(__inputValue)), '')
			).length /
			_.max([
				_.size(
					!_.isEmpty(__inputValue) && firstSuggestions[0]
						? firstSuggestions[0].value
						: ''
				),
				_.size(_.toLower(_.trim(__inputValue))),
			]);

		if (!__similarity && !_.isEmpty(__inputValue)) {
			axios(
				`https://api.dictionaryapi.dev/api/v2/entries/en/${_.toLower(
					_.trim(__inputValue)
				)}`
			)
				.then((response) => {
					if (response.status === 200) {
						setItemsCategory([
							...firstSuggestions,
							{ value: _.toLower(__inputValue) },
						]);
						clearErrors('_article_category');
					}
				})
				.catch((error) => {
					setError('_article_category', {
						type: 'manual',
						message: 'NV.',
					});
				});
		} else {
			setItemsCategory(firstSuggestions);
			clearErrors('_article_category');
		}

		setCategorySuggestion(
			!_.isEmpty(__inputValue) && firstSuggestions[0]
				? firstSuggestions[0].value
				: ''
		);
		setTypedCharactersCategory(__inputValue);
	};
	const _handleBlurCategory = async () => {
		setArticleCategoryFocused(
			!_.isEmpty(watch('_article_category')) ? true : false
		);
	};
	const _handleFocusCategory = () => {
		setArticleCategoryFocused(true);
	};
	const {
		getLabelProps: getLabelPropsCategory,
		getInputProps: getInputPropsCategory,
		getItemProps: getItemPropsCategory,
		getMenuProps: getMenuPropsCategory,
		highlightedIndex: highlightedIndexCategory,
		selectedItem: selectedItemCategory,
		isOpen: isOpenCategory,
	} = useCombobox({
		items: __categoryItems,
		onInputValueChange({ inputValue }) {
			_handleChangeCategory(inputValue);
		},
		onSelectedItemChange: ({ selectedItem: __selectedItem }) =>
			_handleSelectCategory(__selectedItem),
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
	getInputPropsCategory({}, { suppressRefError: true });
	getMenuPropsCategory({}, { suppressRefError: true });
	/* Downshift _article_category */
	/*** Category ***/


	/*** Tags ***/
	/** Variables **/
	/* FormControl Focus variable */
	const [_articleTagsFocused, setArticleTagsFocused] = useState(false);
	/* FormControl Temporary Error variable */
	const [_articleTagsError, setArticleTagsError] = useState('');
	/* Tags state variable */
	const [__tags, setTags] = useState([]);


	/* Downshift _article_tags */
	const [_typedCharactersTag, setTypedCharactersTag] = useState('');
	const [_tagSuggestion, setTagSuggestion] = useState('');
	const [__tagItems, setItemsTag] = useState([]);

	const {
		selectedItems: selectedItemsTags,
		addSelectedItem: addSelectedItemTag,
		removeSelectedItem: removeSelectedItemTag,
		getDropdownProps: getDropdownPropsTag,
		getSelectedItemProps
	} = useMultipleSelection({
		initialSelectedItems: _.map(watch('_article_tags'), value => ({ value })),
		onStateChange: ({ selectedItems }) => {
			setValue('_article_tags', _.map(selectedItems, (item) => item.value));
		},
	});

	const _handleSelectTag = (__selectedItem) => {
		if (selectedItemsTags.length >= 10) {
			setArticleTagsError('Limit reached, maximum of 10 tags allowed');
			return; // Block further selection if the limit is reached
		}

		if (__selectedItem && !_.some(selectedItemsTags, { value: __selectedItem.value })) {
			addSelectedItemTag(__selectedItem);
			setArticleTagsError('');
		} else {
			setArticleTagsError('This tag has already been selected');
		}
	};
	const _handleRemoveTag = (__index) => {
		const __selectedItem = selectedItemsTags[__index];
		if (__selectedItem) {
			removeSelectedItemTag(__selectedItem);
			setItemsTag((__prev) => [
				...__prev,
				{ value: _.toLower(__selectedItem) }
			]);
		}
		setArticleTagsError('');
	};
	const _handleChangeTag = (__inputValue) => {
		console.log('MOK');
		/* If it includes it, it could mean that the suggestion is 'world' and the typped value is only 'orl' */
		let firstSuggestions = _.orderBy(
			_.uniqBy(
				_.filter(
					__tags,
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

		/* The degree of similarity between the suggestion and input */
		let __similarity =
			_.intersection(
				_.split(
					_.toLower(
						!_.isEmpty(__inputValue) && firstSuggestions[0]
							? firstSuggestions[0].value
							: ''
					),
					''
				),
				_.split(_.toLower(_.trim(__inputValue)), '')
			).length /
			_.max([
				_.size(
					!_.isEmpty(__inputValue) && firstSuggestions[0]
						? firstSuggestions[0].value
						: ''
				),
				_.size(_.toLower(_.trim(__inputValue))),
			]);

		if (!__similarity && !_.isEmpty(__inputValue)) {
			axios(
				`https://api.dictionaryapi.dev/api/v2/entries/en/${_.toLower(
					_.trim(__inputValue)
				)}`
			)
				.then((response) => {
					if (response.status === 200) {
						setItemsTag([
							...firstSuggestions,
							{ value: _.toLower(__inputValue) },
						]);
						setArticleTagsError('');
					}
				})
				.catch((error) => {
					setArticleTagsError(
						'Please enter a valid tag.'
					);
				});
		} else {
			setItemsTag(firstSuggestions);
			setArticleTagsError('');
		}

		setInputValueTag(__inputValue);
		setTagSuggestion(
			!_.isEmpty(__inputValue) && firstSuggestions[0]
				? firstSuggestions[0].value
				: ''
		);
		setTypedCharactersTag(__inputValue);
		/* If the tag is already selected then throw error and block selection for the suggestion */
	};
	const _handleBlurTag = async () => {
		setArticleTagsFocused(!_.isEmpty(watch('_article_tags')));
	};
	const _handleFocusTag = () => {
		setArticleTagsFocused(true);
	};
	/* The isOpen should stay true after selecting, but it does not */
	const {
		inputValue: inputValueTag,
		setInputValue: setInputValueTag,
		getLabelProps: getLabelPropsTag,
		getInputProps: getInputPropsTag,
		getItemProps: getItemPropsTag,
		getMenuProps: getMenuPropsTag,
		highlightedIndex: highlightedIndexTag,
		selectedItem: selectedItemTag,
		isOpen: isOpenTag,
	} = useCombobox({
		items: __tagItems,
		selectedItem: null,
		onInputValueChange({ inputValue, isOpen }) {
			// Only trigger input change logic when it's not due to a selection
			if (!selectedItemTag && isOpen) {
				_handleChangeTag(inputValue);
			}
		},
		onSelectedItemChange: ({ selectedItem: __selectedItem }) => {
			_handleSelectTag(__selectedItem);
		},
		itemToString: (item) => (item ? item.value : ''),
		stateReducer: (state, actionAndChanges) => {
			const { type, changes } = actionAndChanges;
			switch (type) {
				case useCombobox.stateChangeTypes.InputChange:
					return {
						...changes,
						inputValue: state.inputValue,
					};
				case useCombobox.stateChangeTypes.InputClick:
					// Keep the dropdown open on click
					return {
						...changes,
						isOpen: true,
						highlightedIndex: 0,
					};
				case useCombobox.stateChangeTypes.FunctionSelectItem:
					// Prevent dropdown from closing after a tag is selected
					return {
						...changes,
						isOpen: true,
					};
				default:
					return changes;
			}
		}
	});
	getInputPropsTag({}, { suppressRefError: true });
	getMenuPropsTag({}, { suppressRefError: true });
	getDropdownPropsTag({}, { suppressRefError: true });
	/*** Tags ***/


	const _getArticles = useCallback(async () => {
		try {
			axios('/api/article')
				.then((response) => {
					setArticles(response.data._articles);
					setCategories(
						_.orderBy(
							_.uniqBy(
								_.map(
									_.map(
										_.filter(
											response.data._articles,
											(_article) => {
												return !_article._article_isPrivate;
											}
										),
										'_article_category'
									),
									(_category, _index) => {
										return {
											value: _.toLower(
												_category.replace(/\.$/, '')
											),
										};
									}
								),
								'value'
							),
							['value'],
							['asc']
						)
					);
					setTags(
						_.orderBy(
							_.uniqBy(
								_.map(
									_.flatMap(
										_.filter(response.data._articles, (_article) => {
											return !_article._article_isPrivate;
										}),
										'_article_tags'
									),
									(_tag, _index) => {
										return {
											value: _.toLower(_tag.replace(/\.$/, '')),
										};
									}
								),
								'value'
							),
							['value'],
							['asc']
						)
					);
					setItemsCategory(
						_.orderBy(
							_.uniqBy(
								_.map(
									_.map(
										_.filter(
											response.data._articles,
											(_article) => {
												return !_article._article_isPrivate;
											}
										),
										'_article_category'
									),
									(_category, _index) => {
										return {
											value: _.toLower(
												_category.replace(/\.$/, '')
											),
										};
									}
								),
								'value'
							),
							['value'],
							['asc']
						)
					);
					setItemsTag(
						_.orderBy(
							_.uniqBy(
								_.map(
									_.flatMap(
										_.filter(response.data._articles, (_article) => {
											return !_article._article_isPrivate;
										}),
										'_article_tags'
									),
									(_tag, _index) => {
										return {
											value: _.toLower(_tag.replace(/\.$/, '')),
										};
									}
								),
								'value'
							),
							['value'],
							['asc']
						)
					);
					set4topCategories(
						_.slice(
							_.orderBy(
								_.map(
									_.countBy(
										_.map(
											response.data._articles,
											'_article_category'
										)
									),
									(count, categoryName) => ({
										name: _.toLower(categoryName),
										frequency: count,
									})
								),
								['frequency'],
								['desc']
							),
							0,
							4
						)
					);
				})
				.catch((error) => {
					console.log(error);
				});
		} catch (error) {
			console.log(error);
		}
	}, [setArticles, setCategories, setTags, setItemsCategory, setItemsTag, set4topCategories]);

	/* Gotta use this function on clicking on a button that exists outside of the Modal */
	/* const _handleEdit = (_a) => {
		setValue('_article_title', _a._article_title);
		setValue('_article_body', _a._article_body);
		setValue('_article_author', _a._article_author);
		setValue('_article_category', _a._article_category);
		setValue('_article_isPrivate', _a._article_isPrivate);
		setValue('_article_tags', _a._article_tags);
		setValue('_article_comments', _a._article_comments);

		// Set the article to be edited in the _articleToEdit state
		setArticleToEdit(_a);
	}; */

	const _handleDelete = () => {
		return axios
			.delete(`/api/article/`, { data: _selectedArticles })
			.then((res) => {
				console.log(res.data);
				/* deleteArticle(_id);
				_socket.emit('action', { type: '_articlesDeleted', data: res.data._article }); */
			});
	};

	/* Gotta use this function on clicking on a button that exists outside of the Modal */
	/* const _handleCancel = () => {
		// Reset the form fields
		reset({
			_article_title: '',
			_article_body: '',
			_article_author: null,
			_article_category: '',
			_article_isPrivate: false,
			_article_tags: [],
			_article_comments: []
		});

		// Clear the _articleToEdit state
		clearArticleToEdit();
	}; */

	const onSubmit = async (values) => {
		console.log(values);
	};

	const onError = (error) => {
		console.log(error);
	};

	useEffect(() => {
		_getArticles();

		const handleBeforeUnload = () => {
			clearArticleToEdit();
		};
		window.addEventListener('beforeunload', handleBeforeUnload);

		const subscription = watch((value, { name, type }) => { });
		return () => {
			subscription.unsubscribe();
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [_getArticles, watch, clearArticleToEdit, _selectedArticles]);

	return (
		<div className='_pane _blog'>
			<Container className='grid'>
				<Row className='g-col-12 grid'>
					<Col className='g-col-12'>
						<Card className='border rounded-2 no-shadow'>
							<Card.Header>
								<Form className='grid'>
									<Row className='g-col-12 grid'>
										<Col className='g-col-3 d-flex align-items-end'>
											<span>
												Articles.
												<p className='text-muted'>
													Manage your Articles Here.
												</p>
											</span>
										</Col>
										<Col className='g-col-3'></Col>
										<Col className='g-col-3'></Col>
										<Col className='g-col-3 d-flex justify-content-end'>
											{
												//Upon click it just disapears or appears too fast
												!_.isEmpty(
													_selectedArticles
												) && (
													<Button
														type='button'
														className='border border-0 rounded-0 _red'
														variant='link'
														onClick={() =>
															_handleDelete()
														}
													>
														Delete
														<b className='pink_dot'>
															.
														</b>
													</Button>
												)
											}
											<Button
												type='button'
												className='border border-0 rounded-0 inverse w-50'
												variant='outline-light'
												onClick={() =>
													setShowModal(true)
												}
											>
												<div className='buttonBorders'>
													<div className='borderTop'></div>
													<div className='borderRight'></div>
													<div className='borderBottom'></div>
													<div className='borderLeft'></div>
												</div>
												<span>Add Article.</span>
											</Button>
										</Col>
									</Row>
								</Form>
							</Card.Header>
							<Card.Body>
								<SimpleBar
									style={{ maxHeight: '100%' }}
									forceVisible='y'
									autoHide={false}
								>
									<BootstrapTable
										bootstrap4
										keyField='_id'
										data={_articles}
										columns={_columns}
										selectRow={_selectRow}
										hover
										condensed
										bordered={false}
										noDataIndication={() =>
											'No articles found'
										}
									/>
								</SimpleBar>
							</Card.Body>
						</Card>
					</Col>
				</Row>
				<Row className='g-col-12 grid'>
					<Col className='g-col-6'>
						<Card className='border rounded-2 no-shadow'></Card>
					</Col>
					<Col className='g-col-6'>
						<Card className='border rounded-2 no-shadow'></Card>
					</Col>
				</Row>
			</Container>

			<Modal
				className='_articleModal'
				show={_showModal}
				onHide={() => setShowModal(false)}
				centered
			>
				<Form
					onSubmit={handleSubmit(onSubmit, onError)}
					className='d-flex flex-column'
				>
					<Modal.Header closeButton>
						<Modal.Title></Modal.Title>
					</Modal.Header>
					<Modal.Body className='grid'>
						<Row className='g-col-12 grid'>
							<Col className='g-col-12'>
								<Form.Group
									controlId='_article_title'
									className={`_formGroup _titleGroup  ${_articleTitleFocused ? 'focused' : ''
										}`}
								>
									<FloatingLabel
										label='Title.'
										className='_formLabel _autocomplete'
									>
										<Form.Control
											{...register('_article_title')}
											onBlur={() => {
												setArticleTitleFocused(false);
												trigger('_article_title');
											}}
											onFocus={() =>
												setArticleTitleFocused(true)
											}
											placeholder='e.g. Hope for tomorrow.'
											autoComplete='new-password'
											type='text'
											className={`_formControl border rounded-0 ${errors._article_title
												? 'border-danger'
												: ''
												}`}
											name='_article_title'
										/>
										{errors._article_title && (
											<Form.Text
												className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(
													watch('_article_title')
												)
													? '_fieldNotEmpty'
													: ''
													}`}
											>
												{errors._article_title.message}
											</Form.Text>
										)}
										{!_.isEmpty(
											watch('_article_title')
										) && (
												<div
													className='__close'
													onClick={() => {
														resetField(
															'_article_title'
														);
													}}
												></div>
											)}
									</FloatingLabel>
								</Form.Group>
							</Col>
						</Row>
						<Row className='g-col-12 grid'>
							<Col className='g-col-12'>
								<Controller
									name='_article_body'
									control={control}
									render={({ field }) => (
										<Form.Group
											controlId='_article_body'
											className={`_formGroup _articleGroup rounded-1 ${_articleBodyFocused
												? 'focused'
												: ''
												}`}
										>
											<FloatingLabel
												label='Content.'
												className='_formLabel _autocomplete'
											>
												<ReactQuill
													className={`d-flex flex-column border rounded-0 ${errors._article_body
														? 'border-danger'
														: ''
														}`}
													placeholder='Tell us your story.'
													theme='snow'
													modules={__modules}
													value={__reactQuill}
													onChange={() =>
														setReactQuill()
													}
													onBlur={() => {
														setArticleBodyFocused(
															false
														);
														trigger(
															'_article_body'
														);
													}}
													onFocus={() =>
														setArticleBodyFocused(
															true
														)
													}
												/>
												{errors._article_body && (
													<Form.Text
														className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(
															watch(
																'_article_body'
															)
														)
															? '_fieldNotEmpty'
															: ''
															}`}
													>
														{
															errors._article_body
																.message
														}
													</Form.Text>
												)}
											</FloatingLabel>
										</Form.Group>
									)}
								/>
								<Form.Group
									controlId='_article_tags'
									className={`_formGroup _tagGroup g-col-7 ${_articleTagsFocused
										? 'focused'
										: ''
										}`}
								>
									<FloatingLabel
										label='Tags.'
										className='_formLabel _autocomplete'
										{...getLabelPropsTag()}
									>
										<FontAwesomeIcon
											icon={
												faHashtag
											}
										/>
										<Form.Control
											{...getInputPropsTag(
												{
													onFocus: _handleFocusTag,
													onBlur: _handleBlurTag,
												},
												{
													suppressRefError: true,
												}
											)}
											value={inputValueTag}
											placeholder='Tag.'
											className={`_formControl border border-top-0 rounded-0 ${errors._article_tags
												? 'border-danger'
												: ''
												} ${!_.isEmpty(
													_typedCharactersTag
												)
													? '_typing'
													: ''
												}`}
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
										{_articleTagsError && (
											<Form.Text
												className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(
													inputValueTag
												)
													? '_fieldNotEmpty'
													: ''
													}`}
											>
												{
													_articleTagsError
												}
											</Form.Text>
										)}
										{(!_.isEmpty(
											inputValueTag
										) ||
											!_.isEmpty(
												_typedCharactersTag
											)) && (
												<div
													className='_tagButton __close'
													onClick={() => {
														_handleChangeTag(
															''
														);
													}}
												></div>
											)}
										<div
											className='__selectedTags'
										>
											<SimpleBar
												style={{ maxWidth: '100%', height: '7vh' }}
												forceVisible='x'
												autoHide={true} // Hide scrollbar when not hovered
											>
												<ul className='text-muted tags d-flex flex-row justify-content-end align-items-center'>
													{
														_.map(
															watch('_article_tags'),
															(
																item,
																index
															) => {
																return (
																	<li
																		key={`${item}${index}`}
																		className={`tag_item rounded-0 d-flex align-items-center`}
																		{...getSelectedItemProps({
																			selectedItem: item,
																			index,
																		})}
																		data-order={`${index}`}
																	>
																		<FontAwesomeIcon
																			icon={
																				faHashtag
																			}
																		/>
																		<p>
																			{_.upperFirst(
																				item
																			)}
																			.
																		</p>
																		<div
																			className='__close'
																			onClick={() => {
																				_handleRemoveTag(index);
																			}}
																		></div>
																	</li>
																);
															}
														)
													}
												</ul>
											</SimpleBar>
										</div>
									</FloatingLabel>
									<SimpleBar
										className='_SimpleBar'
										style={{
											maxHeight:
												'10.3vh',
										}}
										forceVisible='y'
										autoHide={false}
									>
										<ListGroup
											className={`border border-top-0 rounded-0 text-muted tags d-flex flex-row align-items-start ${!(
												isOpenTag &&
												__tagItems.length
											) &&
												'hidden'
												}`}
											{...getMenuPropsTag({}, { suppressRefError: true })}
										>
											{
												isOpenTag &&
												_.map(
													__tagItems,
													(
														item,
														index
													) => {
														return (
															<ListGroup.Item
																className={`tag_item border border-0 rounded-0 d-flex align-items-center ${highlightedIndexTag ===
																	index &&
																	'bg-blue-300'
																	} ${selectedItemTag ===
																	item &&
																	'font-bold'
																	}`}
																key={`${item.value}${index}`}
																{...getItemPropsTag(
																	{
																		item,
																		index,
																	}
																)}
															>
																<FontAwesomeIcon
																	icon={
																		faHashtag
																	}
																/>
																<p>
																	{_.upperFirst(
																		item.value
																	)}
																	.
																</p>
															</ListGroup.Item>
														);
													}
												)}
										</ListGroup>
									</SimpleBar>
								</Form.Group>
							</Col>
						</Row>
					</Modal.Body>
					<Modal.Footer>
						<Row className='g-col-12 grid'>
							<Col className='g-col-6 grid'>
								<Form.Group
									controlId='_article_isPrivate'
									className='_formGroup _checkGroup g-col-2'
								>
									<FloatingLabel
										className={`_formLabel ${watch('_article_isPrivate')
											? '__checked'
											: ''
											}`}
									>
										<Form.Check
											{...register('_article_isPrivate')}
											type='checkbox'
											className='_formSwitch'
											name='_article_isPrivate'
										/>
										<span
											className='d-flex align-items-center justify-content-center'
											onClick={() => {
												// Toggle the checkbox when the span is clicked
												const ___checkbox = document.getElementById('_article_isPrivate');
												___checkbox.click();
											}}
										>
											<FontAwesomeIcon
												icon={
													!watch('_article_isPrivate')
														? faEye
														: faEyeSlash
												}
											/>
											{
												!watch('_article_isPrivate')
													? 'Public'
													: 'Private'
											}
										</span>
									</FloatingLabel>
								</Form.Group>
								<Dropdown
									show={_showCategoryDropdown || isOpenCategory}
									onMouseEnter={() => setShowCategoryDropdown(true)}
									onMouseLeave={() => setShowCategoryDropdown(false)}
									drop={'up'}
									className='g-col-1'
								>
									<Dropdown.Toggle as='span'>
										<span className='d-flex align-items-center justify-content-center border'>
											<FontAwesomeIcon
												icon={faEllipsisV}
											/>
										</span>
									</Dropdown.Toggle>
									<Dropdown.Menu
										className='border rounded-0'
									>
										{_.map(
											__4topCategories,
											(__aCategory, __index) => {
												return (
													<Dropdown.Item
														as='span'
														key={__index}
													>
														<Form.Group
															controlId='_article_category'
															className='_formGroup _checkGroup'
														>
															<FloatingLabel
																label={`${_.upperFirst(__aCategory.name)}.`}
																className='_formLabel __checkBox'
															>
																<Controller
																	name='_article_category'
																	control={
																		control
																	}
																	render={({
																		field,
																	}) => (
																		<Form.Check
																			type='checkbox'
																			className='_formCheckbox d-flex'
																			checked={
																				watch(
																					'_article_category'
																				) ===
																				__aCategory.name
																			}
																			onChange={() =>
																				handleSwitchCategoryChange(
																					__aCategory.name
																				)
																			}
																		/>
																	)}
																/>
															</FloatingLabel>
														</Form.Group>
													</Dropdown.Item>
												);
											}
										)}
										<Dropdown.Item
											as='span'
											className={`${isOpenCategory && 'isOpen'
												}`}
										>
											<Controller
												name='_article_category'
												control={control}
												render={({ field }) => (
													<Form.Group
														controlId='_article_category'
														className={`_formGroup _searchGroup ${_articleCategoryFocused
															? 'focused'
															: ''
															}`}
													>
														<FloatingLabel
															label='Category.'
															className='_formLabel _autocomplete'
															{...getLabelPropsCategory()}
														>
															<FontAwesomeIcon
																icon={
																	faMagnifyingGlass
																}
															/>
															<Form.Control
																{...getInputPropsCategory(
																	{
																		...field,
																		onFocus: _handleFocusCategory,
																		onBlur: _handleBlurCategory,
																	},
																	{
																		suppressRefError: true,
																	}
																)}
																placeholder='Category.'
																className={`_formControl border rounded-0 ${errors._article_category
																	? 'border-danger'
																	: ''
																	} ${!_.isEmpty(
																		_typedCharactersCategory
																	)
																		? '_typing'
																		: ''
																	}`}
															/>
															<span className='d-flex align-items-center _autocorrect'>
																{
																	(() => {
																		const __categorySuggestionSplit = _.split(_categorySuggestion, '');
																		const __typedCharactersCategorySplit = _.split(_typedCharactersCategory, '');
																		const __startIndex = _.indexOf(__categorySuggestionSplit, _.head(__typedCharactersCategorySplit));

																		return (
																			<>
																				{__startIndex !== -1 && (
																					<>
																						<p className='_categorySuggestion'>
																							{_.join(_.slice(__categorySuggestionSplit, 0, __startIndex), '')}
																						</p>
																					</>
																				)}
																				<p className='_typedCharacters'>
																					{_typedCharactersCategory}
																				</p>
																				{__startIndex !== -1 && (
																					<>
																						<p className='_categorySuggestion'>
																							{_.join(_.slice(__categorySuggestionSplit, __startIndex + _.size(__typedCharactersCategorySplit)), '')}
																						</p>
																					</>
																				)}
																			</>
																		);
																	})()
																}
															</span>
															{errors._article_category && (
																<Form.Text
																	className={`bg-danger text-danger d-flex align-items-start bg-opacity-25 ${!_.isEmpty(
																		watch(
																			'_article_category'
																		)
																	)
																		? '_fieldNotEmpty'
																		: ''
																		}`}
																>
																	{
																		errors
																			._article_category
																			.message
																	}
																</Form.Text>
															)}
															{(!_.isEmpty(
																watch(
																	'_article_category'
																)
															) ||
																!_.isEmpty(
																	_typedCharactersCategory
																)) && (
																	<div
																		className='_categoryButton __close'
																		onClick={() => {
																			resetField(
																				'_article_category'
																			);
																			_handleChangeCategory(
																				''
																			);
																		}}
																	></div>
																)}
														</FloatingLabel>
														<SimpleBar
															className='_SimpleBar'
															style={{
																maxHeight:
																	'10.3vh',
															}}
															forceVisible='y'
															autoHide={false}
														>
															<ListGroup
																className={`border border-0 rounded-0 d-block ${!(
																	isOpenCategory &&
																	__categoryItems.length
																) &&
																	'hidden'
																	}`}
																{...getMenuPropsCategory()}
															>
																{
																	isOpenCategory &&
																	_.map(
																		__categoryItems,
																		(
																			item,
																			index
																		) => {
																			return (
																				<ListGroup.Item
																					className={`border border-0 rounded-0 d-flex align-items-center ${highlightedIndexCategory ===
																						index &&
																						'bg-blue-300'
																						} ${selectedItemCategory ===
																						item &&
																						'font-bold'
																						}`}
																					key={`${item.value}${index}`}
																					{...getItemPropsCategory(
																						{
																							item,
																							index,
																						}
																					)}
																				>
																					<FontAwesomeIcon
																						icon={
																							faMagnifyingGlass
																						}
																						className='me-2'
																					/>
																					<p>
																						{_.upperFirst(
																							item.value
																						)}
																						.
																					</p>
																				</ListGroup.Item>
																			);
																		}
																	)}
															</ListGroup>
														</SimpleBar>
													</Form.Group>
												)}
											/>
										</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</Col>
							<Col className='g-col-6 d-flex justify-content-end'>
								<Button
									type='submit'
									className='border border-0 rounded-0 inverse w-50'
									variant='outline-light'
								>
									<div className='buttonBorders'>
										<div className='borderTop'></div>
										<div className='borderRight'></div>
										<div className='borderBottom'></div>
										<div className='borderLeft'></div>
									</div>
									<span>
										{!_.isEmpty(_articleToEdit)
											? 'Update'
											: 'Submit'}
										<b className='pink_dot'>.</b>
									</span>
								</Button>
							</Col>
						</Row>
					</Modal.Footer>
				</Form>
			</Modal>
		</div>
	);
};

export default PBlog;
