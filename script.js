document.addEventListener('DOMContentLoaded', () => {

    const bulkInput = document.getElementById('bulk-input');
    const excelUpload = document.getElementById('excel-upload');
    const fileNameSpan = document.getElementById('file-name');
    const generateBtn = document.getElementById('generate-bulk-btn');
    const qrcodeContainer = document.getElementById('qrcode-container');
    const outputHeader = document.getElementById('output-header');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    
    let uploadedFile = null;

    // Prikazuje ime otpremljenog fajla
    excelUpload.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            uploadedFile = event.target.files[0];
            fileNameSpan.textContent = uploadedFile.name;
            bulkInput.value = ''; // Očisti textarea ako je fajl izabran
        }
    });

    // Glavna funkcija koja se poziva na klik
    generateBtn.addEventListener('click', async () => {
        let data = [];
        
        if (uploadedFile) {
            data = await parseExcelFile(uploadedFile);
        } else {
            data = parseTextarea();
        }

        if (data.length === 0) {
            alert("Nema podataka za generisanje. Molimo unesite podatke u polje ili otpremite fajl.");
            return;
        }

        generateQRCodes(data);
    });

    // Funkcija za parsiranje teksta iz textarea
    function parseTextarea() {
        return bulkInput.value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== "");
    }

    // Funkcija za parsiranje Excel fajla
    function parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    // Konvertuje sheet u niz nizova (samo prva kolona)
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    const result = json
                        .map(row => row[0]) // Uzimamo samo prvu ćeliju iz svakog reda
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

    // Funkcija koja generiše i prikazuje QR kodove
    function generateQRCodes(data) {
        qrcodeContainer.innerHTML = ''; // Očisti prethodne rezultate

        data.forEach(itemText => {
            const text = itemText.toString();

            // Kreira kontejner za jedan QR kod i njegovu etiketu
            const qrItem = document.createElement('div');
            qrItem.className = 'qr-item';

            // Mesto gde će se crtati QR kod
            const qrCodeDiv = document.createElement('div');

            // Etiketa sa sadržajem
            const label = document.createElement('p');
            label.className = 'qr-label';
            label.textContent = text;

            qrItem.appendChild(qrCodeDiv);
            qrItem.appendChild(label);
            qrcodeContainer.appendChild(qrItem);

            // Generiše QR kod
            new QRCode(qrCodeDiv, {
                text: text,
                width: 160,
                height: 160,
                correctLevel: QRCode.CorrectLevel.H
            });
        });

        // Prikazuje zaglavlje sa dugmetom za preuzimanje ako ima rezultata
        outputHeader.style.display = data.length > 0 ? 'flex' : 'none';
    }

    // Funkcija za preuzimanje svih kodova kao ZIP
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

            // Sanitizacija imena fajla (uklanjanje nedozvoljenih karaktera)
            const fileName = label.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
            
            // QRCode.js može generisati ili canvas ili img. Proveravamo oba.
            if (canvas) {
                const imageData = canvas.toDataURL('image/png').split(',')[1];
                zip.file(fileName, imageData, { base64: true });
            } else if (img) {
                const imageData = img.src.split(',')[1];
                zip.file(fileName, imageData, { base64: true });
            }
        });

        zip.generateAsync({ type: 'blob' }).then(content => {
            // Kreiranje linka za preuzimanje
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'qr_kodovi.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

});