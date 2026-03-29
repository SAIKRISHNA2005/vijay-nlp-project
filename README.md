# B2B RFP Automation — Asian Paints Challenge IV

An agentic AI system that automates the B2B RFP response workflow using CrewAI and Gemini.

## What it does
- Reads an RFP document (PDF or TXT)
- Extracts technical specifications using NLP
- Matches requirements to product catalog using cosine similarity
- Calculates pricing including GST and testing costs
- Generates a complete professional proposal using AI agents

## Tech Stack
- Python 3.13
- CrewAI (multi-agent orchestration)
- Google Gemini (LLM)
- Sentence Transformers (semantic matching)
- pdfplumber (PDF parsing)
- FastAPI (API wrapper)
- React + Vite + TypeScript (frontend)

## Setup
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd frontend
npm install
```

Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
```

## Run
```bash
python main.py
```

## Full-stack app

### Backend (FastAPI wrapper)
```bash
uvicorn backend.app.main:app --port 8002
```

### Frontend (React + Vite + TypeScript)
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5175
```

The frontend uses API base URL:
`http://127.0.0.1:8002`

If `5175` is already used, Vite automatically picks the next port (for example `5176`).

## Full Run Checklist
1. Start backend:
   - `uvicorn backend.app.main:app --port 8002`
2. Start frontend:
   - `cd frontend`
   - `npm run dev -- --host 127.0.0.1 --port 5175`
3. Open frontend URL shown in terminal (usually `http://127.0.0.1:5175` or `http://127.0.0.1:5176`).
4. Go to **Upload RFP** and use either:
   - Upload PDF/TXT file, or
   - Paste RFP content
5. Submit, then track progress in **Processing**, and view outputs in **Results** and **Proposal**.

## Project Structure
```
rfp_automation/
├── main.py                  # Entry point
├── crew/rfp_crew.py         # CrewAI agents and tasks
├── tools/
│   ├── pdf_reader.py        # PDF/TXT reading
│   ├── spec_extractor.py    # NLP spec extraction
│   ├── sku_matcher.py       # Cosine similarity matching
│   └── pricing_calculator.py # Cost calculation
└── data/
    ├── products/            # Product catalog
    ├── pricing/             # Price tables
    └── rfp_samples/         # Sample RFP files
```