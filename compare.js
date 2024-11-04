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
    if (file1Rows.length === 0 || file2Rows.length === 0) {
        alert("Please upload both files.");
        return;
    }

    const changes = findChangedRows(file1Rows, file2Rows);
    saveToExcel(changes); }

function findChangedRows(oldData, newData) {
    const changedRows = [];
    
    const maxLength = Math.max(oldData.length, newData.length);
    for (let i = 0; i < maxLength; i++) {
        const oldRow = oldData[i] || [];
        const newRow = newData[i] || [];

        const hasChanged = oldRow.some((cell, index) => cell !== newRow[index]);
        
        if (hasChanged) {
            changedRows.push(newRow);
        }
    }

    return changedRows;
}

function formatDate(excelDate) {
    if (typeof excelDate === 'number' && excelDate > 0) {
        const date = new Date((excelDate - 25569 + 1) * 86400 * 1000); 
        return (
            String(date.getMonth() + 1).padStart(2, '0') + '/' +
            String(date.getDate()).padStart(2, '0') + '/' +
            date.getFullYear()
        );
    }
    return excelDate;
}

function saveToExcel(changedRows) {
    const workbook = XLSX.utils.book_new();

    const columnHeaders = [
        "Effective Start Date",
        "Person Number",
        "Action Code",
        "Start Date",
        "Name Type",
        "Last Name",
        "First Name",
        "Legislation Code",
        "Date From",
        "E-mail Type",
        "E-mail Address",
        "Start Date",
        "Legal Employer",
        "Worker Type",
        "Action Code",
        "Assignment Number",
        "Effective Latest Change",
        "Effective Sequence",
        "Action Code",
        "Assignment Status Type",
        "Business Unit",
        "Default Expense Account",
        "Department",
        "Job Code",
        "Location Code",
        "Type",
        "Supervisor Assignment Number", 
        "New Supervisor Assignment Number"
    ];

    const formattedData = [columnHeaders];
    for (const row of changedRows) {
        const formattedRow = [
            formatDate(row[1]) || "",       // Effective Start Date (Hire Date)
            row[2] || "",                   // Person Number (Dayforce ID)
            row[0] || "",                   // Action Code (Position Status)
            formatDate(row[1]) || "",       // Start Date (same as Effective Start Date)
            "Global",                       // Name Type (static)
            row[4] || "",                   // Last Name (Legal Last Name)
            row[5] || "",                   // First Name (Legal First Name)
            "US",                           // Legislation Code (static)
            formatDate(row[1]) || "",       // Date From (same as Effective Start Date)
            "Work Email",                   // E-mail Type (static)
            row[6] || "",                   // E-mail Address (Work Contact: Work Email)
            formatDate(row[1]) || "",       // Start Date (same as Effective Start Date)
            row[7] || "",                   // Legal Employer (Business Unit Description)
            "Employee",                     // Worker Type (static)
            row[0] || "",                   // Action Code (Position Status)
            row[2] || "",                   // Assignment Number (Dayforce ID)
            "",                             // Effective Latest Change (leave blank)
            "",                             // Effective Sequence (leave blank)
            row[0] || "",                   // Action Code (Position Status)
            "",                             // Assignment Status Type (leave blank)
            "ImageFirst US",                // Business Unit (static)
            "",                             // Default Expense Account (leave blank)
            "",                             // Department (leave blank)
            "",                             // Job Code (leave blank)
            "",                             // Location Code (leave blank)
            "Line Manager",                 // Type (static)
            row[12] || "",                  // Supervisor Assignment Number (Reports to Associate ID)
            ""                              // New Supervisor Assignment Number (leave blank)
        ];

        formattedData.push(formattedRow);
    }

    const formattedSheet = XLSX.utils.aoa_to_sheet(formattedData);

    XLSX.utils.book_append_sheet(workbook, formattedSheet, "Changed Rows");

    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Oracle_Changes_${today}.xlsx`;

    XLSX.writeFile(workbook, fileName);
}
