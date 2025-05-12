import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBooks,
  loadMoreBooks,
  setSearchParams,
  fetchBookDetails,
  getBookCovers,
  clearBooks,
  clearBookDetails
} from '../redux/actions/bookActions';
import { getCoverImageUrl } from '../services/openLibraryApi';
import '../styles/BookSearch.css';

const BookSearch = () => {
  const dispatch = useDispatch();
  const {
    books,
    loading,
    error,
    searchQuery,
    searchType,
    currentPage,
    selectedBook,
    bookDetailsLoading,
    coverImages
  } = useSelector(state => state.books);

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSearchType, setLocalSearchType] = useState('general');
  const [featuredSearchTerm] = useState('science fiction');
  const bookSearchRef = useRef(null);

  // Load initial featured books on component mount
  useEffect(() => {
    if (books.length === 0 && !loading) {
      dispatch(fetchBooks(featuredSearchTerm));
    }
  }, [dispatch, books.length, loading, featuredSearchTerm]);

  // Initialize local form state from Redux when component mounts
  useEffect(() => {
    setLocalSearchType(searchType);
    setLocalSearchQuery(searchQuery);
  }, [searchType, searchQuery]);

  // Scroll to 3D view when a book is selected
  useEffect(() => {
    if (selectedBook) {
      // Give a small delay to allow the 3D scene to render
      setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }, 500);
    }
  }, [selectedBook]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!localSearchQuery.trim()) return;

    // Update search parameters in Redux
    dispatch(setSearchParams(localSearchType, localSearchQuery));

    // Fetch books with the new parameters
    dispatch(fetchBooks(localSearchQuery, localSearchType));
  };

  const handleLoadMore = () => {
    if (loading) return;

    dispatch(loadMoreBooks(searchQuery, searchType, currentPage + 1));
  };

  const handleBookCardClick = (book) => {
    // Fetch the complete book data including text and cover images
    dispatch(fetchBookDetails(book))
      .then(bookData => {
        console.log("Complete book data:", bookData);

        // Log if the book is readable online
        if (bookData.readability && bookData.readability.isReadable) {
          console.log("This book is readable online at:", bookData.readability.readingUrl);
        } else {
          console.log("This book is not available for reading online");
        }

        // Log book text if available
        if (bookData.text) {
          if (bookData.text.text) {
            console.log("Book text preview (first 1000 chars):",
              bookData.text.text.substring(0, 1000) + "...");
          }
          console.log("Text URL:", bookData.text.textUrl);
          console.log("Read URL:", bookData.text.readUrl);
        }

        // Create image elements to see if the covers actually work
        // (many back covers aren't available)
        if (bookData.coverImages) {
          console.log("Testing cover image availability:");
          const frontImg = new Image();
          frontImg.onload = () => console.log("Front cover loaded successfully");
          frontImg.onerror = () => console.log("Front cover failed to load");
          frontImg.src = bookData.coverImages.front;

          const backImg = new Image();
          backImg.onload = () => console.log("Back cover loaded successfully");
          backImg.onerror = () => console.log("Back cover failed to load");
          backImg.src = bookData.coverImages.back;
        }

        // Clear the book search results to provide a cleaner UI
        dispatch(clearBooks());

        // Scroll to the 3D book after a short delay
        setTimeout(() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }, 300);
      })
      .catch(err => {
        console.error("Error fetching book details:", err);
      });
  };

  return (
    <div className="book-search" ref={bookSearchRef}>
      <h2>Open Library Book Search</h2>

      {error && <div className="error">Error: {error}</div>}

      {selectedBook ? (
        <div className="selected-book-view">
          <div className="selected-book-indicator">
            <h3>Selected Book: <strong>{selectedBook.title}</strong></h3>
            {selectedBook.author_name && <p>By: {selectedBook.author_name.join(', ')}</p>}
            <p>Explore the 3D book model below!</p>
          </div>

          <button
            className="new-search-button"
            onClick={() => {
              dispatch(clearBookDetails());
              setLocalSearchQuery('');
            }}
          >
            Start New Search
          </button>
        </div>
      ) : (
        <>
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
            <div className="loading">Loading books...</div>
          ) : (
            <>
              <div className="books-grid">
                {books.length > 0 ? (
                  books.map((book) => (
                    <div
                      key={book.key}
                      className={`book-card ${selectedBook && selectedBook.key === book.key ? 'selected' : ''}`}
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
                  <p className="no-results">No books found. Try a different search term.</p>
                )}
              </div>

              {books.length > 0 && (
                <div className="load-more">
                  <button onClick={handleLoadMore} disabled={loading}>
                    {loading ? 'Loading...' : 'Load More Books'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BookSearch; 