document.addEventListener('DOMContentLoaded', () => {
    // Postavljanje današnjeg datuma kao podrazumevanog
    document.getElementById('date-input').valueAsDate = new Date();

    const generateBtn = document.getElementById('generate-btn');
    const printBtn = document.getElementById('print-btn');
    const labelsContainer = document.getElementById('labels-container');

    // Helper funkcija za formatiranje datuma u GGGYY
    function formatJulianDate(date) {
        const year = date.getFullYear();
        const startOfYear = new Date(year, 0, 0);
        const diff = date - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay).toString().padStart(3, '0');
        const yearShort = year.toString().slice(-2);
        return dayOfYear + yearShort;
    }

    // Helper funkcija za formatiranje serijskog broja (npr. 1 -> "00001")
    function padSerialNumber(num) {
        return num.toString().padStart(5, '0');
    }

    generateBtn.addEventListener('click', () => {
        // Prikupljanje fiksnih podataka
        const partNumber = document.getElementById('part-number').value.toUpperCase();
        const supplierCode = document.getElementById('supplier-code').value.toUpperCase();
        const dateInput = document.getElementById('date-input').value;
        
        // Prikupljanje podataka za seriju
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        const startSerial = parseInt(document.getElementById('start-serial').value, 10);

        // Validacija
        if (partNumber.length === 0 || supplierCode.length === 0 || !dateInput || isNaN(quantity) || isNaN(startSerial)) {
            alert("Molimo vas, popunite sva polja ispravno.");
            return;
        }

        // Brišemo prethodne nalepnice
        labelsContainer.innerHTML = ''; 

        const julianDate = formatJulianDate(new Date(dateInput));
        const endSerial = startSerial + quantity - 1;

        // Glavna petlja za generisanje
        for (let i = startSerial; i <= endSerial; i++) {
            const currentSerial = padSerialNumber(i);
            const qrData = partNumber + supplierCode + currentSerial + julianDate;

            // Kreiraj kontejner za jednu nalepnicu
            const labelItem = document.createElement('div');
            labelItem.className = 'label-item';

            // Kreiraj HTML za nalepnicu
            labelItem.innerHTML = `
                <div class="qr-code-area" id="qr-code-${i}"></div>
                <div class="data-fields-qr">
                    <div><strong>Dis. FCA:</strong> ${partNumber}</div>
                    <div><strong>Supplier:</strong> ${supplierCode}</div>
                    <div><strong>S/N:</strong> ${currentSerial}</div>
                    <div><strong>Data:</strong> ${julianDate}</div>
                </div>
            `;
            
            // Dodaj nalepnicu na stranicu
            labelsContainer.appendChild(labelItem);

            // Generiši QR kod za ovu nalepnicu
            new QRCode(document.getElementById(`qr-code-${i}`), {
                text: qrData,
                width: 100,
                height: 100,
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        
        // Prikazujemo dugme za štampu ako su generisane nalepnice
        if (quantity > 0) {
            printBtn.style.display = 'block';
        }
    });

    // Funkcionalnost za dugme "Odštampaj"
    printBtn.addEventListener('click', () => {
        window.print();
    });
});
