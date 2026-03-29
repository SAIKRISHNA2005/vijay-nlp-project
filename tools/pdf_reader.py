import pdfplumber
import os

def read_document(file_path: str) -> str:
    """
    Read a PDF or TXT file and return its full text.
    
    Why do we need this?
    Agents can't directly open files. This function does it for them
    and returns a plain string they can work with.
    """
    
    # Check the file actually exists first
    if not os.path.exists(file_path):
        return f"ERROR: File not found at {file_path}"
    
    # Get the file extension (.pdf or .txt)
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".txt":
        # TXT files: just open and read directly
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    
    elif ext == ".pdf":
        # PDF files: use pdfplumber to extract text page by page
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Page {page_num + 1} ---\n"
                        text += page_text
            return text
        except Exception as e:
            return f"ERROR reading PDF: {str(e)}"
    
    else:
        return f"ERROR: Unsupported file type '{ext}'"