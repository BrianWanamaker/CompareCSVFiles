let file1Rows = [];
let file2Rows = [];

function readExcelFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        callback(jsonData);
    };
    reader.readAsArrayBuffer(file);
}

document.getElementById("file1").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        readExcelFile(file, (data) => {
            file1Rows = data;
            document.querySelector('.button-yellow-blue .text').textContent = file.name;
        });
    }
});

document.getElementById("file2").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        readExcelFile(file, (data) => {
            file2Rows = data;
            document.querySelector('.button-blue-yellow .text').textContent = file.name;
        });
    }
});

function compareFiles() {
    const outputElement = document.getElementById("output");
    outputElement.innerHTML = "Comparing files, please wait...";

    if (file1Rows.length === 0 || file2Rows.length === 0) {
        alert("Please upload both files.");
        outputElement.innerHTML = "";
        return;
    }

    const { removedRows, addedRows } = findRowDifferences(file1Rows, file2Rows);

    displayComparisonResults(removedRows, addedRows, outputElement);
}

function findRowDifferences(array1, array2) {
    const set1 = new Set(array1.map(row => JSON.stringify(row)));
    const set2 = new Set(array2.map(row => JSON.stringify(row)));

    const removedRows = [];
    for (const row of set1) {
        if (!set2.has(row)) {
            removedRows.push(JSON.parse(row));
        }
    }

    const addedRows = [];
    for (const row of set2) {
        if (!set1.has(row)) {
            addedRows.push(JSON.parse(row));
        }
    }

    return { removedRows, addedRows };
}

function displayComparisonResults(removedRows, addedRows, outputElement) {
    let outputHTML = "<h3>Comparison Results</h3>";

    if (removedRows.length === 0 && addedRows.length === 0) {
        outputHTML += "<p>No differences found.</p>";
        console.log("No differences found.");
    } else {
        if (removedRows.length > 0) {
            outputHTML += "<h4>Rows in File 1 but not in File 2 (Removed or Changed):</h4>";
            outputHTML += generateTableHTML(removedRows);
        }
        if (addedRows.length > 0) {
            outputHTML += "<h4>Rows in File 2 but not in File 1 (Added or Changed):</h4>";
            outputHTML += generateTableHTML(addedRows);
        }
    }

    outputElement.innerHTML = outputHTML;
}

function generateTableHTML(rows) {
    if (rows.length === 0) {
        return "<p>No data available.</p>";
    }

    const columnNames = [
        "Position Status",
        "Hire Date",
        "Associate ID",
        "Legal Last Name",
        "Legal First Name",
        "Work Contact: Work Email",
        "Business Unit Description",
        "Location Description",
        "Job Title Description",
        "Job Title Code"
    ];

    let tableHTML = "<table border='1' cellpadding='5' cellspacing='0'><thead><tr>";
    tableHTML += columnNames.map(header => `<th>${header}</th>`).join("");
    tableHTML += "</tr></thead><tbody>";

    rows.forEach(row => {
        tableHTML += "<tr>";
        tableHTML += row.map(cell => `<td>${formatCell(cell)}</td>`).join("");
        tableHTML += "</tr>";
    });

    tableHTML += "</tbody></table>";
    return tableHTML;
}

function formatCell(cell) {
    if (typeof cell === "number" && cell > 40000 && cell < 50000) {
        const date = new Date((cell - 25568) * 86400 * 1000);
        return date.toLocaleDateString();
    }
    return cell !== undefined ? cell : "";
}