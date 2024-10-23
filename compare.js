let file1Array = [];
let file2Array = [];

function readExcelFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`Successfully read data from ${file.name}`);
        callback(jsonData);
    };
    reader.readAsArrayBuffer(file);
}

// Event listeners for file input changes
document.getElementById("file1").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        console.log(`File 1 selected: ${file.name}`);
        readExcelFile(file, (data) => {
            file1Array = data;
            document.querySelector('.button-yellow-blue .text').textContent = file.name;
        });
    }
});

document.getElementById("file2").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        console.log(`File 2 selected: ${file.name}`);
        readExcelFile(file, (data) => {
            file2Array = data;
            document.querySelector('.button-blue-yellow .text').textContent = file.name;
        });
    }
});

function compareFiles() {
    const outputElement = document.getElementById("output");
    outputElement.innerHTML = "Comparing files, please wait...";

    console.log("Starting comparison...");
    if (file1Array.length === 0 || file2Array.length === 0) {
        console.log("One or both files have not been loaded.");
        alert("Please upload both files.");
        outputElement.innerHTML = "";
        return;
    }

    console.log("Files have been loaded. Proceeding with comparison.");
    const diff = findDifferences(file1Array, file2Array);
    console.log("Comparison complete.");
    
    if (diff.length === 0) {
        outputElement.innerHTML = "<p>No differences found.</p>";
        console.log("No differences found.");
    } else {
        outputElement.innerHTML = "<p>Differences found:</p><pre>" + JSON.stringify(diff, null, 2) + "</pre>";
        console.log("Differences found:", diff);
    }
}

function findDifferences(array1, array2) {
    const diff = [];
    const maxLength = Math.max(array1.length, array2.length);
    for (let i = 0; i < maxLength; i++) {
        const row1 = array1[i] || [];
        const row2 = array2[i] || [];
        console.log(`Comparing row ${i + 1}:`);
        console.log("File 1:", JSON.stringify(row1));
        console.log("File 2:", JSON.stringify(row2));
        
        if (JSON.stringify(row1) !== JSON.stringify(row2)) {
            console.log(`Difference found in row ${i + 1}`);
            diff.push({ row: i + 1, file1: row1, file2: row2 });
        } else {
            console.log(`No difference in row ${i + 1}`);
        }
    }
    return diff;
}
