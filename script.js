/* script.js - Cafaalia SMP (Official Server Status Fix) */

// Fungsi untuk mengganti tab halaman (routing SPA)
function switchTab(tabId, event) {
    if (event) {
        event.preventDefault(); // Mencegah reload halaman
    }

    // Sembunyikan semua tab content
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));

    // Tampilkan tab yang dipilih
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.remove('hidden');
    }

    // Ganti class active pada link navigasi
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('text-white');
        link.classList.add('text-[#cccccc]');
    });

    // Tambahkan class active ke link yang sesuai
    const activeLink = document.querySelector(`a[href="#${tabId}"]`);
    if (activeLink) {
        activeLink.classList.remove('text-[#cccccc]');
        activeLink.classList.add('text-white');
    }
}

// Fungsi untuk salin IP/Port dengan Notifikasi Toast
function copyContent(elementId, typeName) {
    const textToCopy = document.getElementById(elementId).innerText;
    
    // API Clipboard untuk salin teks
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied!`, `${typeName} berhasil disalin ke clipboard.`);
    }).catch(err => {
        showToast(`Error!`, `Gagal menyalin teks.`);
        console.error('Failed to copy: ', err);
    });
}

// Fungsi untuk menampilkan notifikasi toast ala Minecraft
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const titleEl = document.getElementById('toastTitle');
    const msgEl = document.getElementById('toastMsg');

    titleEl.innerText = title;
    msgEl.innerText = message;

    // Tampilkan toast dengan animasi
    toast.classList.remove('toast-hidden');
    toast.classList.add('toast-visible');

    // Sembunyikan otomatis setelah 3 detik
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-hidden');
    }, 3000);
}

// ========================================================
// FUNGSI FIX SERVER STATUS - MENGGUNAKAN MCSRVSTAT API
// ========================================================
function updateServerStatus() {
    // Alamat server Java kamu (port Java 25571 biasanya dipakai untuk query)
    const javaServerAddress = 'cafaaliasmp.hopto.org:25571'; 
    const apiUrl = `https://api.mcsrvstat.us/2/${javaServerAddress}`;

    console.log(`Pinging Cafaalia server via: ${apiUrl}`);

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Jaringan bermasalah');
            }
            return response.json();
        })
        .then(data => {
            // Tangkap elemen-elemen placeholder di HTML
            const playerHeaderSpan = document.getElementById('onlinePlayerCountHeader');
            const statusDotNavbar = document.getElementById('statusDotNavbar');
            const statusTextNavbar = document.getElementById('statusTextNavbar');
            
            if (data.online) {
                // Server ONLINE
                console.log(`Server is ONLINE. Players: ${data.players.online}/${data.players.max}`);
                
                // Update jumlah player di Hero Section
                playerHeaderSpan.innerText = `${data.players.online} Players Online`;
                
                // Update status di Navbar (Dot & Teks)
                statusDotNavbar.classList.remove('bg-slate-600');
                statusDotNavbar.classList.add('bg-[#4CAF50]');
                statusTextNavbar.innerText = 'Server Online';
                statusTextNavbar.classList.remove('text-slate-500');
                statusTextNavbar.classList.add('text-white');

            } else {
                // Server OFFLINE
                console.log('Server is OFFLINE.');
                playerHeaderSpan.innerText = 'Server Offline';
                
                // Update status di Navbar (Dot & Teks)
                statusDotNavbar.classList.remove('bg-slate-600');
                statusDotNavbar.classList.remove('bg-[#4CAF50]');
                statusDotNavbar.classList.add('bg-red-600'); // Merah Offline
                statusTextNavbar.innerText = 'Offline';
                statusTextNavbar.classList.add('text-red-500');
            }
        })
        .catch(error => {
            // Error saat ping API
            console.error('Error fetching server status:', error);
            const statusTextNavbar = document.getElementById('statusTextNavbar');
            statusTextNavbar.innerText = 'Status Unknown';
        });
}

// Menangani URL Hash saat halaman dimuat pertama kali
window.addEventListener('load', () => {
    // Ambil hash URL (misal: #ranks)
    const currentHash = window.location.hash.substring(1); 
    if (currentHash) {
        // Tampilkan tab sesuai hash
        switchTab(currentHash);
    } else {
        // Default tampilkan home
        switchTab('home');
    }
    
    // Panggil fungsi ping server saat pertama dimuat
    updateServerStatus();
    
    // Ping ulang server setiap 30 detik agar datanya update
    setInterval(updateServerStatus, 30000); 
});
