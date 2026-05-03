# Lumina Study AI

Lumina Study AI is an intelligent, React-based web application that leverages the power of Google's Gemini API to act as your personal study assistant. With capabilities for document extraction (PDFs) and rich text interactions, it helps students and professionals interact with their study materials efficiently.

## Features

- **AI-Powered Assistance**: Utilize Google's advanced Gemini API to ask questions, summarize content, and get study help.
- **Document Extraction**: Seamlessly upload and extract text from PDFs using `pdfjs-dist`.
- **Rich Text Rendering**: Responses are parsed and beautifully rendered with `marked`.
- **Modern Tech Stack**: Built with React 19 and Vite for blazing-fast development and optimized production builds.

## Public URL (CodeSandbox)
https://cv2gdj-5173.csb.app/

## Known Bugs
There's a bug affecting pdf text parsing in Safari browser. Please use Google Chrome or other browsers.

## Technologies Used

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Google Gen AI SDK](https://github.com/google/genai-js)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Marked](https://marked.js.org/)

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:sadia10k/lumina-study-ai.git
   cd lumina-study-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root of the project and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## Deployment

### GitHub
The repository is hosted on GitHub: [sadia10k/lumina-study-ai](https://github.com/sadia10k/lumina-study-ai)

