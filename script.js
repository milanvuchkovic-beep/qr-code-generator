// ----------------------------------------------------------------------
// 1. INICIJALIZACIJA I DVA BASE URL-a
// ----------------------------------------------------------------------

/**
 * Izvlači ID stanice (npr. 'PR05') iz URL parametra 'id'.
 */
function getStationIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    let stationId = urlParams.get('id'); 
    return stationId ? stationId.toUpperCase() : 'PR01'; 
}

const CURRENT_STATION_ID = getStationIdFromUrl();

// GLAVNI URL ZA OPERATIVNE APLIKACIJE (Smena, Pauza, Planiranje, Primopredaja)
const APPS_SCRIPT_BASE_URL = 'https://script.google.com/macros/s/AKfycbzzVwEs83KIH-M0ExKxifDBdCzvZNockcvhFUhFkZPQYMD1rOqmxIy90lOt4C1deHau/exec';

// NOVI URL ZA APLIKACIJU KORISNIKA (Različiti Deployment)
const USERS_APP_BASE_URL = 'https://script.google.com/macros/s/AKfycbzaJTI4siLOc_VbXKoyF4I93SWfmkLPZVOQTreSZlgkPOfh2Cp3NrcpzOi9UMCnRDlh/exec';


// Ažuriranje glavnog naslova na stranici čim se dokument učita
document.addEventListener('DOMContentLoaded', () => {
    const mainTitleElement = document.getElementById('mainTitle');
    if (mainTitleElement) {
        mainTitleElement.textContent = `Radna stanica ${CURRENT_STATION_ID}`;
    }
});


// ----------------------------------------------------------------------
// 2. FUNKCIJA ZA OTVARANJE (Sada prima opcioni Base URL)
// ----------------------------------------------------------------------

/**
 * Obrađuje klik na dugme menija i kreira URL sa parametrima 'page' i 'id'.
 * @param {string} buttonId - HTML ID dugmeta.
 * @param {string} originalText - Tekst dugmeta.
 * @param {string} pageName - Page parametar.
 * @param {boolean} [includeId=true] - Da li uključiti &id=PRXX.
 * @param {string} [baseUrlOverride=APPS_SCRIPT_BASE_URL] - Opcioni URL za Korisnike.
 */
function handleMenuClick(buttonId, originalText, pageName, includeId = true, baseUrlOverride = APPS_SCRIPT_BASE_URL) {
    const dugme = document.getElementById(buttonId);
    const statusMessageElement = document.getElementById('statusMessage');
    // Koristimo encodeURIComponent za celu putanju, rešavajući problem povratka iz subfoldera
    const fullPath = encodeURIComponent(window.location.href);
    
    if (dugme && statusMessageElement) {
        dugme.addEventListener('click', function() {
            if (dugme.classList.contains('loading-state')) {
                return; 
            }
            
            // 1. VIZUELNI FEEDBACK: Prikazivanje statusne poruke
            statusMessageElement.textContent = `OTVARANJE: ${originalText}...`;
            statusMessageElement.classList.add('visible');
            dugme.classList.add('loading-state');
            
            // 2. KREIRANJE CILJNOG URL-a
            let targetUrl = `${baseUrlOverride}?page=${pageName}&source=${fullPath}`;
            
            if (includeId) {
                targetUrl += `&id=${CURRENT_STATION_ID}`;
            }

            // 3. STVARNO PREUSMERAVANJE (Otvaranje WebApp u istom prozoru)
            window.location.href = targetUrl; 
        });
    } else {
        // Loguje grešku samo ako je element definisan u connectButtonIfPresent
        console.error(`ERROR: Element with ID ${buttonId} or statusMessage not found.`);
    }
}


/**
 * Povezuje logiku sa dugmetom samo ako ono zaista postoji na stranici (rešavanje problema portala)
 */
function connectButtonIfPresent(buttonId, originalText, pageName, includeId, baseUrlOverride) {
    const element = document.getElementById(buttonId);
    if (element) {
        // Prosleđujemo sve argumente funkciji handleMenuClick
        handleMenuClick(buttonId, originalText, pageName, includeId, baseUrlOverride);
    }
}

// ----------------------------------------------------------------------
// 3. POVEZIVANJE DUGMADI SA ISPRAVNIM PAGE PARAMETRIMA
// ----------------------------------------------------------------------

// *** LOGIKA GLAVNE KOMANDNE TABLE (index.html) ***
connectButtonIfPresent('prijavaSmeneDugme', 'Prijava smene (OPERATERI)', 'smena', true);
connectButtonIfPresent('prijavaSkartaDugme', 'Prijava škarta', 'proizvodnja_v2', true);
connectButtonIfPresent('prijavaPauzaDugme', 'Prijava pauza', 'pauza', true);
connectButtonIfPresent('izmenaParametaraDugme', 'Izmena parametara', 'izmena_parametara', true);
connectButtonIfPresent('prijavaKvalitetaDugme', 'Prijava kvaliteta', 'paznja', true);
connectButtonIfPresent('playDugme', 'START/POČETAK', 'pocetak', true);
connectButtonIfPresent('stopDugme', 'STOP/KRAJ', 'kraj', true);
connectButtonIfPresent('zastojiDugme', 'ZASTOJ', 'zastoj', true);


// *** LOGIKA ZA SPECIJALIZOVANE PORTALE (sefovi.html, regleri.html, planiranje.html) ***

// 1. PORTAL ZA ŠEFOVE (Ne šalje ID)
connectButtonIfPresent('primopredajaDugmeSef', 'Primopredaja smene (ŠEFOVI)', 'primopredaja', false); 

// 2. PORTAL ZA REGLERE (Ne šalje ID)
connectButtonIfPresent('reglerDugme', 'Regler aplikacija', 'alati', false);

// 3. PORTAL ZA PLANIRANJE (Ne šalje ID)
connectButtonIfPresent('planiranjeDugme', 'Planiranje proizvodnje', 'planiranje', false);

// 4. NOVO: PORTAL ZA KORISNIKE (Ne šalje ID - Koristi poseban Base URL)
connectButtonIfPresent('korisniciDugme', 'Upravljanje korisnicima', 'korisnici', false, USERS_APP_BASE_URL);
