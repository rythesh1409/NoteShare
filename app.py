from flask import Flask, send_from_directory, request, jsonify
from google import genai
from dotenv import load_dotenv
from pypdf import PdfReader
from io import BytesIO
import os

# Load environment variables
load_dotenv(override=True)

app = Flask(__name__)

app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

# Gemini API setup
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key) if api_key else None


# HOME PAGE
@app.route("/")
def home():
    return send_from_directory(app.root_path, "index.html")


# CSS
@app.route("/style.css")
def css():
    return send_from_directory(app.root_path, "style.css")


# JAVASCRIPT
@app.route("/script.js")
def javascript():
    return send_from_directory(app.root_path, "script.js")


# AI PDF SUMMARIZER
@app.route("/summarize-pdf", methods=["POST"])
def summarize_pdf():

    print("\nPDF SUMMARIZER STARTED", flush=True)

    if client is None:
        return jsonify({
            "error": "Gemini API key is missing. Check your .env file."
        }), 500

    if "pdf" not in request.files:
        return jsonify({"error": "Please select a PDF."}), 400

    file = request.files["pdf"]

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Please upload a PDF."}), 400

    try:

        # Read PDF
        print("Reading PDF...", flush=True)

        pdf = PdfReader(BytesIO(file.read()))

        if pdf.is_encrypted:
            return jsonify({
                "error": "Password-protected PDFs are not supported."
            }), 400

        if len(pdf.pages) > 100:
            return jsonify({
                "error": "PDF must contain 100 pages or fewer."
            }), 400

        # Extract text
        print("Extracting PDF text...", flush=True)

        text = ""

        for page in pdf.pages:
            text += page.extract_text() or ""

        if not text.strip():
            return jsonify({
                "error": "No readable text found in this PDF."
            }), 400

        if len(text) > 100000:
            return jsonify({
                "error": "PDF contains too much text. Try a smaller PDF."
            }), 400

        print("PDF extraction completed!", flush=True)

        # Prepare prompt
        prompt = f"""
        You are an educational assistant.

        Summarize these academic notes for a college student.

        Instructions:
        1. Use simple English.
        2. Explain difficult concepts clearly.
        3. Include important definitions.
        4. Use headings and bullet points.
        5. Include important exam revision points.
        6. Avoid unrelated information.

        PDF CONTENT:

        {text}
        """

        # Send request using Interactions API
        print("Connecting to Gemini 3.8 Flash...", flush=True)

        interaction = client.interactions.create(
            model="gemini-3.8-flash",
            input=prompt
        )

        print("Gemini response received!", flush=True)

        summary = interaction.output_text

        if not summary:
            return jsonify({
                "error": "Gemini did not generate a summary."
            }), 500

        print("SUMMARY GENERATED SUCCESSFULLY!", flush=True)

        return jsonify({
            "summary": summary
        })

    except Exception as e:

        app.logger.exception("PDF summarization failed")

        return jsonify({
            "error": str(e)
        }), 500


# FILE SIZE ERROR
@app.errorhandler(413)
def file_too_large(error):

    return jsonify({
        "error": "PDF is too large. Maximum size is 10 MB."
    }), 413


# RUN APPLICATION
if __name__ == "__main__":
    app.run(debug=True)