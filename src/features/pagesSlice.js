import { createSlice } from '@reduxjs/toolkit';

// Import the pictures array and pages setup from UI.jsx
const pictures = [
	'front',
	'front',
	'front',
	'front',
	'front',
	'front',
	'front',
	'front',
	'front',
	'front',
	'front',
	'front',
];

export const pages = [
	{
		front: 'front',
		back: 'back',
	},
];

for (let i = 1; i < pictures.length - 1; i += 2) {
	pages.push({
		front: pictures[i % pictures.length],
		back: pictures[(i + 1) % pictures.length],
	});
}

pages.push({
	front: pictures[pictures.length - 1],
	back: 'back',
});

const pagesSlice = createSlice({
	name: 'pages',
	initialState: {
		currentPage: 0,
		pages: pages,
	},
	reducers: {
		setPage: (state, action) => {
			state.currentPage = action.payload;
		},
	},
});

export const { setPage } = pagesSlice.actions;
export const getCurrentPage = (state) => state.pages.currentPage;
export const getAllPages = (state) => state.pages.pages;
export default pagesSlice.reducer;
