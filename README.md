# DocGenie

DocGenie is an intelligent research paper management system that allows users to upload, organize, analyze, and interact with academic research papers. The system leverages AI to provide intelligent insights, evaluations, and answer questions related to the uploaded papers.

---

## Technologies used

- Node and Express for backend logic and managing API routes
- MongoDB for database
- Cloudinary for cloud storage
- Google Gemini as LLM
- Langchain, FAISS for handling the RAG based chatbot
- Google OAuth2 for user authentication
- React for frontend 
- CSS and tailwind CSS for styling UI elements

---

## Key Features

- Upload PDF's for every user to see
- Search and organize papers by metadata in the paper library
- View and download papers uploaded by others
- Generate paper summaries and obtain insights
- Interact and ask questions about any paper
- Sign in and Sign out with Google

---

## Architecture overview

### 1. User Authentication

* Users sign in using **Google OAuth2**.
* A **JWT** is generated server-side on successful login and sent to the client for session management.
* Routes are protected using middleware that verifies the JWT.
* User profile details are fetched from **MongoDB**

### 2. File Management

* Users upload PDF's which are handled by **multer** and uploaded to **Cloudinary**.
* Metadata (title, author, URL, etc.) is saved to **MongoDB**.

### 3. Question Answering using RAG

* PDFs are parsed with **pdf-parse** and split into text chunks using **LangChain**'s text splitter.
* These chunks are embedded using **Google Gemini's** embedding model (`gemini-embedding-001`) into vector representations.
* The embeddings are stored locally in a **FAISS** index per paper (`backend/faiss_data/<paper id>`).
* When the user inputs a question, **FAISS** retrieves the most relevant chunks based on semantic similarity.
* A prompt is generated combining these chunks with the question, and sent to **Google Gemini**.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or later)
- npm or yarn
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- A Google Cloud project with OAuth2 credentials
- A MongoDB Atlas cluster (free tier works fine)
- A Cloudinary account

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/atharv02ag/DocGenie.git
   cd DocGenie
   ```

2. Install dependencies:

   ```bash
   cd ./frontend
   npm install
   cd ..
   cd ./backend
   npm install
   ```

---

## Configuration

For backend, create a `.env` file inside `./backend` 

Set the following variables:

```dotenv
# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google OAuth2
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# MongoDB
MONGO_URI=

# Google Gemini (GenAI)
GEMINI_API_KEY=

# JWT
JWT_SECRET_KEY=

# Optional: override the Gemini models used for summaries and chat
# GEMINI_MODEL=gemini-flash-latest
# GEMINI_FALLBACK_MODEL=gemini-flash-lite-latest
```
For frontend, create a `.env` file inside `./frontend`
Set the following variables:

```dotenv
VITE_GOOGLE_CLIENT_ID=        # same value as GOOGLE_CLIENT_ID in the backend
VITE_SERVER_PATH=http://localhost:8000
```

---

## Obtaining API Keys and Secrets

### 1. Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account.
2. In the console, go to **Settings** → **API Keys**.
3. Copy your **Cloud name**, **API Key**, and **API Secret**, and paste them into your `.env` file.
4. The free plan rejects files over 10 MB, so the upload form limits PDFs to that size.

### 2. Google OAuth2

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Under **APIs & Services**, click **OAuth consent screen** and configure your app. While it is in testing mode, add the Google accounts that should be able to sign in as **test users** (or publish the app).
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**.
5. Choose **Web application** and add `http://localhost:5173` under **Authorized JavaScript origins**. No redirect URI is needed: sign-in happens in a popup and the frontend sends the authorization code to the backend.
6. Copy the **Client ID** and **Client Secret** into the backend `.env`, and the same Client ID into the frontend `.env`.

### 3. MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up or log in.
2. Create a new free cluster.
3. In **Database Access**, add a user and password.
4. In **Network Access**, whitelist your IP or allow access from anywhere (`0.0.0.0/0`).
5. Click **Clusters** → **Connect** → **Drivers**, copy the connection string URI (fill in your password), and set `MONGO_URI` in your `.env`.

### 4. Google Gemini (GenAI)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and sign in.
2. Click **Create API key** (it creates or uses a Google Cloud project for you).
3. Copy the key and set `GEMINI_API_KEY`. The same key is used for both the chat/summary model and the embeddings.

### 5. Generating a JWT Secret

You need a secure, randomly generated secret for signing JWTs. You can generate one using Node or OpenSSL:

- **OpenSSL**:
  ```bash
  openssl rand -base64 32
  ```
- **Node REPL**:
  ```js
  require('crypto').randomBytes(32).toString('hex');
  ```

Copy the output into `JWT_SECRET_KEY` in your `.env`.

---

## Running the App

To start the server,

```bash
cd ./backend
node server.js
```

The server will spin up on `http://localhost:8000` by default. Start it from inside `./backend`, since it reads `.env` and `faiss_data/` relative to the current folder. For auto-reload during development, use `npx nodemon server.js` instead.

> **Upgrading from an older version?** Delete the folders inside `backend/faiss_data/`. They were built with the retired `embedding-001` model and won't work with the current one. They are rebuilt automatically the next time a paper is opened.

To load the react app,

```bash
cd ./frontend
npm run dev
```

The app's home page will be available on `http://localhost:5173/` by default

---

