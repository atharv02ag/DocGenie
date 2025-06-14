# DocGenie

DocGenie is an intelligent research paper management system that allows users to upload, organize, analyze, and interact with academic research papers. The system leverages AI to provide intelligent insights, evaluations, and answer questions related to the uploaded papers.

---

## Demo

[Watch the demo](https://www.youtube.com/watch?v=UqC96p1uJJg)

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

* PDFs are parsed and chunked into text segments using **LangChain**'s document loaders and text splitters.
* These chunks are embedded using **Google Gemini's** embedder, into vector representations.
* The embeddings are stored locally.
* When the user inputs a question, **FAISS** retrieves the most relevent chunks based on semantic similarity.
* A prompt is generated combining these chunks with the question, and sent to **Google Gemini**.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- npm or yarn
- A Google Cloud project with:
  - GenAI (Gemini) API enabled
  - OAuth2 credentials
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

```
For frontend, create a `.env` file inside `./frontend`
Set the following variables:

``` dotenv
VITE_GOOGLE_CLIENT_ID=
VITE_SERVER_PATH = http://localhost:8000
```

---

## Obtaining API Keys and Secrets

### 1. Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account.
2. In the dashboard, navigate to **Settings** → **Upload**.
3. Copy your **Cloud name**, **API Key**, and **API Secret**, and paste them into your `.env` file.

### 2. Google OAuth2

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Under **APIs & Services**, click **OAuth consent screen**, configure your app, and publish.
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**.
5. Choose **Web application**, enter your authorized redirect URIs (e.g., `http://localhost:8000/auth/google/callback`), then copy the **Client ID** and **Client Secret**.

### 3. MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up or log in.
2. Create a new free cluster.
3. In **Database Access**, add a user and password.
4. In **Network Access**, whitelist your IP or allow access from anywhere (`0.0.0.0/0`).
5. Click **Clusters** → **Connect** → **Connect your application**, copy the connection string URI, and set `MONGO_URI` in your `.env`.

### 4. Google Gemini (GenAI)

1. In the Google Cloud Console, enable the **Vertex AI** API.
2. Under **APIs & Services** → **Credentials**, create an **API key**.
3. Optionally restrict by IP or referer.
4. Copy the key and set `GEMINI_API_KEY`.

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

The server will spin up on `http://localhost:8000` by default.

To load the react app,

```bash
cd ./frontend
npm run dev
```

The app's home page will be available on `http://localhost:5173/` by default

---

