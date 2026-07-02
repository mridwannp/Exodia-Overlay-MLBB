let saveState = 0; // 0 = Standby, 1 = Menunggu Konfirmasi
    let resetTimer = null; // Timer untuk mengembalikan tombol jika tidak jadi diklik

    async function handleSaveDraft(btn) {
        if (saveState === 0) {
            // === KLIK PERTAMA (Minta Konfirmasi) ===
            saveState = 1;
            btn.innerText = "ARE U SURE?";
            
            // Ubah warna jadi Merah (Warning)
            btn.style.borderColor = "#FF4444"; 
            btn.style.color = "#FF4444";

            // Pasang timer: Jika dalam 3 detik tidak diklik lagi, kembalikan ke awal
            resetTimer = setTimeout(() => {
                resetSaveButton(btn);
            }, 3000);

        } else if (saveState === 1) {
            // === KLIK KEDUA (Eksekusi Save) ===
            clearTimeout(resetTimer); // Batalkan timer reset
            
            try {
                // Firebase implementation of archive-draft
                const snapshot = await db.ref('matchdraft').once('value');
                const draft = snapshot.val();
                if (draft) {
                    // Push the current draft to history
                    await db.ref('previousdrafts').push(draft);
                }
                
                // Ubah tampilan jadi Sukses
                btn.innerText = "SAVED!";
                btn.style.backgroundColor = "#00FF8C"; // Background Hijau
                btn.style.color = "#000000";           // Teks Hitam
                btn.style.borderColor = "#00FF8C";

                // Kembalikan ke tombol semula setelah 2 detik
                setTimeout(() => {
                    resetSaveButton(btn);
                }, 2000);
                
                console.log("Draft Saved Successfully to Firebase.");

            } catch (e) {
                console.error("Gagal menyimpan ke Firebase:", e);
                resetSaveButton(btn); // Reset jika error
            }
        }
    }

    function resetSaveButton(btn) {
        saveState = 0;
        btn.innerText = "SAVE TO PREVIOUS";
        
        // Reset Style ke warna asli (Hijau Neon tanpa background)
        btn.style.backgroundColor = "transparent";
        btn.style.borderColor = "#00FF8C";
        btn.style.color = "#00FF8C";
    }

    // --- FUNGSI LAINNYA ---
    
    async function controlAnalyzer(action) {
        try {
            await db.ref('analyzer-control').set({ action, timestamp: Date.now() });
        } catch (e) { console.error("Error setting analyzer control in Firebase:", e); }
    }