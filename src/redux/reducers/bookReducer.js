import {
	FETCH_BOOKS_REQUEST,
	FETCH_BOOKS_SUCCESS,
	FETCH_BOOKS_FAILURE,
	APPEND_BOOKS,
	SET_SEARCH_PARAMS,
	CLEAR_BOOKS,
	FETCH_BOOK_DETAILS_REQUEST,
	FETCH_BOOK_DETAILS_SUCCESS,
	FETCH_BOOK_DETAILS_FAILURE,
	CLEAR_BOOK_DETAILS,
} from '../actions/bookActions';

const initialState = {
	books: [],
	searchType: 'general',
	searchQuery: '',
	loading: false,
	error: null,
	totalResults: 0,
	currentPage: 1,
	selectedBook: null,
	bookDetailsLoading: false,
	bookDetailsError: null,
	coverImages: {
		front: null,
		back: null,
		spine: null,
	},
};

const bookReducer = (state = initialState, action) => {
	switch (action.type) {
		case FETCH_BOOKS_REQUEST:
			return {
				...state,
				loading: true,
				error: null,
			};

		case FETCH_BOOKS_SUCCESS:
			return {
				...state,
				loading: false,
				books: action.payload.books,
				totalResults: action.payload.total,
				error: null,
				currentPage: 1,
			};

		case FETCH_BOOKS_FAILURE:
			return {
				...state,
				loading: false,
				error: action.payload.error,
			};

		case APPEND_BOOKS:
			return {
				...state,
				loading: false,
				books: [...state.books, ...action.payload.books],
				error: null,
				currentPage: state.currentPage + 1,
			};

		case SET_SEARCH_PARAMS:
			return {
				...state,
				searchType: action.payload.searchType,
				searchQuery: action.payload.searchQuery,
			};

		case CLEAR_BOOKS:
			return {
				...state,
				books: [],
				totalResults: 0,
				currentPage: 1,
			};

		case FETCH_BOOK_DETAILS_REQUEST:
			return {
				...state,
				bookDetailsLoading: true,
				bookDetailsError: null,
			};

		case FETCH_BOOK_DETAILS_SUCCESS:
			const bookDetails = action.payload.details;
			// Extract cover images if available
			const coverImages = bookDetails.coverImages || {
				front: null,
				back: null,
				spine: null,
			};

			return {
				...state,
				selectedBook: bookDetails,
				coverImages: coverImages,
				bookDetailsLoading: false,
				bookDetailsError: null,
			};

		case FETCH_BOOK_DETAILS_FAILURE:
			return {
				...state,
				bookDetailsLoading: false,
				bookDetailsError: action.payload.error,
			};

		case CLEAR_BOOK_DETAILS:
			return {
				...state,
				selectedBook: null,
				coverImages: {
					front: null,
					back: null,
					spine: null,
				},
				bookDetailsLoading: false,
				bookDetailsError: null,
			};

		default:
			return state;
	}
};

export default bookReducer;
