import { createSlice } from '@reduxjs/toolkit';
import {
	FETCH_BOOK_DETAILS_SUCCESS,
	CLEAR_BOOK_DETAILS,
} from '../redux/actions/bookActions';

// Default fallback front and back cover images
const DEFAULT_FRONT = 'front';
const DEFAULT_BACK = 'back';

const pagesSlice = createSlice({
	name: 'pages',
	initialState: {
		currentPage: 0,
		pages: [
			{
				front: DEFAULT_FRONT,
				back: DEFAULT_BACK,
			},
		],
	},
	reducers: {
		setPage: (state, action) => {
			state.currentPage = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(FETCH_BOOK_DETAILS_SUCCESS, (state, action) => {
				const bookDetails = action.payload.details;

				// Get number of pages from the book details, with minimum of 1
				const numPages = Math.max(1, bookDetails.numberOfPages || 10);

				// Create new pages array - always start with front cover
				const newPages = [
					{
						front: DEFAULT_FRONT,
						back: DEFAULT_BACK,
					},
				];

				// Create internal pages
				for (let i = 0; i < numPages; i += 2) {
					newPages.push({
						front: DEFAULT_FRONT,
						back: DEFAULT_BACK,
					});
				}

				// Add back cover as the last page
				newPages.push({
					front: DEFAULT_BACK,
					back: DEFAULT_BACK,
				});

				// Update state with new pages
				state.pages = newPages;
				state.currentPage = 0; // Reset to front cover
			})
			.addCase(CLEAR_BOOK_DETAILS, (state) => {
				// Reset pages to default state
				state.pages = [
					{
						front: DEFAULT_FRONT,
						back: DEFAULT_BACK,
					},
				];
				state.currentPage = 0;
			});
	},
});

export const { setPage } = pagesSlice.actions;
export const getCurrentPage = (state) => state.pages.currentPage;
export const getAllPages = (state) => state.pages.pages;

export default pagesSlice.reducer;
