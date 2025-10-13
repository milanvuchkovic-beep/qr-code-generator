document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('date-input').valueAsDate = new Date();

    const generateBtn = document.getElementById('generate-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const labelsContainer = document.getElementById('labels-container');
    
    let generatedDataForCsv = [];

    function updatePrintStyles(width, height) {
        let styleTag = document.getElementById('print-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'print-styles';
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `
            @media print {
                @page {
                    size: ${width}mm ${height}mm landscape;
                    margin: 0;
                }
            }
        `;
    }

    function formatDateForDisplay(date) {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear().toString().slice(-2);
        return `${d}/${m}/${y}`;
    }

    function formatDateForQR(date) {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear().toString().slice(-2);
        return `${d}${m}${y}`;
    }

    function padSerialNumber(num) {
        return num.toString().padStart(5, '0');
    }

    generateBtn.addEventListener('click', () => {
        const partNumber = document.getElementById('part-number').value.toUpperCase();
        const supplierCode = document.getElementById('supplier-code').value.toUpperCase();
        const dateInput = document.getElementById('date-input').value;
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        const startSerial = parseInt(document.getElementById('start-serial').value, 10);
        const labelWidth = parseFloat(document.getElementById('label-width').value);
        const labelHeight = parseFloat(document.getElementById('label-height').value);

        if (!partNumber || !supplierCode || !dateInput || !quantity || !startSerial || !labelWidth || !labelHeight) {
            alert("Molimo vas, popunite sva obavezna polja.");
            return;
        }

        updatePrintStyles(labelWidth, labelHeight);
        labelsContainer.innerHTML = '';
        generatedDataForCsv = [];
        const selectedDate = new Date(dateInput);
        const displayDate = formatDateForDisplay(selectedDate);
        const qrDate = formatDateForQR(selectedDate);
        const endSerial = startSerial + quantity - 1;

        for (let i = startSerial; i <= endSerial; i++) {
            const currentSerial = padSerialNumber(i);
            const qrData = partNumber + supplierCode + currentSerial + qrDate;

            generatedDataForCsv.push({partNumber, supplierCode, serialNumber: currentSerial, displayDate, qrData});

            const labelItem = document.createElement('div');
            labelItem.className = 'label-item';
            const thresholdWidth = 50;

            const printableHeightMM = labelHeight - 4; // 4mm = 2 * 2mm padding
            const printableWidthMM = labelWidth - 4;
            const baseDimensionMM = Math.min(printableWidthMM, printableHeightMM) * 0.9; // 90% manje dimenzije
            const matrixSizePX = Math.round(baseDimensionMM * 3.78);

            if (labelWidth < thresholdWidth) {
                labelItem.classList.add('small-layout');
                labelItem.innerHTML = `<canvas class="barcode-canvas" id="barcode-${i}"></canvas><div class="small-layout-text">${qrData}</div>`;
            } else {
                labelItem.innerHTML = `
                    <div class="qr-code-area"><canvas class="barcode-canvas" id="barcode-${i}"></canvas></div>
                    <div class="data-fields-qr">
                        <div><strong>Dis. FCA:</strong> ${partNumber}</div>
                        <div><strong>Supplier:</strong> ${supplierCode}</div>
                        <div><strong>S/N:</strong> ${currentSerial}</div>
                        <div><strong>Data:</strong> ${displayDate}</div> 
                    </div>
                `;
            }
            
            labelsContainer.appendChild(labelItem);

            try {
                let canvas = document.getElementById(`barcode-${i}`);
                bwipjs.toCanvas(canvas, {
                    bcid: 'datamatrix',
                    text: qrData,
                    height: matrixSizePX,
                    width: matrixSizePX,
                    includetext: false,
                });
            } catch (e) {
                console.error(e);
            }
        }
        
        if (quantity > 0) {
            exportCsvBtn.style.display = 'block';
        }
    });

    exportCsvBtn.addEventListener('click', () => {
        if (generatedDataForCsv.length === 0) { return; }
        const headers = '"PartNumber","SupplierCode","SerialNumber","DisplayDate","QRData"';
        const rows = generatedDataForCsv.map(d => `"${d.partNumber}","${d.supplierCode}","${d.serialNumber}","${d.displayDate}","${d.qrData}"`);
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "nalepnice_za_stampu.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
