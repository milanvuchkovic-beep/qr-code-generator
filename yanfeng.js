document.addEventListener('DOMContentLoaded', () => {
    
    // --- LINKOVI I KONSTANTE ---
    const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT2_LvmZ-F7CRoGIxRHS9-K2v9RAGbzHWkpQ78tfgkD0oxYhxRVYgA5KVmaydJ25FpoKTPsLSTab8c4/pub?gid=0&single=true&output=csv';
    const logoUrl = 'https://i.postimg.cc/bvf1L9vn/File-Porsche-Warenzeichen-Wikimedia-Commons-Org-Design-Porsche-Warenzeichen-PNG-Image-Transparen.jpg';
    const companyName = "SIGIT DOO"; // Fiksni podatak sa zelene nalepnice

    // --- ELEMENTI ---
    const pnSelect = document.getElementById('pn-select');
    const quantityInput = document.getElementById('quantity');
    const startSerialInput = document.getElementById('start-serial');
    const statusInput = document.getElementById('product-status');
    const generateBtn = document.getElementById('generate-btn');
    const printBtn = document.getElementById('print-btn');
    const labelsContainer = document.getElementById('labels-container');
    
    let sheetData = []; // Ovde čuvamo podatke iz Google Sheet-a

    // --- FUNKCIJE ---

    // 1. Funkcija za parsiranje CSV teksta u niz objekata
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;
            const values = line.split(',').map(v => v.trim());
            let obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            data.push(obj);
        }
        return data;
    }

    // 2. Funkcija za učitavanje i popunjavanje padajućeg menija
    async function loadSheetData() {
        try {
            const response = await fetch(sheetCsvUrl);
            const csvText = await response.text();
            sheetData = parseCSV(csvText);

            // Popuni padajući meni
            pnSelect.innerHTML = '<option value="">-- Izaberi PN --</option>';
            sheetData.forEach((row, index) => {
                pnSelect.innerHTML += `<option value="${index}">${row.Sigit_PN}</option>`;
            });
            pnSelect.disabled = false;
            generateBtn.disabled = false;
        } catch (error) {
            console.error('Greška pri učitavanju Google Sheet-a:', error);
            pnSelect.innerHTML = '<option value="">Greška pri učitavanju</option>';
        }
    }

    // 3. Funkcija za formatiranje datuma u DD.MM.YYYY
    function getFormattedDate() {
        const date = new Date();
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    }

    // 4. Funkcija za formatiranje serijskog broja
    function padSerialNumber(num) {
        return num.toString().padStart(5, '0');
    }

    // 5. Glavna funkcija za generisanje nalepnica
    function generateLabels() {
        const selectedIndex = pnSelect.value;
        if (selectedIndex === "") {
            alert("Molimo vas, izaberite Part Number.");
            return;
        }
        
        const selectedRow = sheetData[selectedIndex];
        const quantity = parseInt(quantityInput.value, 10);
        const startSerial = parseInt(startSerialInput.value, 10);
        const productStatus = statusInput.value.toUpperCase();
        const currentDate = getFormattedDate();

        labelsContainer.innerHTML = ''; // Očisti prethodne
        
        for (let i = 0; i < quantity; i++) {
            const currentSerial = padSerialNumber(startSerial + i);
            
            // Kreiramo string za Data Matrix
            const dmData = `${selectedRow.Yanfeng_PN}|${selectedRow.Manufacturer_Code}|${currentDate}|${currentSerial}`;

            const labelEl = document.createElement('div');
            labelEl.className = 'label-item-yanfeng';
            
            labelEl.innerHTML = `
                <div class="label-col col-1">
                    <canvas class="barcode-canvas" id="barcode-${i}"></canvas>
                </div>
                <div class="label-col col-2">
                    <div>${selectedRow.Manufacturer_Code}</div>
                    <img src="${logoUrl}" class="label-logo" alt="Logo">
                </div>
                <div class="label-col col-3">
                    <div>${selectedRow.Production_Site}</div>
                    <div>${companyName}</div>
                    <div>${currentDate}</div>
                    <div>${currentSerial}</div>
                    <div>${productStatus}</div>
                </div>
            `;
            
            labelsContainer.appendChild(labelEl);

            // Generiši Data Matrix
            try {
                bwipjs.toCanvas(`barcode-${i}`, {
                    bcid: 'datamatrix',
                    text: dmData,
                    scale: 5,
                    width: 10,  // u mm
                    height: 10, // u mm
                    includetext: false,
                });
            } catch (e) {
                console.error('Greška pri crtanju bar koda:', e);
            }
        }
        
        printBtn.style.display = 'block';
    }

    // --- POVEZIVANJE DOGAĐAJA ---
    
    // Pokreni učitavanje podataka čim se stranica otvori
    loadSheetData();

    // Poveži dugmiće sa funkcijama
    generateBtn.addEventListener('click', generateLabels);
    printBtn.addEventListener('click', () => window.print());

});
