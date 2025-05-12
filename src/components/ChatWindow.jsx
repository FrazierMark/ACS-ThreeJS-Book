import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { GoogleGenAI } from "@google/genai";
import '../styles/ChatWindow.css';

// Initialize the Google GenAI with your API key
// You should move this to an environment variable in production
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || "YOUR_API_KEY";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const ChatWindow = () => {
  const selectedBook = useSelector(state => state.books.selectedBook);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize chat with a welcome message when a book is selected
  useEffect(() => {
    if (selectedBook) {
      const bookTitle = selectedBook.title;

      // Get author information - use author details if available, otherwise fallback to author_name
      let authorInfo = "Unknown";
      if (selectedBook.authorDetails && selectedBook.authorDetails.length > 0) {
        authorInfo = selectedBook.authorDetails.map(author => author.name).join(', ');
      } else if (selectedBook.author_name) {
        authorInfo = selectedBook.author_name.join(', ');
      }

      // Add pages info if available
      let pagesInfo = '';
      if (selectedBook.numberOfPages) {
        pagesInfo = ` The book has ${selectedBook.numberOfPages} pages.`;
      }

      // Initial message from AI
      const initialMessage = {
        role: 'ai',
        content: `Hello! I see you're exploring "${bookTitle}" by ${authorInfo}.${pagesInfo} What would you like to know about this book?`
      };

      setMessages([initialMessage]);
    }
  }, [selectedBook]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create detailed context about the book and its authors for better AI responses
      let bookContext = "";

      if (selectedBook) {
        // Basic book info
        bookContext = `The user is reading "${selectedBook.title}"`;

        // Author information
        if (selectedBook.authorDetails && selectedBook.authorDetails.length > 0) {
          // Use comprehensive author details
          const authorNames = selectedBook.authorDetails.map(author => author.name).join(', ');
          bookContext += ` by ${authorNames}.`;

          // Add author bios if available
          const authorBios = selectedBook.authorDetails
            .filter(author => author.bio)
            .map(author => `${author.name}: ${typeof author.bio === 'string' ? author.bio : author.bio.value || 'No biography available'}`)
            .join('\n');

          if (authorBios) {
            bookContext += `\nAuthor information:\n${authorBios}`;
          }
        } else if (selectedBook.author_name) {
          // Fallback to simple author names
          bookContext += ` by ${selectedBook.author_name.join(', ')}.`;
        }

        // Add number of pages if available
        if (selectedBook.numberOfPages) {
          bookContext += ` The book has ${selectedBook.numberOfPages} pages.`;
        }

        // Add publication date if available
        if (selectedBook.first_publish_year) {
          bookContext += ` It was first published in ${selectedBook.first_publish_year}.`;
        }

        // Add detailed info if available
        if (selectedBook.detailedInfo) {
          // Add publishers
          if (selectedBook.detailedInfo.publishers && selectedBook.detailedInfo.publishers.length > 0) {
            bookContext += `\nPublished by: ${selectedBook.detailedInfo.publishers.join(', ')}`;
          }

          // Add subjects/genres
          if (selectedBook.detailedInfo.subjects && selectedBook.detailedInfo.subjects.length > 0) {
            bookContext += `\nSubjects: ${selectedBook.detailedInfo.subjects.slice(0, 5).join(', ')}`;
          }
        }

        // Add description if available
        if (selectedBook.description) {
          const description = typeof selectedBook.description === 'string'
            ? selectedBook.description
            : selectedBook.description.value || '';

          if (description) {
            bookContext += `\nBook description: ${description}`;
          }
        }
      }

      // Prepare conversation history for AI
      const promptMessages = [
        `You are a helpful AI assistant specializing in literature and books. ${bookContext}`,
        ...messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`),
        `User: ${input}`
      ].join('\n');

      // Call the Google GenAI API
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: promptMessages,
      });

      // Add AI response to chat
      const aiMessage = { role: 'ai', content: response.text || "I'm not sure how to respond to that." };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "Sorry, I wasn't able to respond. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedBook) return null;

  return (
    <div className="chat-window bg-black/70 text-white rounded-lg p-4 flex flex-col h-full max-h-[80vh]">
      <h2 className="text-xl font-bold mb-4">Book Assistant</h2>

      <div className="messages-container flex-grow overflow-y-auto mb-4 pr-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message mb-3 p-3 rounded-lg ${message.role === 'user'
              ? 'bg-blue-600 ml-auto max-w-[80%]'
              : 'bg-gray-700 mr-auto max-w-[80%]'
              }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="message mb-3 p-3 rounded-lg bg-gray-700 mr-auto">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-auto">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something about the book..."
            className="flex-grow p-3 rounded-l-lg focus:outline-none text-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-3 rounded-r-lg ${isLoading || !input.trim()
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
              }`}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 