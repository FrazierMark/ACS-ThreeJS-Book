import {
	searchBooks,
	searchBooksByTitle,
	searchBooksByAuthor,
	getWorkDetails,
	checkBookReadability,
	getBookFormats,
	getCompleteBookData,
} from '../../services/openLibraryApi';

// Action Types
export const FETCH_BOOKS_REQUEST = 'FETCH_BOOKS_REQUEST';
export const FETCH_BOOKS_SUCCESS = 'FETCH_BOOKS_SUCCESS';
export const FETCH_BOOKS_FAILURE = 'FETCH_BOOKS_FAILURE';
export const APPEND_BOOKS = 'APPEND_BOOKS';
export const SET_SEARCH_PARAMS = 'SET_SEARCH_PARAMS';
export const CLEAR_BOOKS = 'CLEAR_BOOKS';

// Book details action types
export const FETCH_BOOK_DETAILS_REQUEST = 'FETCH_BOOK_DETAILS_REQUEST';
export const FETCH_BOOK_DETAILS_SUCCESS = 'FETCH_BOOK_DETAILS_SUCCESS';
export const FETCH_BOOK_DETAILS_FAILURE = 'FETCH_BOOK_DETAILS_FAILURE';
export const CLEAR_BOOK_DETAILS = 'CLEAR_BOOK_DETAILS';

// Action Creators
export const fetchBooksRequest = () => ({
	type: FETCH_BOOKS_REQUEST,
});

export const fetchBooksSuccess = (books, total) => ({
	type: FETCH_BOOKS_SUCCESS,
	payload: { books, total },
});

export const fetchBooksFailure = (error) => ({
	type: FETCH_BOOKS_FAILURE,
	payload: { error },
});

export const appendBooks = (books) => ({
	type: APPEND_BOOKS,
	payload: { books },
});

export const setSearchParams = (searchType, searchQuery) => ({
	type: SET_SEARCH_PARAMS,
	payload: { searchType, searchQuery },
});

export const clearBooks = () => ({
	type: CLEAR_BOOKS,
});

// Book details action creators
export const fetchBookDetailsRequest = () => ({
	type: FETCH_BOOK_DETAILS_REQUEST,
});

export const fetchBookDetailsSuccess = (details) => ({
	type: FETCH_BOOK_DETAILS_SUCCESS,
	payload: { details },
});

export const fetchBookDetailsFailure = (error) => ({
	type: FETCH_BOOK_DETAILS_FAILURE,
	payload: { error },
});

export const clearBookDetails = () => ({
	type: CLEAR_BOOK_DETAILS,
});

// Thunk Actions
export const fetchBooks = (
	query,
	searchType = 'general',
	page = 1,
	limit = 10
) => {
	return async (dispatch) => {
		dispatch(fetchBooksRequest());

		try {
			let result;

			switch (searchType) {
				case 'title':
					result = await searchBooksByTitle(query, page, limit);
					break;
				case 'author':
					result = await searchBooksByAuthor(query, page, limit);
					break;
				default:
					result = await searchBooks(query, page, limit);
			}

			dispatch(fetchBooksSuccess(result.docs || [], result.numFound || 0));
			return result;
		} catch (error) {
			dispatch(fetchBooksFailure(error.message || 'An error occurred'));
			throw error;
		}
	};
};

export const loadMoreBooks = (
	query,
	searchType = 'general',
	page = 1,
	limit = 20
) => {
	return async (dispatch) => {
		dispatch(fetchBooksRequest());

		try {
			let result;

			switch (searchType) {
				case 'title':
					result = await searchBooksByTitle(query, page, limit);
					break;
				case 'author':
					result = await searchBooksByAuthor(query, page, limit);
					break;
				default:
					result = await searchBooks(query, page, limit);
			}

			dispatch(appendBooks(result.docs || []));
			return result;
		} catch (error) {
			dispatch(fetchBooksFailure(error.message || 'An error occurred'));
			throw error;
		}
	};
};

export const searchAndUpdateParams = (query, searchType = 'general') => {
	return (dispatch) => {
		dispatch(setSearchParams(searchType, query));
		dispatch(fetchBooks(query, searchType));
	};
};

/**
 * Fetch detailed information about a specific book including text and cover images
 * @param {Object} book - Book object from search results
 * @returns {Function} Thunk function
 */
export const fetchBookDetails = (book) => {
	return async (dispatch) => {
		dispatch(fetchBookDetailsRequest());

		try {
			// Use the comprehensive method to get all book data
			const completeData = await getCompleteBookData(book);

			console.log('completeData', completeData);

			dispatch(fetchBookDetailsSuccess(completeData));
			return completeData;
		} catch (error) {
			console.error('Error fetching book details:', error);
			dispatch(
				fetchBookDetailsFailure(error.message || 'Failed to load book details')
			);
			throw error;
		}
	};
};

// Selectors
export const getBookCovers = (state) => state.books.coverImages;
