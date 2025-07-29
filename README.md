# Raju's Client - Professional Postman Clone

A modern, user-friendly API client for testing REST APIs. Built with React, featuring a beautiful interface and all the essential tools you need for API development and testing.

![Raju's Client Screenshot](https://img.shields.io/badge/React-18.2.0-blue) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.6-blue) ![TypeScript](https://img.shields.io/badge/Vite-5.0.8-yellow)

## ✨ Features

### 🚀 Core Functionality
- **Multiple HTTP Methods**: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **Request Configuration**: Headers, query parameters, request body
- **Multiple Body Types**: JSON, Form Data, Raw text
- **Response Viewer**: Beautiful syntax-highlighted response display
- **Status Information**: Response time, status codes, response size

### 🎨 User Experience
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Code Editor**: Monaco Editor for syntax highlighting and validation
- **Real-time Feedback**: Toast notifications for actions and errors
- **Responsive Design**: Works perfectly on desktop and mobile

### 📚 Organization
- **Request History**: Automatic saving of all requests with timestamps
- **Collections**: Save and organize frequently used requests
- **Search**: Filter through history and collections
- **Local Storage**: Persistent data across browser sessions

### 🔧 Developer Tools
- **Copy/Paste**: Easy URL and response copying
- **Download**: Export responses as JSON files
- **Environment Ready**: Built for extension with environment variables
- **Error Handling**: Comprehensive error reporting and handling

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   # If you have the files locally, navigate to the directory
   cd POSTMANClient
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The application will automatically open in your default browser

### Alternative Commands
```bash
# Using yarn
yarn install
yarn dev

# Using npm with different scripts
npm start  # Alternative to npm run dev
npm run build  # Build for production
npm run preview  # Preview production build
```

## 📖 How to Use

### Making Your First Request

1. **Enter a URL**: Type or paste your API endpoint in the URL field
   - Example: `https://jsonplaceholder.typicode.com/posts`

2. **Select HTTP Method**: Choose from GET, POST, PUT, DELETE, etc.

3. **Configure Headers** (if needed):
   - Click the "Headers" tab
   - Add headers like `Content-Type: application/json`
   - Use the checkbox to enable/disable headers

4. **Add Request Body** (for POST/PUT/PATCH):
   - Click the "Body" tab
   - Select body type (JSON, Form Data, Raw, or None)
   - Enter your request data in the code editor

5. **Send Request**: Click the "Send" button

6. **View Response**: 
   - See the response in the right panel
   - Check status code, response time, and size
   - View response headers in the Headers tab

### Managing Requests

#### History
- All requests are automatically saved to history
- Click on any history item to reload the request
- Search through your history using the search bar

#### Collections
- Save frequently used requests to collections
- Click "Save Current Request" in the Collections tab
- Give your request a descriptive name
- Click on saved requests to load them instantly

#### Sidebar Navigation
- Toggle sidebar with the menu button in the header
- Switch between History and Collections tabs
- Use search to quickly find specific requests

## 🛠️ Advanced Features

### Headers Management
- Add multiple headers with key-value pairs
- Enable/disable headers with checkboxes
- Common headers are automatically suggested

### Body Types
- **JSON**: Syntax highlighting and validation
- **Form Data**: Key-value pairs for form submissions
- **Raw**: Plain text for custom content types
- **None**: For GET requests and requests without body

### Response Features
- **Pretty/Raw View**: Toggle between formatted and raw response
- **Copy Response**: Copy response data to clipboard
- **Download**: Save response as JSON file
- **Response Headers**: View all response headers

## 🔧 Technical Details

### Built With
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Monaco Editor**: VS Code's editor for code editing
- **Axios**: HTTP client for making requests
- **Lucide React**: Beautiful icons
- **React Hot Toast**: Elegant notifications

### Project Structure
```
src/
├── components/
│   ├── Header.jsx          # Top navigation bar
│   ├── RequestPanel.jsx    # Left panel for request configuration
│   ├── ResponsePanel.jsx   # Right panel for response display
│   └── Sidebar.jsx         # History and collections sidebar
├── App.jsx                 # Main application component
├── main.jsx               # React application entry point
└── index.css              # Global styles and Tailwind imports
```

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files in the `dist` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any web server

### Environment Variables
Create a `.env` file for environment-specific configurations:
```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=Raju's Client
```

## 🤝 Contributing

This is Raju's self-contained API client. To extend functionality:

1. **Add new features** in the components directory
2. **Modify styling** in the Tailwind classes
3. **Add new request types** by extending the methods array
4. **Implement environment variables** in the request configuration

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- --port 3001
```

**Dependencies not installing**:
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS errors**:
- CORS errors are normal when testing APIs from localhost
- Use a CORS proxy or browser extension for development
- Or test with APIs that allow CORS from any origin

### Performance Tips
- The Monaco Editor loads lazily for better performance
- History is limited to 50 requests to prevent memory issues
- All data is stored in localStorage for persistence

## 🌟 Features Coming Soon
- Environment variables management
- Request authentication (Bearer tokens, API keys)
- Import/Export collections
- Request scripting and testing
- Multiple workspaces
- Dark theme

---

**Enjoy testing your APIs!** 🎉 