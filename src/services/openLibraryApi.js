import axios from 'axios';

const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';
const INTERNET_ARCHIVE_BASE_URL = 'https://archive.org';

/**
 * Search for books using the Open Library Search API
 * @param {string} query - The search query
 * @param {number} page - Page number (starting from 1)
 * @param {number} limit - Number of results per page
 * @returns {Promise} Promise with search results
 */
const searchBooks = async (query, page = 1, limit = 20) => {
	try {
		// Calculate offset from page number (API uses offset, we expose page for convenience)
		const offset = (page - 1) * limit;

		const response = await axios.get(`${OPEN_LIBRARY_BASE_URL}/search.json`, {
			params: {
				q: query,
				offset,
				limit,
				fields: '*,availability',
			},
		});

		return response.data;
	} catch (error) {
		console.error('Open Library search error:', error);
		throw error;
	}
};

/**
 * Search books by title
 * @param {string} title - Book title to search for
 * @param {number} page - Page number (starting from 1)
 * @param {number} limit - Number of results per page
 * @returns {Promise} Promise with search results
 */
const searchBooksByTitle = async (title, page = 1, limit = 20) => {
	try {
		const offset = (page - 1) * limit;

		const response = await axios.get(`${OPEN_LIBRARY_BASE_URL}/search.json`, {
			params: {
				title,
				offset,
				limit,
				fields: '*,availability',
			},
		});

		return response.data;
	} catch (error) {
		console.error('Open Library title search error:', error);
		throw error;
	}
};

/**
 * Search books by author
 * @param {string} author - Author name to search for
 * @param {number} page - Page number (starting from 1)
 * @param {number} limit - Number of results per page
 * @param {string} sort - Sort order (e.g., 'new', 'old', etc.)
 * @returns {Promise} Promise with search results
 */
const searchBooksByAuthor = async (
	author,
	page = 1,
	limit = 20,
	sort = 'relevance'
) => {
	try {
		const offset = (page - 1) * limit;

		const response = await axios.get(`${OPEN_LIBRARY_BASE_URL}/search.json`, {
			params: {
				author,
				offset,
				limit,
				sort,
				fields: '*,availability',
			},
		});

		return response.data;
	} catch (error) {
		console.error('Open Library author search error:', error);
		throw error;
	}
};

/**
 * Get book details by Open Library ID
 * @param {string} olid - Open Library ID
 * @returns {Promise} Promise with book details
 */
const getBookByOLID = async (olid) => {
	try {
		const response = await axios.get(
			`${OPEN_LIBRARY_BASE_URL}/works/${olid}.json`
		);
		return response.data;
	} catch (error) {
		console.error(`Error fetching book with OLID ${olid}:`, error);
		throw error;
	}
};

/**
 * Get book details by ISBN
 * @param {string} isbn - ISBN number
 * @returns {Promise} Promise with book details
 */
const getBookByISBN = async (isbn) => {
	try {
		const response = await axios.get(`${OPEN_LIBRARY_BASE_URL}/api/books`, {
			params: {
				bibkeys: `ISBN:${isbn}`,
				format: 'json',
				jscmd: 'data',
			},
		});
		return response.data[`ISBN:${isbn}`];
	} catch (error) {
		console.error(`Error fetching book with ISBN ${isbn}:`, error);
		throw error;
	}
};

/**
 * Get cover image URL by cover ID
 * @param {string} coverId - Cover ID
 * @param {string} size - Size of the cover (S, M, L)
 * @returns {string} URL to the cover image
 */
