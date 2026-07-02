// public/script/laneimg.js

function initLaneFirebaseSync() {
    db.ref('matchdata').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            renderLanes(data);
        }
    });
}

function renderLanes(data) {
    // Fungsi helper untuk update satu gambar
    function updateImage(elementId, player) {
        const imgElement = document.getElementById(elementId);
        
        // Jika elemen HTML tidak ditemukan, skip agar tidak error
        if (!imgElement) return;

        // Reset handler error agar bersih setiap kali update
        imgElement.onerror = null;

        // LOGIC UTAMA: Cek apakah data lane valid
        // Valid = object player ada, properti lane ada, tidak "none", tidak kosong
        if (player && player.lane && player.lane.toLowerCase() !== "none" && player.lane !== "") {
            
            const laneName = player.lane.toLowerCase(); // Paksa huruf kecil
            
            // 1. TAMPILKAN ELEMEN
            imgElement.style.display = 'block'; 
            imgElement.style.opacity = '1';
            
            // Set source gambar sesuai nama lane (exp, gold, junggle, mid, roam)
            imgElement.src = `Assets/lane/${laneName}.png`;
            
            // Error Handling:
            imgElement.onerror = function() {
                this.style.display = 'none';
                this.style.opacity = '0';
                this.onerror = null; // Mencegah loop
            };

        } else {
            // 2. SEMBUNYIKAN ELEMEN
            imgElement.style.display = 'none';
            imgElement.style.opacity = '0';
            imgElement.src = "Assets/lane/None.png"; // Gunakan capital N sesuai file on disk
        }
    }

    // Loop Blue Team
    if (data.teamdata?.blueteam?.playerlist) {
        data.teamdata.blueteam.playerlist.forEach((player, i) => {
            updateImage(`player-lane-${i + 1}-blue`, player);
        });
    }

    // Loop Red Team
    if (data.teamdata?.redteam?.playerlist) {
        data.teamdata.redteam.playerlist.forEach((player, i) => {
            updateImage(`player-lane-${i + 1}-red`, player);
        });
    }
}

// Start Firebase Realtime Synchronization
initLaneFirebaseSync();