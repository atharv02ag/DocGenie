import fs from 'fs';
import {join, resolve} from 'path';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// "models/embedding-001" was retired by Google; gemini-embedding-001 is its replacement.
// NOTE: indexes built with the old model are not compatible and must be regenerated.
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GEMINI_API_KEY,
});

const indexPath = resolve("./faiss_data");

// Stores are returned to the caller instead of kept in a shared module-level variable,
// so concurrent requests for different papers can't read each other's store.
async function storeTextInVectorDB(text,id) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);
  const vectorStore = await FaissStore.fromDocuments(docs, embeddings);
  const loadPath = join(indexPath, id);
  await vectorStore.save(loadPath);
  return vectorStore;
}

// number of ~1000-char chunks given to the model per question
const CHUNKS_PER_QUERY = 8;

async function retrieveDocs(vectorStore, query) {
  if (!vectorStore) throw new Error("Vector store is empty");
  return await vectorStore.similaritySearch(query, CHUNKS_PER_QUERY);
}

// returns the loaded store, or null if none exists on disk
async function loadVectorStoreIfExists(id) {
  const loadPath = join(indexPath, id);
  if (fs.existsSync(loadPath)) {
    const vectorStore = await FaissStore.load(loadPath, embeddings);
    console.log("FAISS vector store loaded from disk.");
    return vectorStore;
  } else {
    console.log("No FAISS store found.");
    return null;
  }
}

export {storeTextInVectorDB, retrieveDocs, loadVectorStoreIfExists};
