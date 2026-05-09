let participants = [];
let editId = null;

// Ambil data dari LocalStorage
function loadFromStorage() {
    const stored = localStorage.getItem("pmb_unpam_v1");
    if (stored) {
        participants = JSON.parse(stored);
    }
    renderStatistik();
    renderTable();
}

function syncStorage() {
    localStorage.setItem("pmb_unpam_v1", JSON.stringify(participants));
}

// Logika Hitung Otomatis
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

// Event listener untuk input nilai
['mat','bindo','binggris'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', hitungOtomatis);
});

// Penentuan Lokasi dari Kode
function getLokasi(kode) {
    if (!kode) return "-";
    const char = kode[0].toUpperCase();
    if (char === 'A') return "Gedung A";
    if (char === 'B') return "Gedung B";
    if (char === 'V') return "Viktor";
    return "Lainnya";
}

// Simpan Data
function simpanData() {
    const nim = document.getElementById('nim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const pekerjaanOrtu = document.getElementById('pekerjaanOrtu').value.trim();
    const kode = document.getElementById('kode').value.toUpperCase();
    const jk = document.getElementById('jk').value;
    const asalSekolah = document.getElementById('asalSekolah').value;
    const mat = +document.getElementById('mat').value;
    const bindo = +document.getElementById('bindo').value;
    const bing = +document.getElementById('binggris').value;
    const rata = document.getElementById('rata').value;
    const keterangan = document.getElementById('keterangan').value;

    if (!nim || !nama || !pekerjaanOrtu) {
        return Swal.fire("Error", "Mohon isi NIM, Nama, dan Pekerjaan Ortu!", "error");
    }

    if (editId) {
        const index = participants.findIndex(p => p.id === editId);
        if (index !== -1) {
            participants[index] = { id: editId, nim, nama, pekerjaanOrtu, kode, jk, asalSekolah, mat, bindo, bing, rata, keterangan };
        }
        editId = null;
        Swal.fire("Berhasil", "Data diperbarui!", "success");
    } else {
        participants.push({ id: Date.now(), nim, nama, pekerjaanOrtu, kode, jk, asalSekolah, mat, bindo, bing, rata, keterangan });
        Swal.fire("Berhasil", "Data disimpan!", "success");
    }

    syncStorage();
    resetForm();
    renderStatistik();
    renderTable();
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

function hapusData(id) {
    Swal.fire({
        title: 'Hapus data?',
        text: "Data tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            participants = participants.filter(p => p.id !== id);
            syncStorage();
            renderStatistik();
            renderTable();
            Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        }
    });
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filter = document.getElementById('filterKelulusan').value;

    // PENTING: Kosongkan tabel sebelum render ulang agar tidak double
    tbody.innerHTML = "";

    const filtered = participants.filter(p => {
        const matchSearch = p.nama.toLowerCase().includes(search) || p.nim.includes(search);
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
            <td>${p.nim}</td>
            <td>${p.nama}</td>
            <td>${p.pekerjaanOrtu}</td>
            <td>${p.kode}</td>
            <td>${getLokasi(p.kode)}</td>
            <td>${p.jk}</td>
            <td>${p.asalSekolah}</td>
            <td>${p.mat}</td>
            <td>${p.bindo}</td>
            <td>${p.bing}</td>
            <td>${p.rata}</td>
            <td><b>${p.keterangan}</b></td>
            <td class="action-icons">
                <i class="fas fa-edit" onclick="editData(${p.id})"></i>
                <i class="fas fa-trash-alt" onclick="hapusData(${p.id})"></i>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderStatistik() {
    document.getElementById('statLulus').innerText = participants.filter(p => p.keterangan === "Lulus").length;
    document.getElementById('statCadangan').innerText = participants.filter(p => p.keterangan === "Cadangan").length;
    document.getElementById('statTidak').innerText = participants.filter(p => p.keterangan === "Tidak Lulus").length;
    document.getElementById('statTotal').innerText = participants.length;
}

// Event Listeners
document.getElementById('btnSimpan').addEventListener('click', simpanData);
document.getElementById('btnReset').addEventListener('click', resetForm);
document.getElementById('searchInput').addEventListener('input', renderTable);
document.getElementById('filterKelulusan').addEventListener('change', renderTable);

// Dark Mode Toggle
document.getElementById('darkToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
});
