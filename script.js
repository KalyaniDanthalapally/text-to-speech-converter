document.getElementById("fileInput").addEventListener("change", handleFileUpload);

async function convertText() {
    const textInput = document.getElementById("textInput");
    const audioContainer = document.getElementById("audioContainer");
    const audioPlayer = document.getElementById("audioPlayer");
    const convertBtn = document.getElementById("convertBtn");
    const loadingSpinner = document.getElementById("loadingSpinner");

    if (!textInput.value.trim()) {
        alert("Please enter text or upload a file!");
        return;
    }

    // Show loading
    loadingSpinner.classList.remove("hidden");
    convertBtn.disabled = true;
    convertBtn.textContent = "Processing...";

    try {
        const response = await fetch('https://49uvi7husg.execute-api.eu-north-1.amazonaws.com/staging/convert', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textInput.value })
        });

        const data = await response.json();
        audioPlayer.src = data.audioUrl;

        // Show audio with fade-in effect
        audioContainer.classList.remove("hidden");
        audioContainer.classList.add("fade-in");

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to generate audio.");
    } finally {
        // Hide loading spinner
        loadingSpinner.classList.add("hidden");
        convertBtn.disabled = false;
        convertBtn.textContent = "Convert to Speech";
    }
}

// Function to handle file upload
function handleFileUpload() {
    const fileInput = document.getElementById("fileInput");
    const textInput = document.getElementById("textInput");

    if (!fileInput.files.length) {
        alert("Please select a file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    if (file.type === "text/plain") {
        reader.onload = function (event) {
            textInput.value = event.target.result;
        };
        reader.readAsText(file);
    } else if (file.type === "application/pdf") {
        readPdf(file);
    } else {
        alert("Only .txt and .pdf files are supported.");
    }
}

// Function to extract text from PDF
async function readPdf(file) {
    const textInput = document.getElementById("textInput");
    
    const reader = new FileReader();
    reader.onload = async function () {
        const pdfData = new Uint8Array(reader.result);

        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map(item => item.str).join(" ") + "\n";
        }

        textInput.value = extractedText;
    };
    
    reader.readAsArrayBuffer(file);
}

