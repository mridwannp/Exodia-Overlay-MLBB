// controlnicknamelogo.js (Versi API Node.js - Preserving Other Data + Lane Support)

// Variabel global untuk menyimpan state logo di memori browser
let currentBlueLogo = "";
let currentRedLogo = "";

// --- FUNGSI UTAMA: LOAD & SAVE DATA ---

// Mengambil data dari Firebase dan mengisi Input Form
async function loadFromServer() {
    try {
        const snapshot = await db.ref('matchdata').once('value');
        let data = snapshot.val();

        // Fallback jika Firebase kosong
        if (!data) {
            console.log("Firebase matchdata is empty. Initializing from local JSON...");
            const response = await fetch('/database/matchdatateam.json');
            data = await response.json();
            await db.ref('matchdata').set(data);
        }

        // Cek struktur data agar tidak error
        if (!data.teamdata) return;

        const blue = data.teamdata.blueteam;
        const red = data.teamdata.redteam;

        // --- LOAD BLUE TEAM (Nama, Skor, Logo) ---
        document.getElementById('name-input-1').value = blue.teamname || "";
        document.getElementById('name-input-2').value = blue.score || "";
        currentBlueLogo = blue.logo || ""; 

        // Tampilkan logo di preview dropdown baru jika ada
        if (currentBlueLogo) showLogoPreview(1, currentBlueLogo);

        // Player Name & Lane Biru (Index 3-7)
        for(let i=0; i<5; i++) {
            // Load Nama
            const playerName = (blue.playerlist && blue.playerlist[i]) ? blue.playerlist[i].name : "";
            document.getElementById(`name-input-${3+i}`).value = playerName;
            
            // Load Lane (NEW) - Default 'none'
            const playerLane = (blue.playerlist && blue.playerlist[i]) ? blue.playerlist[i].lane : "none";
            const laneSelect = document.getElementById(`lane-select-${3+i}`);
            if (laneSelect) laneSelect.value = playerLane;
        }

        // --- LOAD RED TEAM (Nama, Skor, Logo) ---
        document.getElementById('name-input-8').value = red.teamname || "";
        document.getElementById('name-input-9').value = red.score || "";
        currentRedLogo = red.logo || ""; 

        // Tampilkan logo di preview dropdown baru jika ada
        if (currentRedLogo) showLogoPreview(2, currentRedLogo);

        // Player Name & Lane Merah (Index 10-14)
        for(let i=0; i<5; i++) {
            // Load Nama
            const playerName = (red.playerlist && red.playerlist[i]) ? red.playerlist[i].name : "";
            document.getElementById(`name-input-${10+i}`).value = playerName;

            // Load Lane (NEW) - Default 'none'
            const playerLane = (red.playerlist && red.playerlist[i]) ? red.playerlist[i].lane : "none";
            const laneSelect = document.getElementById(`lane-select-${10+i}`);
            if (laneSelect) laneSelect.value = playerLane;
        }

    } catch (error) {
        console.error("Gagal memuat data dari Firebase:", error);
    }
}

// FUNGSI SAVE YANG AMAN KE FIREBASE
async function saveToServer() {
    try {
        // 1. AMBIL DATA TERBARU DARI FIREBASE
        const snapshot = await db.ref('matchdata').once('value');
        let fullData = snapshot.val();

        if (!fullData) {
            const response = await fetch('/database/matchdatateam.json');
            fullData = await response.json();
        }

        // 2. MODIFIKASI HANYA FIELD YANG DIURUS TOOL INI
        
        // --- Update Blue Team ---
        fullData.teamdata.blueteam.teamname = document.getElementById('name-input-1').value;
        fullData.teamdata.blueteam.score = document.getElementById('name-input-2').value;
        fullData.teamdata.blueteam.logo = currentBlueLogo; 

        // Update Player Names & Lanes Biru
        for(let i=0; i<5; i++) {
            if (!fullData.teamdata.blueteam.playerlist[i]) fullData.teamdata.blueteam.playerlist[i] = {}; 
            
            // Simpan Nama
            fullData.teamdata.blueteam.playerlist[i].name = document.getElementById(`name-input-${3+i}`).value;
            
            // Simpan Lane (NEW)
            const laneVal = document.getElementById(`lane-select-${3+i}`).value;
            fullData.teamdata.blueteam.playerlist[i].lane = laneVal;
        }

        // --- Update Red Team ---
        fullData.teamdata.redteam.teamname = document.getElementById('name-input-8').value;
        fullData.teamdata.redteam.score = document.getElementById('name-input-9').value;
        fullData.teamdata.redteam.logo = currentRedLogo;

        // Update Player Names & Lanes Merah
        for(let i=0; i<5; i++) {
            if (!fullData.teamdata.redteam.playerlist[i]) fullData.teamdata.redteam.playerlist[i] = {}; 
            
            // Simpan Nama
            fullData.teamdata.redteam.playerlist[i].name = document.getElementById(`name-input-${10+i}`).value;

            // Simpan Lane (NEW)
            const laneVal = document.getElementById(`lane-select-${10+i}`).value;
            fullData.teamdata.redteam.playerlist[i].lane = laneVal;
        }

        // 3. KIRIM DATA LENGKAP KEMBALI KE FIREBASE
        await db.ref('matchdata').set(fullData);

    } catch (error) {
        console.error("Gagal menyimpan data ke Firebase (Save Error):", error);
    }
}


