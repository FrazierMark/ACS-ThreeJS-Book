# 3D Book Viewer Web Application

![3D Book Viewer](public/images/Shape.png)

A modern, interactive 3D book viewer built with React, Redux, and Three.js. This application allows users to search for books from the Open Library API, view them in a realistic 3D environment, and interact with the content using an AI-powered chat assistant.

## Features

- **Real-time 3D Book Rendering**: View books in an interactive 3D environment with realistic page turning animations
- **Open Library Integration**: Search for millions of books using the Open Library API
- **Responsive Design**: Optimized for various screen sizes and devices
- **AI Chat Assistant**: Discuss the book with a Google Generative AI (Gemini) powered chat interface
- **Realistic Book Physics**: Books have appropriate thickness based on page count with front and back covers
- **Interactive Controls**: Easily navigate through pages with intuitive controls

## Screenshots

[Consider adding screenshots here]

## Technologies Used

- **React**: Frontend UI framework
- **Redux**: State management
- **Three.js**: 3D rendering engine
- **@react-three/fiber**: React bindings for Three.js
- **@react-three/drei**: Useful helpers for React-Three-Fiber
- **Google Generative AI (Gemini)**: AI chat assistant
- **Open Library API**: Book data source
- **Tailwind CSS**: Styling framework

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/FrazierMark/ACS-ThreeJS-Book.git
   cd ACS-THREEJS-BOOK
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your Google AI API key (if using the AI chat feature):
   ```
   REACT_APP_GOOGLE_AI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Searching for Books**: Use the search bar to find books by title, author, or general keywords
2. **Selecting a Book**: Click on a book card to load it in the 3D viewer
3. **Page Navigation**: Use the buttons at the bottom of the screen to navigate through the book
   - Click "Cover" to view the front cover
   - Click page numbers to go to specific pages
   - Click "Back Cover" to view the back cover
4. **AI Chat**: Interact with the AI assistant to discuss the book's content and themes

## Project Structure

```
/src
  /components        # React components
    Book.jsx         # Main 3D book component
    Page.jsx         # Individual page component
    UI.jsx           # User interface component
    ChatWindow.jsx   # AI chat assistant component
  /features          # Redux slices
    pagesSlice.js    # State management for pages
  /redux             # Redux store and actions
    /actions         # Action creators
    /reducers        # Reducers
  /services          # External API services
    openLibraryApi.js # Open Library API integration
  /styles            # CSS styles
  /textures          # Texture assets for the 3D book
  App.js             # Main app component
  index.js           # Entry point
```

## Acknowledgments

- Open Library API for providing access to book data
- Three.js community for excellent documentation and examples
- React and Redux teams for building powerful frontend tools 