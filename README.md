# 📄 AI-Powered Document Intelligence Workflow (NotebookLM-Style)

## 🚀 Overview

This project is an AI-driven document intelligence system that automates the process of understanding and interacting with documents. Inspired by NotebookLM, it allows users to upload documents and generate summaries, insights, and interactive outputs like flashcards and quizzes.

The system integrates workflow automation (n8n), AI models (Gemini API), and a modern frontend to deliver a seamless document analysis experience.

---

## 🎯 Problem Statement

Manual document review is time-consuming and inefficient, especially for large PDFs and research materials. Users often struggle to extract key insights quickly.

---

## 💡 Solution

This project automates document processing by:

* Extracting content from uploaded documents
* Generating AI-powered summaries
* Creating structured outputs like reports, flashcards, and quizzes
* Enabling contextual Q&A based on document content

---

## 🧠 Key Features

* 📂 Upload and process documents (PDFs, text, etc.)
* 📝 AI-generated summaries and key insights
* 🎧 Audio overview generation
* 🧠 Flashcards creation for learning
* ❓ Quiz generation based on content
* 📊 Structured report generation
* 💬 Context-aware chatbot (RAG-based)
* 🔄 Automated workflows using n8n
* 🔐 Authentication and data storage using Supabase

---

## 🏗️ Architecture

The system follows an event-driven pipeline:

1. User uploads a document via frontend
2. File is sent to n8n via webhook
3. n8n processes and extracts content
4. Gemini API generates:

   * Summary
   * Key points
   * Q&A
5. JavaScript function nodes clean and structure output
6. Data is stored in Supabase
7. Processed results are displayed in the UI

---

## ⚙️ Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS

### Backend & Automation

* n8n (workflow automation)
* JavaScript (Function Nodes)

### AI / ML

* Gemini API (LLM)

### Database & Auth

* Supabase (PostgreSQL + Auth)

### Deployment

* Docker (self-hosted n8n workflows)

---

## 🔄 Workflow Overview (n8n)

* Webhook trigger → Receive document
* Extract text from file
* Send to Gemini API
* Process response (JSON cleaning via JS)
* Store results in Supabase
* Return structured output to frontend

---

## 📂 Project Structure

```bash
src/
 ├── components/
 ├── notebook/
 ├── ui/
 ├── integrations/
 ├── hooks/
 └── pages/

n8n/
 ├── workflows/
 └── automation scripts
```

---

## 🧪 How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-document-intelligence-workflow.git
cd ai-document-intelligence-workflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 4. Run the app

```bash
npm run dev
```

---

## 🧩 Required Setup

* Supabase project (Auth + Database tables)
* n8n workflow running (locally or via Docker)
* Gemini API key

---

## 📊 Impact

* ⚡ Reduced document processing time by ~80%
* 🤖 Automated manual analysis workflows
* 📚 Improved learning using flashcards & quizzes
* 🔄 Scalable pipeline for large document handling

---

## ⚠️ Notes

* Ensure Supabase tables:

  * `notebooks`
  * `profiles`
* Disable RLS or configure policies properly
* n8n workflows must be active for processing

---

## 🔮 Future Enhancements

* Multi-document comparison
* Vector database integration (RAG improvement)
* Real-time collaboration
* Better UI analytics dashboard

---