// --- EVENT HANDLERS ---

// Auto Save saat mengetik atau mengganti dropdown
function setupAutoSave() {
    // Listener untuk Input Nama (1-14)
    for (let i = 1; i <= 14; i++) {
        const input = document.getElementById(`name-input-${i}`);
        if (input) {
            input.addEventListener('input', saveToServer);
        }
    }

    // Listener untuk Dropdown Lane (3-7 & 10-14)
    const laneIndices = [3, 4, 5, 6, 7, 10, 11, 12, 13, 14];
    laneIndices.forEach(i => {
        const select = document.getElementById(`lane-select-${i}`);
        if (select) {
            select.addEventListener('change', saveToServer); // Gunakan 'change' untuk dropdown
        }
    });
}

// --- LOGO PICKER (Dropdown seperti Hero Picker) ---

let allLogos = []; // Daftar semua file logo

async function loadLogoList() {
    try {
        const response = await fetch('/database/logoteam.json');
        allLogos = await response.json();
        // Render preview jika logo sudah tersimpan di server
        if (currentBlueLogo) showLogoPreview(1, currentBlueLogo);
        if (currentRedLogo) showLogoPreview(2, currentRedLogo);
    } catch(e) {
        console.error('Gagal load daftar logo:', e);
    }
}

function filterLogoPicker(side) {
    const query = document.getElementById(`logo-search-${side}`).value.toLowerCase();
    const dropdown = document.getElementById(`logo-dropdown-${side}`);
    dropdown.innerHTML = '';

    if (!query) {
        dropdown.style.display = 'none';
        return;
    }

    const filtered = allLogos.filter(f => f.toLowerCase().includes(query));
    if (filtered.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.style.display = 'flex';
    filtered.forEach(filename => {
        const item = document.createElement('div');
        item.className = 'logo-dropdown-item';

        // Strip prefix number and extension for display name
        const displayName = filename.replace(/^\d+[.,]?\s*/, '').replace('.png', '');
        const path = `Assets/LogoTim/${encodeURIComponent(filename)}`;

        const img = document.createElement('img');
        img.src = path;
        img.alt = displayName;

        const label = document.createElement('span');
        label.textContent = displayName;

        item.appendChild(img);
        item.appendChild(label);
        item.onclick = () => selectLogo(side, path, displayName);
        dropdown.appendChild(item);
    });
}

function selectLogo(side, path, displayName) {
    if (side === 1) currentBlueLogo = path;
    else currentRedLogo = path;

    showLogoPreview(side, path, displayName);
    document.getElementById(`logo-dropdown-${side}`).style.display = 'none';
    document.getElementById(`logo-search-${side}`).value = '';
    saveToServer();
}

function showLogoPreview(side, path, displayName) {
    const img = document.getElementById(`logo-preview-${side}`);
    const label = document.getElementById(`logo-preview-name-${side}`);
    if (img) {
        img.src = path;
        img.style.display = 'block';
    }
    if (label && displayName) label.textContent = displayName;
    else if (label) {
        // Extract name from path
        const filename = decodeURIComponent(path.split('/').pop());
        label.textContent = filename.replace(/^\d+[.,]?\s*/, '').replace('.png', '');
    }
}

function clearLogo(side) {
    if (side === 1) currentBlueLogo = '';
    else currentRedLogo = '';
    const img = document.getElementById(`logo-preview-${side}`);
    const label = document.getElementById(`logo-preview-name-${side}`);
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (label) label.textContent = '';
    document.getElementById(`logo-search-${side}`).value = '';
    document.getElementById(`logo-dropdown-${side}`).style.display = 'none';
    saveToServer();
}

// --- LOGIKA TOMBOL (Reset, Switch, Swap) ---

async function resetNames() {
    // 1. Reset Nama
    for (let i = 1; i <= 14; i++) {
        const input = document.getElementById(`name-input-${i}`);
        if(input) input.value = "";
    }

    // 2. Reset Lane ke 'none'
    const laneIndices = [3, 4, 5, 6, 7, 10, 11, 12, 13, 14];
    laneIndices.forEach(i => {
        const select = document.getElementById(`lane-select-${i}`);
        if(select) select.value = "none";
    });

    await saveToServer(); 
}

async function resetImages() {
    currentBlueLogo = '';
    currentRedLogo = '';
    clearLogo(1);
    clearLogo(2);
    await saveToServer();
}

async function switchNames() {
    // 1. Ambil nilai UI saat ini (lokal) - Nama & Score
    let blueTeamName = document.getElementById('name-input-1').value;
    let blueScore = document.getElementById('name-input-2').value;
    
    // Ambil Player & Lane Biru
    let bluePlayers = [];
    let blueLanes = [];
    for(let i=3; i<=7; i++) {
        bluePlayers.push(document.getElementById(`name-input-${i}`).value);
        blueLanes.push(document.getElementById(`lane-select-${i}`).value);
    }

    // Ambil Player & Lane Merah
    let redTeamName = document.getElementById('name-input-8').value;
    let redScore = document.getElementById('name-input-9').value;
    let redPlayers = [];
    let redLanes = [];
    for(let i=10; i<=14; i++) {
        redPlayers.push(document.getElementById(`name-input-${i}`).value);
        redLanes.push(document.getElementById(`lane-select-${i}`).value);
    }

    // 2. Tukar Nilai di UI
    // Set Sisi Biru dengan data Merah
    document.getElementById('name-input-1').value = redTeamName;
    document.getElementById('name-input-2').value = redScore;
    for(let i=0; i<5; i++) {
        document.getElementById(`name-input-${3+i}`).value = redPlayers[i];
        document.getElementById(`lane-select-${3+i}`).value = redLanes[i];
    }

    // Set Sisi Merah dengan data Biru
    document.getElementById('name-input-8').value = blueTeamName;
    document.getElementById('name-input-9').value = blueScore;
    for(let i=0; i<5; i++) {
        document.getElementById(`name-input-${10+i}`).value = bluePlayers[i];
        document.getElementById(`lane-select-${10+i}`).value = blueLanes[i];
    }

    // 3. Simpan
    await saveToServer();
}

async function switchImages() {
    let temp = currentBlueLogo;
    currentBlueLogo = currentRedLogo;
    currentRedLogo = temp;
    await saveToServer();
}

// SWAP INDIVIDUAL (Logic Swap Player + Lane)
let firstSwapSelection = null;

function handleSwapClick(index, button) {
    if (firstSwapSelection === null) {
        // Klik Pertama (Pilih sumber)
        firstSwapSelection = { index: index, button: button };
        button.textContent = "Cancel";
        button.style.backgroundColor = '#ffc107';
    } else {
        // Klik Kedua (Pilih target)
        if (firstSwapSelection.index === index) {
            // Jika klik tombol yang sama -> Cancel
            resetSwapUI();
            return;
        }

        // Ambil Elemen Input & Select
        const input1 = document.getElementById(`name-input-${firstSwapSelection.index}`);
        const lane1 = document.getElementById(`lane-select-${firstSwapSelection.index}`);
        
        const input2 = document.getElementById(`name-input-${index}`);
        const lane2 = document.getElementById(`lane-select-${index}`);

        // Swap Nama
        const tempVal = input1.value;
        input1.value = input2.value;
        input2.value = tempVal;

        // Swap Lane (Pastikan elemen ada sebelum swap)
        if (lane1 && lane2) {
            const tempLane = lane1.value;
            lane1.value = lane2.value;
            lane2.value = tempLane;
        }

        saveToServer(); 
        resetSwapUI();
    }
}

function resetSwapUI() {
    if (firstSwapSelection) {
        firstSwapSelection.button.textContent = "Swap";
        firstSwapSelection.button.style.backgroundColor = '';
        firstSwapSelection = null;
    }
    const allButtons = document.querySelectorAll('button[id^="swap-btn-"]');
    allButtons.forEach(btn => {
        btn.textContent = "Swap";
        btn.style.backgroundColor = '';
    });
}

// --- INITIALIZATION ---

function initializeApp() {
    loadFromServer(); 
    setupAutoSave();
    loadLogoList();
}

window.onload = initializeApp;