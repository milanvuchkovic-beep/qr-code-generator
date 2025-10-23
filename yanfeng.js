document.addEventListener('DOMContentLoaded', () => {
    
    // --- LINKOVI I KONSTANTE ---
    const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT2_LvmZ-F7CRoGIxRHS9-K2v9RAGbzHWkpQ78tfgkD0oxYhxRVYgA5KVmaydJ25FpoKTPsLSTab8c4/pub?gid=0&single=true&output=csv';
    const logoUrl = 'https://i.postimg.cc/bvf1L9vn/File-Porsche-Warenzeichen-Wikimedia-Commons-Org-Design-Porsche-Warenzeichen-PNG-Image-Transparen.jpg';
    const companyName = "SIGIT DOO";
    const dunsNumber = '499504686'; // Fiksni DUNS broj dobavljača

    // --- ELEMENTI ---
    const pnSelect = document.getElementById('pn-select');
    const quantityInput = document.getElementById('quantity');
    const startSerialInput = document.getElementById('start-serial');
    const generateBtn = document.getElementById('generate-btn');
    const printBtn = document.getElementById('print-btn');
    const labelsContainer = document.getElementById('labels-container');
    
    let sheetData = [];

    // --- FUNKCIJE ---

    // 1. Poboljšana funkcija za parsiranje CSV-a (uklanja navodnike)
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
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

            // =================================================================
            // === VAŽNO: Ovde upiši tačan naziv kolone (iz ćelije A1) ===
            const pnHeader = 'Sigit PN'; 
            // =================================================================

            pnSelect.innerHTML = '<option value="">-- Izaberi PN --</option>';
            sheetData.forEach((row, index) => {
                pnSelect.innerHTML += `<option value="${index}">${row[pnHeader]}</option>`;
            });
            pnSelect.disabled = false;
            generateBtn.disabled = false;
        } catch (error) {
            console.error('Greška pri učitavanju Google Sheet-a:', error);
            pnSelect.innerHTML = '<option value="">Greška pri učitavanju</option>';
        }
    }

    // 3. Funkcija za formatiranje datuma u DDMMYYYY (za Data Matrix)
    function getDMDate(date) {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear().toString(); // Puna godina YYYY
        return `${d}${m}${y}`;
    }

    // 4. Funkcija za formatiranje datuma za PRIKAZ (DD.MM.YYYY)
    function getDisplayDate(date) {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    }

    // 5. Funkcija za formatiranje serijskog broja
    function padSerialNumber(num) {
        return num.toString().padStart(5, '0');
    }

    // 6. Glavna funkcija za generisanje nalepnica
    function generateLabels() {
        const selectedIndex = pnSelect.value;
        if (selectedIndex === "") {
            alert("Molimo vas, izaberite Part Number.");
            return;
        }
        
        const selectedRow = sheetData[selectedIndex];
        const quantity = parseInt(quantityInput.value, 10);
        const startSerial = parseInt(startSerialInput.value, 10);
        
        const currentDate = new Date();
        const displayDate = getDisplayDate(currentDate); // Za prikaz: 23.10.2025
        const dmDate = getDMDate(currentDate);           // Za kod: 23102025

        // =================================================================
        // === VAŽNO: Ovde upiši tačne nazive zaglavlja iz tvog Google Sheet-a ===
        
        // Naziv kolone C (za prikaz iznad logoa)
        const manufacturerCodeHeader = 'Aggregation'; 
        // Naziv kolone D (za prikaz u desnoj koloni)
        const productionSiteHeader = 'Country'; 
        // Naziv kolone F (za status i za kod)
        const statusHeader = 'Change number'; 
        // Naziv kolone G (za kod)
        const porschePNHeader = 'Porsche PN QR';
        
        // =================================================================
        
        const productStatus = selectedRow[statusHeader];
        const porschePN = selectedRow[porschePNHeader];
        const manufacturerCode = selectedRow[manufacturerCodeHeader];
        const productionSite = selectedRow[productionSiteHeader];


        labelsContainer.innerHTML = '';
        
        for (let i = 0; i < quantity; i++) {
            const currentSerial = padSerialNumber(startSerial + i);
            
            // --- KREIRANJE SADRŽAJA ZA DATA MATRIX PREMA NOVOJ SPECIFIKACIJI ---
            const dmData = `#${porschePN}#${currentSerial}#${dunsNumber}#${dmDate}=${productStatus}`;

            const labelEl = document.createElement('div');
            labelEl.className = 'label-item-yanfeng';
            
            // --- POPRAVLJEN HTML ZA NALEPNICU ---
            labelEl.innerHTML = `
                <div class="label-col col-1">
                    <canvas class="barcode-canvas" id="barcode-${i}"></canvas>
                </div>
                <div class="label-col col-2">
                    <div>${manufacturerCode}</div>
                    <img src="${logoUrl}" class="label-logo" alt="Logo">
                </div>
                <div class="label-col col-3">
                    <div>${productionSite}</div>
                    <div>${companyName}</div>
                    <div>${displayDate}</div>
                    <div>${currentSerial}</div>
                    <div>${productStatus}</div>
                </div>
            `;
            
            labelsContainer.appendChild(labelEl);

            try {
                bwipjs.toCanvas(`barcode-${i}`, {
                    bcid: 'datamatrix', 
                    text: dmData, // Ubacujemo novi sadržaj koda
                    scale: 5, 
                    width: 10, 
                    height: 10, 
                    includetext: false,
                });
            } catch (e) { console.error('Greška pri crtanju bar koda:', e); }
        }
        
        printBtn.style.display = 'block';
    }

    // --- POVEZIVANJE DOGAĐAJA ---
    loadSheetData();
    generateBtn.addEventListener('click', generateLabels);
    printBtn.addEventListener('click', () => window.print());
});
