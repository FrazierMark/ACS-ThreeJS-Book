import { useState, useCallback } from 'react';
import {
	searchBooks as apiSearchBooks,
	searchBooksByTitle,
	searchBooksByAuthor,
	getBookByOLID,
	getBookByISBN,
	getCoverImageUrl,
	getAuthorImageUrl,
} from '../services/openLibraryApi';

/**
 * Custom hook for interacting with Open Library API
 * @returns {Object} API methods and state
 */
export const useOpenLibrary = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	/**
	 * Search books by query
	 * @param {string} query - Search query
	 * @param {number} page - Page number (starting from 1)
	 * @param {number} limit - Number of results per page
	 * @returns {Promise} Promise with search results
	 */
	const searchBooks = useCallback(async (query, page = 1, limit = 20) => {
		if (!query) {
			return { docs: [] };
		}

		try {
			setIsLoading(true);
			setError(null);
			return await apiSearchBooks(query, page, limit);
		} catch (err) {
			setError(err.message || 'Failed to search books');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	/**
	 * Search books by title
	 * @param {string} title - Book title to search for
	 * @param {number} page - Page number
	 * @param {number} limit - Results per page
	 * @returns {Promise} Promise with search results
	 */
	const searchByTitle = useCallback(async (title, page = 1, limit = 20) => {
		if (!title) {
			return { docs: [] };
		}

		try {
			setIsLoading(true);
			setError(null);
			return await searchBooksByTitle(title, page, limit);
		} catch (err) {
			setError(err.message || 'Failed to search books by title');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	/**
	 * Search books by author
	 * @param {string} author - Author name
	 * @param {number} page - Page number
	 * @param {number} limit - Results per page
	 * @param {string} sort - Sort order
	 * @returns {Promise} Promise with search results
	 */
	const searchByAuthor = useCallback(
		async (author, page = 1, limit = 20, sort = 'relevance') => {
			if (!author) {
				return { docs: [] };
			}

			try {
				setIsLoading(true);
				setError(null);
				return await searchBooksByAuthor(author, page, limit, sort);
			} catch (err) {
				setError(err.message || 'Failed to search books by author');
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	/**
	 * Get book details by Open Library ID
	 * @param {string} olid - Open Library ID
	 * @returns {Promise} Promise with book details
	 */
	const getWorkByOLID = useCallback(async (olid) => {
		if (!olid) {
			throw new Error('Open Library ID is required');
		}

		try {
			setIsLoading(true);
			setError(null);
			return await getBookByOLID(olid);
		} catch (err) {
			setError(err.message || 'Failed to get book details');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	/**
	 * Get book details by ISBN
	 * @param {string} isbn - ISBN number
	 * @returns {Promise} Promise with book details
	 */
	const getByISBN = useCallback(async (isbn) => {
		if (!isbn) {
			throw new Error('ISBN is required');
		}

		try {
			setIsLoading(true);
			setError(null);
			return await getBookByISBN(isbn);
		} catch (err) {
			setError(err.message || 'Failed to get book details by ISBN');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	return {
		isLoading,
		error,
		searchBooks,
		searchByTitle,
		searchByAuthor,
		getWorkByOLID,
		getByISBN,
		getCoverImageUrl,
		getAuthorImageUrl,
	};
};
