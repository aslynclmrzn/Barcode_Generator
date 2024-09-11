document.getElementById('generateBtn').addEventListener('click', generateBarcodes);
document.getElementById('downloadBtn').addEventListener('click', downloadPDF);

function generateBarcodes() {
    const productName = document.getElementById('productName').value;
    const numOfBarcodes = parseInt(document.getElementById('numOfBarcodes').value, 10);
    const barcodeContainer = document.getElementById('barcodeContainer');

    // Clear previous barcodes
    barcodeContainer.innerHTML = '';

    if (!productName || numOfBarcodes <= 0) {
        alert('Please enter a product name and a valid number of barcodes.');
        return;
    }

    // Base number for barcode generation (could use timestamp, random number, or predefined base)
    let baseNumber = Date.now().toString().slice(-12); // Take the last 12 digits of the current timestamp

    // Generate barcodes
    for (let i = 0; i < numOfBarcodes; i++) {
        const barcodeDiv = document.createElement('div');
        barcodeDiv.classList.add('barcode-item');

        // Create a heading for product name
        const productHeading = document.createElement('h2');
        productHeading.innerText = productName;
        barcodeDiv.appendChild(productHeading);

        // Create a unique barcode number by combining the base number with the loop index
        const barcodeNumber = (parseInt(baseNumber) + i).toString().padStart(12, '0');  // Ensure it's 12 digits for EAN13

        // Create a canvas for the barcode with standardized dimensions
        const barcodeCanvas = document.createElement('canvas');
        JsBarcode(barcodeCanvas, barcodeNumber, { format: 'EAN13', width: 2, height: 50 });  // Adjust height and width
        barcodeDiv.appendChild(barcodeCanvas);

        // Create a serial number label
        const serialNumber = document.createElement('p');
        serialNumber.innerText = `${i + 1} of ${numOfBarcodes}`;
        barcodeDiv.appendChild(serialNumber);

        barcodeContainer.appendChild(barcodeDiv);
    }
}

function downloadPDF() {
    const productName = document.getElementById('productName').value;
    const numOfBarcodes = parseInt(document.getElementById('numOfBarcodes').value, 10);
    const barcodeContainer = document.getElementById('barcodeContainer');

    if (!productName || numOfBarcodes <= 0) {
        alert('Please enter a product name and generate barcodes before downloading.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    // Add each barcode to the PDF
    const barcodeItems = barcodeContainer.getElementsByClassName('barcode-item');
    
    const barcodeWidth = 38;  // Barcode width in mm (1.5 inches)
    const barcodeHeight = 25;  // Barcode height in mm (1 inch)
    const spacing = 20;  // Vertical spacing between barcodes

    let yOffset = 10; // Start position (10 mm from the top)
    
    for (let i = 0; i < barcodeItems.length; i++) {
        const item = barcodeItems[i];

        // Get the product name, barcode, and serial number
        const productName = item.getElementsByTagName('h2')[0].innerText;
        const barcodeCanvas = item.getElementsByTagName('canvas')[0];
        const serialNumber = item.getElementsByTagName('p')[0].innerText;

        // Add the product name to the PDF
        pdf.setFontSize(14);
        pdf.text(productName, 10, yOffset);

        // Add the barcode image to the PDF (adjusting for size and placement)
        const imgData = barcodeCanvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, yOffset + 5, barcodeWidth, barcodeHeight);  // Adjusting for standard size

        // Add the serial number below the barcode
        pdf.setFontSize(10);
        pdf.text(serialNumber, 10, yOffset + barcodeHeight + 12);

        // Update yOffset for next barcode (add spacing)
        yOffset += barcodeHeight + spacing;

        // If the yOffset goes beyond the page height, add a new page
        if (yOffset > 280) { // Page height for A4 in mm
            pdf.addPage();
            yOffset = 10; // Reset yOffset for the new page
        }
    }

    // Save the PDF
    pdf.save(`${productName}-barcodes.pdf`);
}
