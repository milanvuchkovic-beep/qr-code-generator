document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('date-input').valueAsDate = new Date();

    const generateBtn = document.getElementById('generate-btn');
    const printBtn = document.getElementById('print-btn');
    const labelsContainer = document.getElementById('labels-container');

    function updatePrintStyles(width, height) {
        let styleTag = document.getElementById('print-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'print-styles';
            document.head.appendChild(styleTag);
        }
        const margin = 3;
        const printWidth = width - (margin * 2);
        const printHeight = height - (margin * 2);
        styleTag.innerHTML = `
            @media print {
                @page {
                    size: ${width}mm ${height}mm;
                    margin: ${margin}mm;
                }
                .label-item {
                    box-sizing: border-box;
                    width: ${printWidth}mm;
                    height: ${printHeight - 0.5}mm;
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
        const selectedDate = new Date(dateInput);
        const displayDate = formatDateForDisplay(selectedDate);
        const qrDate = formatDateForQR(selectedDate);
        const endSerial = startSerial + quantity - 1;

        for (let i = startSerial; i <= endSerial; i++) {
            const currentSerial = padSerialNumber(i);
            const qrData = partNumber + supplierCode + currentSerial + qrDate;
            const labelItem = document.createElement('div');
            labelItem.className = 'label-item';
            const thresholdWidth = 50;
            
            const printableHeightMM = labelHeight - 6;
            const printableWidthMM = labelWidth - 6;
            let baseDimensionMM = Math.min(printableWidthMM, printableHeightMM);
            
            if (labelWidth < thresholdWidth) {
                 baseDimensionMM = printableHeightMM * 0.8;
            } else {
                 baseDimensionMM = printableHeightMM * 0.9;
            }
            
            const qrCodeSizePX = Math.round(baseDimensionMM * 3.78);

            if (labelWidth < thresholdWidth) {
                labelItem.classList.add('small-layout');
                labelItem.innerHTML = `
                    <div class="qr-code-area" id="qr-code-${i}"></div>
                    <div class="small-layout-text">${qrData}</div>
                `;
            } else {
                labelItem.innerHTML = `
                    <div class="qr-code-area" id="qr-code-${i}"></div>
                    <div class="data-fields-qr">
                        <div><strong>Dis. FCA:</strong> ${partNumber}</div>
                        <div><strong>Supplier:</strong> ${supplierCode}</div>
                        <div><strong>S/N:</strong> ${currentSerial}</div>
                        <div><strong>Data:</strong> ${displayDate}</div> 
                    </div>
                `;
            }
            
            labelsContainer.appendChild(labelItem);

            new QRCode(document.getElementById(`qr-code-${i}`), {
                text: qrData,
                width: qrCodeSizePX,
                height: qrCodeSizePX,
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        
        if (quantity > 0) {
            printBtn.style.display = 'block';
        }
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });
});
