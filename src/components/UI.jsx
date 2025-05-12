import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { getCurrentPage, getAllPages, setPage } from '../features/pagesSlice';
import { fetchBooks, loadMoreBooks, setSearchParams, fetchBookDetails, clearBooks, clearBookDetails } from '../redux/actions/bookActions';
import { getCoverImageUrl } from '../services/openLibraryApi';
import '../styles/BookSearch.css';

export const UI = () => {
  const dispatch = useDispatch();
  const page = useSelector(getCurrentPage);
  const pages = useSelector(getAllPages);
  const selectedBook = useSelector(state => state.books.selectedBook);
  const { books, loading, error, searchQuery, searchType } = useSelector(state => state.books);

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSearchType, setLocalSearchType] = useState('general');
  const [featuredSearchTerm] = useState('classics');

  useEffect(() => {
    if (books.length === 0 && !loading) {
      dispatch(fetchBooks(featuredSearchTerm));
    }
  }, [dispatch, books.length, loading, featuredSearchTerm]);

  useEffect(() => {
    setLocalSearchType(searchType);
    setLocalSearchQuery(searchQuery);
  }, [searchType, searchQuery]);

  useEffect(() => {
    const audio = new Audio('/audio/page-flip-01a.mp3');
    // audio.volume = 0.2;
    audio.play();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!localSearchQuery.trim()) return;
    dispatch(setSearchParams(localSearchType, localSearchQuery));
    dispatch(fetchBooks(localSearchQuery, localSearchType));
  };

  const handleBookCardClick = (book) => {
    dispatch(fetchBookDetails(book))
      .then(() => {
        dispatch(clearBooks());
      })
      .catch(err => {
        console.error("Error fetching book details:", err);
      });
  };

  return (
    <>
      <main className="pointer-events-none select-none z-10 inset-0 flex justify-between flex-col">
        <a
          className="pointer-events-auto mt-10 ml-10"
          href=""
        >
          <img className="w-14" src="/images/Shape.png" />
        </a>

        {selectedBook && (
          <div className="w-full overflow-auto pointer-events-auto fixed flex justify-center">
            <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
              {[...pages].map((_, index) => (
                <button
                  key={index}
                  className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                    }`}
                  onClick={() => dispatch(setPage(index))}
                >
                  {index === 0 ? "Cover" : `Page ${index}`}
                </button>
              ))}
              <button
                className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${page === pages.length
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
                  }`}
                onClick={() => dispatch(setPage(pages.length))}
              >
                Back Cover
              </button>
            </div>
          </div>
        )}

        {!selectedBook && (
          <div className="book-search pointer-events-auto w-[100%] max-w-[1400px] mx-auto mb-16 my-5 mt-10 bg-black/70 rounded-lg">
            <h2 className="text-white">Open Library Book Search</h2>

            {error && <div className="error">Error: {error}</div>}

            <form onSubmit={handleSearch}>
              <div className="search-controls">
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search for books..."
                  disabled={loading}
                />

                <select
                  value={localSearchType}
                  onChange={(e) => setLocalSearchType(e.target.value)}
                  disabled={loading}
                >
                  <option value="general">All</option>
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                </select>

                <button
                  type="submit"
                  disabled={loading || !localSearchQuery.trim()}
                >
                  {loading && books.length === 0 ? 'Loading...' : 'Search'}
                </button>
              </div>
            </form>

            {loading && books.length === 0 ? (
              <div className="loading text-white">Loading books...</div>
            ) : (
              <div className="books-grid pb-4 mb-10">
                {books.length > 0 ? (
                  books.slice(0, 12).map((book) => (
                    <div
                      key={book.key}
                      className={`book-card`}
                      onClick={() => handleBookCardClick(book)}
                      role="button"
                      aria-label={`View details for ${book.title}`}
                      tabIndex={0}
                    >
                      {book.cover_i && (
                        <img
                          src={getCoverImageUrl(book.cover_i)}
                          alt={book.title}
                        />
                      )}
                      <h3>{book.title}</h3>
                      {book.author_name && <p>By: {book.author_name.join(', ')}</p>}
                      {book.first_publish_year && <p>Published: {book.first_publish_year}</p>}
                    </div>
                  ))
                ) : (
                  <p className="no-results text-white">No books found. Try a different search term.</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};
