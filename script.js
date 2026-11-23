// ==================================
// NORMAL NOTES UPLOAD
// ==================================

let uploadedPDFs = [];

function addNote(event) {

    event.preventDefault();

    let title = document.getElementById("title").value.trim();
    let subject = document.getElementById("subject").value.trim();
    let semester = document.getElementById("semester").value;
    let file = document.getElementById("file").files[0];

    if (!title || !subject || !semester || !file) {
        alert("Please fill all fields!");
        return;
    }

    if (file.type !== "application/pdf") {
        alert("Please upload a PDF file!");
        return;
    }

    let pdfURL = URL.createObjectURL(file);

    uploadedPDFs.push(pdfURL);

    let notesList = document.getElementById("notesList");

    let emptyMessage = document.getElementById("emptyMessage");

    if (emptyMessage) {
        emptyMessage.remove();
    }

    let note = document.createElement("div");

    note.className = "note-card";

    let heading = document.createElement("h3");
    heading.textContent = title;

    let subjectText = document.createElement("p");
    subjectText.textContent = "Subject: " + subject;

    let semesterText = document.createElement("p");
    semesterText.textContent = semester;

    let link = document.createElement("a");
    link.href = pdfURL;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "View PDF";

    note.appendChild(heading);
    note.appendChild(subjectText);
    note.appendChild(semesterText);
    note.appendChild(link);

    notesList.appendChild(note);

    alert("Note uploaded successfully!");

    document.getElementById("uploadForm").reset();
}


// ==================================
// AI PDF SUMMARIZER
// ==================================

async function summarizePDF() {

    let file = document.getElementById("summaryPdf").files[0];

    let result = document.getElementById("summaryResult");

    let button = document.getElementById("summarizeBtn");

    if (!file) {
        alert("Please select a PDF file!");
        return;
    }

    if (file.type !== "application/pdf") {
        alert("Please select a valid PDF!");
        return;
    }

    let formData = new FormData();

    formData.append("pdf", file);

    button.disabled = true;

    result.textContent = "AI is reading your PDF. Please wait...";

    try {

        let response = await fetch("/summarize-pdf", {
            method: "POST",
            body: formData
        });

        let data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        result.textContent = data.summary;

    }

    catch (error) {

        result.textContent = "Error: " + error.message;

    }

    finally {

        button.disabled = false;

    }

}


// ==================================
// BUTTON EVENTS
// ==================================

document.getElementById("uploadForm")
    .addEventListener("submit", addNote);

document.getElementById("summarizeBtn")
    .addEventListener("click", summarizePDF);