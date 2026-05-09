let participants = [];
let editId = null;

// 1. Fungsi Utama: Render Tabel
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filter = document.getElementById('filterKelulusan').value;

    // MEMBERSIHKAN TABEL (Penting agar tidak double)
    tbody.innerHTML = "";

    const filtered = participants.filter(p => {
        const matchSearch = (p.nama && p.nama.toLowerCase().includes(search)) || 
                           (p.nim && p.nim.includes(search));
        const matchFilter = filter === "ALL" || p.keterangan === filter;
        return matchSearch && matchFilter;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = "<tr><td colspan='14' style='text-align:center'>Tidak ada data</td></tr>";
        return;
    }

    filtered.forEach((p, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${p.nim || ''}</td>
            <td>${p.nama || ''}</td>
            <td>${p.pekerjaanOrtu || ''}</td>
            <td>${p.kode || ''}</td>
            <td>${getLokasi(p.kode)}</td>
            <td>${p.jk || ''}</td>
            <td>${p.asalSekolah || ''}</td>
            <td>${p.mat || 0}</td>
            <td>${p.bindo || 0}</td>
            <td>${p.bing || 0}</td>
            <td>${p.rata || 0}</td>
            <td><b>${p.keterangan || ''}</b></td>
            <td class="action-icons">
                <i class="fas fa-edit" onclick="editData(${p.id})"></i>
                <i class="fas fa-trash-alt" onclick="hapusData(${p.id})"></i>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 2. Load Data dari Storage
function loadFromStorage() {
    const stored = localStorage.getItem("pmb_unpam_v1");
    if (stored) {
        participants = JSON.parse(stored);
    } else {
        participants = []; // Kosongkan jika belum ada data
    }
    renderStatistik();
    renderTable();
}

function syncStorage() {
    localStorage.setItem("pmb_unpam_v1", JSON.stringify(participants));
}

// 3. Logika Hitung
function hitungOtomatis() {
    const mat = +document.getElementById('mat').value || 0;
    const bindo = +document.getElementById('bindo').value || 0;
    const bing = +document.getElementById('binggris').value || 0;
    
    const rata = ((mat + bindo + bing) / 3).toFixed(2);
    document.getElementById('rata').value = rata;

    let ket = "Tidak Lulus";
    if (rata >= 70) ket = "Lulus";
    else if (rata >= 60) ket = "Cadangan";
    
    document.getElementById('keterangan').value = ket;
}

function getLokasi(kode) {
    if (!kode) return "-";
    const char = kode[0].toUpperCase();
    if (char === 'A') return "Gedung A";
    if (char === 'B') return "Gedung B";
    if (char === 'V') return "Viktor";
    return "Lainnya";
}

// 4. Operasi CRUD
function simpanData() {
    const nim = document.getElementById('nim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const pekerjaanOrtu = document.getElementById('pekerjaanOrtu').value.trim();
    
    if (!nim || !nama || !pekerjaanOrtu) {
        return Swal.fire("Error", "Isi NIM, Nama, dan Pekerjaan Ortu!", "error");
    }

    const data = {
        nim, nama, pekerjaanOrtu,
        kode: document.getElementById('kode').value.toUpperCase(),
        jk: document.getElementById('jk').value,
        asalSekolah: document.getElementById('asalSekolah').value,
        mat: +document.getElementById('mat').value,
        bindo: +document.getElementById('bindo').value,
        bing: +document.getElementById('binggris').value,
        rata: document.getElementById('rata').value,
        keterangan: document.getElementById('keterangan').value
    };

    if (editId) {
        const index = participants.findIndex(p => p.id === editId);
        if (index !== -1) participants[index] = { ...data, id: editId };
        editId = null;
    } else {
        participants.push({ ...data, id: Date.now() });
    }

    syncStorage();
    resetForm();
    renderStatistik();
    renderTable();
    Swal.fire("Berhasil", "Data telah diproses", "success");
}

function hapusData(id) {
    participants = participants.filter(p => p.id !== id);
    syncStorage();
    renderStatistik();
    renderTable();
}

function editData(id) {
    const p = participants.find(p => p.id === id);
    if (!p) return;
    document.getElementById('nim').value = p.nim;
    document.getElementById('nama').value = p.nama;
    document.getElementById('pekerjaanOrtu').value = p.pekerjaanOrtu;
    document.getElementById('kode').value = p.kode;
    document.getElementById('jk').value = p.jk;
    document.getElementById('asalSekolah').value = p.asalSekolah;
    document.getElementById('mat').value = p.mat;
    document.getElementById('bindo').value = p.bindo;
    document.getElementById('binggris').value = p.bing;
    hitungOtomatis();
    editId = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('nim').value = '';
    document.getElementById('nama').value = '';
    document.getElementById('pekerjaanOrtu').value = '';
    document.getElementById('kode').value = '';
    document.getElementById('jk').value = '';
    document.getElementById('asalSekolah').value = '';
    document.getElementById('mat').value = 0;
    document.getElementById('bindo').value = 0;
    document.getElementById('binggris').value = 0;
    document.getElementById('rata').value = '';
    document.getElementById('keterangan').value = '';
    editId = null;
}

function renderStatistik() {
    document.getElementById('statLulus').innerText = participants.filter(p => p.keterangan === "Lulus").length;
    document.getElementById('statCadangan').innerText = participants.filter(p => p.keterangan === "Cadangan").length;
    document.getElementById('statTidak').innerText = participants.filter(p => p.keterangan === "Tidak Lulus").length;
    document.getElementById('statTotal').innerText = participants.length;
}

// 5. Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    
    document.getElementById('btnSimpan').addEventListener('click', simpanData);
    document.getElementById('btnReset').addEventListener('click', resetForm);
    document.getElementById('searchInput').addEventListener('input', renderTable);
    document.getElementById('filterKelulusan').addEventListener('change', renderTable);
    document.getElementById('darkToggle').addEventListener('click', () => document.body.classList.toggle('dark'));
    
    ['mat','bindo','binggris'].forEach(id => {
        document.getElementById(id).addEventListener('input', hitungOtomatis);
    });
});
