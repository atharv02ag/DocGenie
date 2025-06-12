import fs from 'fs';
import {join, resolve} from 'path';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "models/embedding-001",
  apiKey: process.env.GEMINI_API_KEY,
});

const indexPath = resolve("./faiss_data");

let vectorStore = null;

async function storeTextInVectorDB(text,id) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);
  vectorStore = await FaissStore.fromDocuments(docs, embeddings);
  const loadPath = join(indexPath, id);
  await vectorStore.save(loadPath);
}

async function retrieveDocs(query) {
  if (!vectorStore) throw new Error("Vector store is empty");
  return await vectorStore.similaritySearch(query, 3);
}

async function loadVectorStoreIfExists(id) {
  const loadPath = join(indexPath, id);
  if (fs.existsSync(loadPath)) {
    vectorStore = await FaissStore.load(loadPath, embeddings);
    console.log("FAISS vector store loaded from disk.");
    return 1;
  } else {
    console.log("No FAISS store found. Upload a PDF first.");
    return 0;
  }
}

export {storeTextInVectorDB, retrieveDocs, loadVectorStoreIfExists};
