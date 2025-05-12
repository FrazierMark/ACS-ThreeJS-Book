import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useMemo } from 'react';
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
  const [localSearchType, setLocalSearchType] = useState('classics');
  const [featuredSearchTerm] = useState('classics');

  // Navigation pagination state
  const [pageNavStart, setPageNavStart] = useState(0);
  const MAX_PAGE_BUTTONS = 5; // Maximum number of page buttons to show (not including cover/back)

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

  // Adjust page navigation based on current page
  useEffect(() => {
    // If current page is outside our visible range, adjust the start
    if (page > 0 && page < pages.length - 1) { // Not cover or back cover
      if (page >= pageNavStart + MAX_PAGE_BUTTONS) {
        setPageNavStart(page - Math.floor(MAX_PAGE_BUTTONS / 2));
      } else if (page < pageNavStart) {
        setPageNavStart(Math.max(1, page - 1));
      }
    }
  }, [page, pages.length, pageNavStart]);

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

  // Create the array of page buttons to display
  const pageButtons = useMemo(() => {
    if (!pages || pages.length <= 2) return []; // No internal pages

    const buttons = [];

    // Always add Cover button first
    buttons.push(
      <button
        key="cover"
        className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${0 === page
          ? "bg-white/90 text-black"
          : "bg-black/30 text-white"
          }`}
        onClick={() => dispatch(setPage(0))}
      >
        Cover
      </button>
    );

    // Add Previous button if not at the beginning
    if (pageNavStart > 1) {
      buttons.push(
        <button
          key="prev"
          className="border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border bg-black/30 text-white"
          onClick={() => setPageNavStart(Math.max(1, pageNavStart - MAX_PAGE_BUTTONS))}
        >
          &laquo;
        </button>
      );
    }

    // Add page buttons
    const endIndex = Math.min(pageNavStart + MAX_PAGE_BUTTONS, pages.length - 1);
    for (let i = pageNavStart; i < endIndex; i++) {
      if (i >= 1) { // Skip cover (index 0)
        buttons.push(
          <button
            key={i}
            className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${i === page
              ? "bg-white/90 text-black"
              : "bg-black/30 text-white"
              }`}
            onClick={() => dispatch(setPage(i))}
          >
            {`Page ${i}`}
          </button>
        );
      }
    }

    // Add Next button if not at the end
    if (endIndex < pages.length - 1) {
      buttons.push(
        <button
          key="next"
          className="border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border bg-black/30 text-white"
          onClick={() => setPageNavStart(Math.min(pages.length - MAX_PAGE_BUTTONS - 1, pageNavStart + MAX_PAGE_BUTTONS))}
        >
          &raquo;
        </button>
      );
    }

    // Always add Back Cover button last
    buttons.push(
      <button
        key="backcover"
        className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${pages.length - 1 === page
          ? "bg-white/90 text-black"
          : "bg-black/30 text-white"
          }`}
        onClick={() => dispatch(setPage(pages.length))}
      >
        Back Cover
      </button>
    );

    return buttons;
  }, [pages, page, pageNavStart, dispatch]);

  return (
    <>
      <main className="pointer-events-none select-none z-10 inset-0 flex justify-between flex-col">
        <a
          className="pointer-events-auto absolute top-0 left-0 m-5 ml-10"
          href=""
        >
          <img className="w-14" src="/images/Shape.png" />
        </a>

        {selectedBook && (
          <div className="w-full overflow-auto pointer-events-auto absolute z-20 bottom-0 left-0 flex justify-center">
            <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
              {pageButtons}
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
