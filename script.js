function addNote() {

    let title = document.getElementById("title").value;
    let subject = document.getElementById("subject").value;
    let semester = document.getElementById("semester").value;
    let file = document.getElementById("file").files[0];

    if (title == "" || subject == "" || semester == "" || !file) {
        alert("Please fill all fields!");
        return;
    }

    if (file.type !== "application/pdf") {
        alert("Please upload a PDF file!");
        return;
    }

    let pdfURL = URL.createObjectURL(file);

    let notesList = document.getElementById("notesList");

    let note = document.createElement("div");

    note.innerHTML = `
        <h3>${title}</h3>
        <p>Subject: ${subject}</p>
        <p>${semester}</p>
        <a href="${pdfURL}" target="_blank">View PDF</a>
        <hr>
    `;

    notesList.appendChild(note);

    alert("Note uploaded successfully!");

    document.getElementById("title").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("semester").value = "";
    document.getElementById("file").value = "";
}