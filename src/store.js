import { configureStore } from '@reduxjs/toolkit';
import pagesReducer from './features/pagesSlice';
import bookReducer from './redux/reducers/bookReducer';

const store = configureStore({
	reducer: {
		pages: pagesReducer,
		books: bookReducer,
	},
});

export default store;