const getCoverImageUrl = (coverId, size = 'M') => {
	if (!coverId) return null;
	return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

/**
 * Get author image URL by author ID
 * @param {string} authorId - Author ID (OL ID)
 * @param {string} size - Size of the image (S, M, L)
 * @returns {string} URL to the author image
 */
const getAuthorImageUrl = (authorId, size = 'M') => {
	if (!authorId) return null;
	return `https://covers.openlibrary.org/a/olid/${authorId}-${size}.jpg`;
};

/**
 * Get detailed book information including available formats
 * @param {string} workId - Open Library work ID (e.g., 'OL1234W')
 * @returns {Promise} Promise with detailed book information
 */
const getWorkDetails = async (workId) => {
	try {
		// Remove the /works/ prefix if it's included
		const cleanId = workId.replace(/^\/works\//, '');

		const response = await axios.get(
			`${OPEN_LIBRARY_BASE_URL}/works/${cleanId}.json`
		);
		return response.data;
	} catch (error) {
		console.error(`Error fetching work details for ${workId}:`, error);
		throw error;
	}
};

/**
 * Check if a book has readable content on Internet Archive
 * @param {string} workId - Open Library work ID
 * @returns {Promise} Promise with availability information
 */
const checkBookReadability = async (workId) => {
	try {
		// Remove the /works/ prefix if it's included
		const cleanId = workId.replace(/^\/works\//, '');

		const response = await axios.get(
			`${OPEN_LIBRARY_BASE_URL}/works/${cleanId}/editions.json?limit=50`
		);
		const editions = response.data.entries || [];

		// Find editions with ocaid (Internet Archive ID)
		const readableEditions = editions.filter((edition) => edition.ocaid);

		return {
			isReadable: readableEditions.length > 0,
			editions: readableEditions,
			readingUrl:
				readableEditions.length > 0
					? `${INTERNET_ARCHIVE_BASE_URL}/details/${readableEditions[0].ocaid}`
					: null,
		};
	} catch (error) {
		console.error(`Error checking readability for ${workId}:`, error);
		throw error;
	}
};

/**
 * Get the full text URL for reading a book
 * @param {string} iaId - Internet Archive ID
 * @returns {string} URL to read the book online
 */
const getReadUrl = (iaId) => {
	if (!iaId) return null;
	return `${INTERNET_ARCHIVE_BASE_URL}/details/${iaId}`;
};

/**
 * Get available formats for a book by Internet Archive ID
 * @param {string} iaId - Internet Archive ID
 * @returns {Promise} Promise with format information
 */
const getBookFormats = async (iaId) => {
	try {
		if (!iaId) throw new Error('Internet Archive ID is required');

		const response = await axios.get(
			`${INTERNET_ARCHIVE_BASE_URL}/metadata/${iaId}`
		);
		const metadata = response.data;

		return {
			formats: metadata.files?.filter((file) => file.format) || [],
			metadata,
		};
	} catch (error) {
		console.error(`Error fetching formats for ${iaId}:`, error);
		throw error;
	}
};

/**
 * Get full cover and back images for a book
 * @param {string} isbn - ISBN of the book
 * @returns {Object} Object with URLs for front and back cover images
 */
const getFullCoverImages = (isbn) => {
	if (!isbn) return { front: null, back: null };

	return {
		front: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
		back: `https://covers.openlibrary.org/b/isbn/${isbn}-b-L.jpg`, // Note: back covers often aren't available
		spine: `https://covers.openlibrary.org/b/isbn/${isbn}-s-L.jpg`, // Spine image
	};
};

/**
 * Get the book text (content) by Internet Archive ID
 * @param {string} iaId - Internet Archive ID
 * @returns {Promise} Promise with book text content
 */
const getBookText = async (iaId) => {
	try {
		if (!iaId) throw new Error('Internet Archive ID is required');

		// First, check if the book has a plain text format available
		const formatsResponse = await axios.get(
			`${INTERNET_ARCHIVE_BASE_URL}/metadata/${iaId}`
		);
		const files = formatsResponse.data.files || [];

		// Look for text formats in preference order
		const textFormats = ['.txt', '_djvu.txt', '.htm', '.html'];

		let textFile = null;

		// Find the first available text format
		for (const format of textFormats) {
			textFile = files.find((file) => file.name.endsWith(format));
			if (textFile) break;
		}

		if (!textFile) {
			console.warn('No text format found for this book');
			return {
				text: null,
				textUrl: `${INTERNET_ARCHIVE_BASE_URL}/stream/${iaId}`,
				readUrl: `${INTERNET_ARCHIVE_BASE_URL}/details/${iaId}?view=theater`,
				availableFormats: files
					.map((f) => f.name)
					.filter((name) => textFormats.some((fmt) => name.endsWith(fmt))),
			};
		}

		// Fetch the actual text content
		const textUrl = `${INTERNET_ARCHIVE_BASE_URL}/download/${iaId}/${textFile.name}`;

		try {
			const textResponse = await axios.get(textUrl);

			return {
				text: textResponse.data,
				textUrl,
				readUrl: `${INTERNET_ARCHIVE_BASE_URL}/details/${iaId}?view=theater`,
				textFile: textFile.name,
			};
		} catch (error) {
			console.error('Error fetching text content:', error);
			return {
				text: null,
				textUrl,
				readUrl: `${INTERNET_ARCHIVE_BASE_URL}/details/${iaId}?view=theater`,
				error: error.message,
			};
		}
	} catch (error) {
		console.error(`Error in getBookText for ${iaId}:`, error);
		throw error;
	}
};

/**
 * Get all book metadata including formats, covers, and content
 * @param {Object} book - Basic book object from search results
 * @returns {Promise} Promise with complete book data
 */
const getCompleteBookData = async (book) => {
	try {
		// Step 1: Get work details
		const workId = book.key;
		const details = await getWorkDetails(workId);

		// Step 2: Check book readability and get editions
		const readability = await checkBookReadability(workId);

		// Step 3: Set up return object with what we have so far
		const completeData = {
			...details,
			readability,
			formats: null,
			text: null,
			coverImages: null,
		};

		// Step 4: Get ISBN if available (from the first edition with ISBN)
		let isbn = null;
		if (readability.editions && readability.editions.length > 0) {
			const editionWithIsbn = readability.editions.find(
				(edition) => edition.isbn_13 || edition.isbn_10
			);
			if (editionWithIsbn) {
				isbn = editionWithIsbn.isbn_13
					? editionWithIsbn.isbn_13[0]
					: editionWithIsbn.isbn_10[0];
				completeData.isbn = isbn;
			}
		}

		// Step 5: Get cover images if ISBN is available
		if (isbn) {
			completeData.coverImages = getFullCoverImages(isbn);
		}

		// Step 6: If readable, get book formats and text
		if (readability.isReadable && readability.editions.length > 0) {
			const iaId = readability.editions[0].ocaid;

			// Get formats
			try {
				completeData.formats = await getBookFormats(iaId);
			} catch (formatError) {
				console.warn('Could not fetch formats:', formatError);
			}

			// Get book text
			try {
				completeData.text = await getBookText(iaId);
			} catch (textError) {
				console.warn('Could not fetch text:', textError);
			}
		}

		return completeData;
	} catch (error) {
		console.error('Error in getCompleteBookData:', error);
		throw error;
	}
};

export {
	searchBooks,
	searchBooksByTitle,
	searchBooksByAuthor,
	getBookByOLID,
	getBookByISBN,
	getCoverImageUrl,
	getAuthorImageUrl,
	getWorkDetails,
	checkBookReadability,
	getReadUrl,
	getBookFormats,
	getFullCoverImages,
	getBookText,
	getCompleteBookData,
};
