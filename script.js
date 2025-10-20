document.addEventListener('DOMContentLoaded', () => {

    const bulkInput = document.getElementById('bulk-input');
    const excelUpload = document.getElementById('excel-upload');
    const fileNameSpan = document.getElementById('file-name');
    const generateBtn = document.getElementById('generate-bulk-btn');
    const qrcodeContainer = document.getElementById('qrcode-container');
    const outputHeader = document.getElementById('output-header');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    let uploadedFile = null;

    excelUpload.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            uploadedFile = event.target.files[0];
            fileNameSpan.textContent = uploadedFile.name;
            bulkInput.value = '';
        }
    });

    generateBtn.addEventListener('click', async () => {
        let data = [];
        
        if (uploadedFile) {
            try {
                data = await parseExcelFile(uploadedFile);
            } catch (error) {
                alert("Došlo je do greške pri čitanju Excel fajla.");
                console.error(error);
                return;
            }
        } else {
            data = parseTextarea();
        }

        if (data.length === 0) {
            alert("Nema podataka za generisanje. Molimo unesite podatke u polje ili otpremite fajl.");
            return;
        }

        generateQRCodes(data);
    });

    function parseTextarea() {
        return bulkInput.value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== "");
    }

    function parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    const result = json
                        .map(row => row[0])
                        .filter(item => item !== null && item !== undefined && item.toString().trim() !== "");
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    function generateQRCodes(data) {
        qrcodeContainer.innerHTML = '';

        data.forEach(itemText => {
            const text = itemText.toString();
            const qrItem = document.createElement('div');
            qrItem.className = 'qr-item';
            const qrCodeDiv = document.createElement('div');
            const label = document.createElement('p');
            label.className = 'qr-label';
            label.textContent = text;
            qrItem.appendChild(qrCodeDiv);
            qrItem.appendChild(label);
            qrcodeContainer.appendChild(qrItem);
            new QRCode(qrCodeDiv, {
                text: text,
                width: 160,
                height: 160,
                correctLevel: QRCode.CorrectLevel.H
            });
        });

        outputHeader.style.display = data.length > 0 ? 'flex' : 'none';
    }

    downloadZipBtn.addEventListener('click', () => {
        const zip = new JSZip();
        const qrItems = document.querySelectorAll('.qr-item');
        
        if (qrItems.length === 0) {
            alert("Nema kodova za preuzimanje.");
            return;
        }

        qrItems.forEach((item, index) => {
            const canvas = item.querySelector('canvas');
            const img = item.querySelector('img');
            const label = item.querySelector('.qr-label').textContent;
            const fileName = label.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
            
            if (canvas) {
                const imageData = canvas.toDataURL('image/png').split(',')[1];
                zip.file(fileName, imageData, { base64: true });
            } else if (img) {
                const imageData = img.src.split(',')[1];
                zip.file(fileName, imageData, { base64: true });
            }
        });

        zip.generateAsync({ type: 'blob' }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'qr_kodovi.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

    clearBtn.addEventListener('click', () => {
        bulkInput.value = '';
        qrcodeContainer.innerHTML = '';
        outputHeader.style.display = 'none';
        excelUpload.value = null;
        uploadedFile = null;
        fileNameSpan.textContent = 'Nijedan fajl nije izabran';
    });
});
