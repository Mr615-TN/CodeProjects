import requests
import pdfplumber
import newspaper
import sys
import os
from urllib.parse import urlparse
from pathlib import Path


def download_pdf(url, filename):
    """Downloads a PDF and saves it locally."""
    response = requests.get(url)
    if response.status_code == 200:
        with open(filename, "wb") as f:
            f.write(response.content)
        return filename
    else:
        print("Failed to download the PDF.")
        sys.exit(1)


def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_text_from_web(url):
    """Extracts text from a web article using newspaper3k."""
    article = newspaper.Article(url)
    article.download()
    article.parse()
    return article.text.strip(), article.title.strip()


def save_text_to_file(title, text):
    """Saves extracted text to a file with a sanitized filename."""
    filename = Path(title).stem.replace(" ", "_").replace("/", "_") + ".txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Article saved as {filename}")


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 PythonNewspaper.py <url>")
        sys.exit(1)

    url = sys.argv[1]
    parsed_url = urlparse(url)

    if parsed_url.path.endswith(".pdf"):
        print("Detected a PDF file. Processing...")
        pdf_filename = download_pdf(url, "downloaded.pdf")
        text = extract_text_from_pdf(pdf_filename)
        save_text_to_file("Extracted_PDF_Text", text)
        os.remove(pdf_filename)  # Clean up the downloaded PDF file
    else:
        print("Detected a web article. Processing...")
        try:
            text, title = extract_text_from_web(url)
            if not text:
                print("Failed to extract text from the web article.")
                sys.exit(1)
            save_text_to_file(title, text)
        except Exception as e:
            print(f"Error extracting web article: {e}")
            sys.exit(1)


if __name__ == "__main__":
    main()
