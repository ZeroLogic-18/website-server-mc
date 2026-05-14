// script.js - Cafaalia SMP Logic

// --- 1. Tab Switching Logic (SPA Mode) ---
function switchTab(tabId, event) {
    if (event) event.preventDefault();
    
    // Sembunyikan semua tab
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('animate-tab');
    });
    
    // Munculkan tab yang dipilih
    const targetTab = document.getElementById(tabId);
    if(targetTab) {
        targetTab.classList.remove('hidden');
        void targetTab.offsetWidth; 
        targetTab.classList.add('animate-tab');
    }

    // Update warna link Navbar
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('text-emerald-400');
        link.classList.add('text-slate-400');
    });

    const activeLink = document.querySelector(`.nav-link[href="#${tabId}"]`);
    if (activeLink) {
        activeLink.classList.remove('text-slate-400');
        activeLink.classList.add('text-emerald-400');
    }

    // --- BAGIAN INI YANG BIKIN URL BERSIH ---
    // Paksa URL tetap bersih tanpa embel-embel #
    if (history.replaceState) {
        history.replaceState(null, null, window.location.pathname);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 2. Server Status Fetcher (Dual API Bypass) ---
const SERVER_IP = "cafaaliasmp.hopto.org";
const JAVA_PORT = "25571"; 

async function updateServerStatus() {
    const statusText = document.getElementById('statusText');
    const statusPing = document.getElementById('statusPing');
    const statusDot = document.getElementById('statusDot');
    const badge = document.getElementById('serverStatusBadge');
    const playerCountEl = document.getElementById('onlinePlayerCount');

    let isOnline = false;
    let onlinePlayers = 0;
    let maxPlayers = 0;

    try {
        try {
            const res1 = await fetch(`https://mcapi.us/server/status?ip=${SERVER_IP}&port=${JAVA_PORT}`);
            const data1 = await res1.json();
            if (data1.status === "success" && data1.online) {
                isOnline = true; onlinePlayers = data1.players.now; maxPlayers = data1.players.max;
            }
        } catch (err1) { console.log("Beralih ke Minetools..."); }

        if (!isOnline) {
            const res2 = await fetch(`https://api.minetools.eu/ping/${SERVER_IP}/${JAVA_PORT}`);
            const data2 = await res2.json();
            if (!data2.error) {
                isOnline = true; onlinePlayers = data2.players.online; maxPlayers = data2.players.max;
            }
        }

        if (isOnline) {
            statusText.innerText = `${onlinePlayers}/${maxPlayers} Player Online`;
            playerCountEl.innerText = `${onlinePlayers}`;
            statusPing.classList.replace('bg-slate-500', 'bg-emerald-400');
            statusPing.classList.add('status-pulse');
            statusDot.classList.replace('bg-slate-600', 'bg-emerald-500');
            badge.classList.replace('text-slate-300', 'text-emerald-400');
            badge.classList.replace('border-white/10', 'border-emerald-500/30');
            badge.classList.replace('bg-slate-800/50', 'bg-emerald-500/10');
            statusPing.classList.remove('bg-red-500'); statusDot.classList.remove('bg-red-500');
            badge.classList.remove('text-red-400', 'border-red-500/30', 'bg-red-500/10');
        } else {
            throw new Error("Offline");
        }
    } catch (error) {
        statusText.innerText = "Server Sedang Offline";
        playerCountEl.innerText = "0";
        statusPing.classList.remove('status-pulse', 'bg-emerald-400', 'bg-slate-500');
        statusPing.classList.add('bg-red-500');
        statusDot.classList.remove('bg-emerald-500', 'bg-slate-600');
        statusDot.classList.add('bg-red-500');
        badge.classList.remove('text-emerald-400', 'text-slate-300', 'border-emerald-500/30', 'border-white/10', 'bg-emerald-500/10', 'bg-slate-800/50');
        badge.classList.add('text-red-400', 'border-red-500/30', 'bg-red-500/10');
    }
}

// --- 3. Copy functionality with Toast ---
function copyContent(id, label) {
    const text = document.getElementById(id).innerText;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast(label));
    } else {
        const dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = text; dummy.select(); document.execCommand("copy");
        document.body.removeChild(dummy);
        showToast(label);
    }
}

function showToast(label) {
    const toast = document.getElementById('toast');
    document.getElementById('toastTitle').innerText = `${label} Disalin!`;
    toast.classList.remove('toast-hidden'); toast.classList.add('toast-visible');
    setTimeout(() => { toast.style.transform = "translate(-50%, -5px) scale(1.05)"; }, 50);
    setTimeout(() => { toast.style.transform = "translate(-50%, 0) scale(1)"; }, 200);
    setTimeout(() => { toast.classList.add('toast-hidden'); toast.classList.remove('toast-visible'); }, 3000);
}

// --- 4. Initialize App ---
window.addEventListener("load", () => {
    // Ambil tab dari URL hash (jika tidak ada, set ke 'home')
    const initialTab = window.location.hash.substring(1) || 'home';
    switchTab(initialTab); // Ini akan otomatis membersihkan URL setelah me-load tab yang tepat
    
    updateServerStatus();
    setInterval(updateServerStatus, 30000);
});
