// public/script/displaynicknamelogo.js

// 1. Firebase Sync and Auto-Initialization
function initFirebaseSync() {
    db.ref('matchdata').on('value', async (snapshot) => {
        let data = snapshot.val();
        if (!data) {
            console.log("Firebase matchdata is empty. Initializing from local JSON...");
            try {
                const response = await fetch('/database/matchdatateam.json');
                data = await response.json();
                await db.ref('matchdata').set(data);
            } catch(e) {
                console.error("Gagal inisialisasi Firebase matchdata:", e);
                return;
            }
        }
        updateUI(data);
    });
}

// 3. Fungsi Mapping Data JSON ke HTML
function updateUI(data) {
    if (!data || !data.teamdata) return;

    const blue = data.teamdata.blueteam;
    const red = data.teamdata.redteam;

    // --- TIM BIRU ---
    setText('name-box-1', blue.teamname);
    setText('name-box-2', blue.score);
    setImage('displayImage1', blue.logo, "Logo Biru");

    if (blue.playerlist) {
        blue.playerlist.forEach((player, index) => {
            const htmlId = 3 + index; 
            setText(`name-box-${htmlId}`, player.name);
            // Gunakan field photo jika ada, fallback ke name
            const photoName = (player.photo && player.photo.trim() !== "") ? player.photo : player.name;
            setMugshot(`name-image-box-${htmlId}`, photoName);
        });
    }

    // --- TIM MERAH ---
    setText('name-box-8', red.teamname);
    setText('name-box-9', red.score);
    setImage('displayImage2', red.logo, "Logo Merah");

    if (red.playerlist) {
        red.playerlist.forEach((player, index) => {
            const htmlId = 10 + index; 
            setText(`name-box-${htmlId}`, player.name);
            // Gunakan field photo jika ada, fallback ke name
            const photoName = (player.photo && player.photo.trim() !== "") ? player.photo : player.name;
            setMugshot(`name-image-box-${htmlId}`, photoName);
        });
    }
}

// --- FUNGSI BANTUAN (HELPER) ---

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        // Update teks hanya jika ada perubahan untuk efisiensi
        if (el.textContent !== text) {
            el.textContent = text || "";
            // Panggil resize
            autoResizeText(el);
        } else {
            // Jika teks sama, tetap panggil resize (untuk handle perubahan layout/window resize)
            autoResizeText(el);
        }
    }
}

// BARU: Fungsi Resize yang Lebih Kuat & Akurat (Berdasarkan Lebar Wadah Induk)
function autoResizeText(element) {
    if (!element) return;

    // Reset styling awal agar bisa mengukur ukuran asli teks
    element.style.fontSize = ""; 
    element.style.whiteSpace = "nowrap"; 
    element.style.overflow = "hidden";   
    
    const parent = element.parentElement;
    if (!parent) return;

    // Ambil lebar maksimum wadah induk (parent)
    const maxAllowedWidth = parent.clientWidth;
    if (maxAllowedWidth <= 0) return; // Wadah tidak terlihat / belum render

    const style = window.getComputedStyle(element);
    let currentSize = parseFloat(style.fontSize) || 14;
    const minSize = 8; // Batas minimal ukuran font dalam pixel

    // Jika lebar konten teks melebihi lebar wadah induk, kecilkan ukuran font
    while ((element.scrollWidth > maxAllowedWidth) && currentSize > minSize) {
        currentSize -= 0.5; // Turunkan perlahan 0.5px untuk keakuratan tinggi
        element.style.fontSize = `${currentSize}px`;
    }
}

function setImage(id, base64Data, altText) {
    const img = document.getElementById(id);
    const defaultLogo = "Assets/Other/nologo.png"; 

    if (img) {
        if (base64Data && base64Data.trim() !== "") {
            img.src = base64Data;
        } else {
            img.src = defaultLogo;
        }

        img.onerror = function() {
            this.onerror = null; 
            this.src = defaultLogo;
        };

        img.style.display = "block"; 
        img.alt = altText;
    }
}

function setMugshot(containerId, playerName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Cek agar tidak redraw jika gambar player sama (opsional, untuk performa)
    // Tapi karena mugshot sering berubah pose, kita redraw saja:
    container.innerHTML = '';
    const img = document.createElement('img');
    
    if (playerName && playerName.trim() !== "") {
        img.src = `Assets/player/${encodeURIComponent(playerName)}.png`;
    } else {
        img.src = "Assets/player/noplayer.png";
    }

    img.onerror = function() {
        this.onerror = null; 
        this.src = "Assets/player/noplayer.png";
    };

    container.appendChild(img);
}

// Start Firebase Realtime Synchronization
initFirebaseSync();