# B2B RFP Automation — Asian Paints Challenge IV

An agentic AI system that automates the B2B RFP response workflow using CrewAI and Gemini.

## What it does
- Reads an RFP document (PDF or TXT)
- Extracts technical specifications using NLP
- Matches requirements to product catalog using cosine similarity
- Calculates pricing including GST and testing costs
- Generates a complete professional proposal using AI agents

## Tech Stack
- Python 3.10
- CrewAI (multi-agent orchestration)
- Google Gemini (LLM)
- Sentence Transformers (semantic matching)
- pdfplumber (PDF parsing)

## Setup
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
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
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### Frontend (React + Vite + TypeScript)
```bash
cd frontend
npm install
npm run dev
```

The frontend expects API base URL `http://127.0.0.1:8000`.

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