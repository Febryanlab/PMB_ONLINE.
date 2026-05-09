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

['mat','bindo','binggris'].forEach(id => {
    document.getElementById(id).addEventListener('input', hitungOtomatis);
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
    const data = {
        nim: document.getElementById('nim').value,
        nama: document.getElementById('nama').value,
        pekerjaanOrtu: document.getElementById('pekerjaanOrtu').value,
        kode: document.getElementById('kode').value.toUpperCase(),
        jk: document.getElementById('jk').value,
        asalSekolah: document.getElementById('asalSekolah').value,
        mat: +document.getElementById('mat').value,
        bindo: +document.getElementById('bindo').value,
        bing: +document.getElementById('binggris').value,
        rata: document.getElementById('rata').value,
        keterangan: document.getElementById('keterangan').value
    };

    if (!data.nim || !data.nama || !data.pekerjaanOrtu) {
        return Swal.fire("Error", "Mohon isi NIM, Nama, dan Pekerjaan Ortu!", "error");
    }

    if (editId) {
        const index = participants.findIndex(p => p.id === editId);
        participants[index] = { ...data, id: editId };
        editId = null;
        Swal.fire("Berhasil", "Data diperbarui!", "success");
    } else {
        participants.push({ ...data, id: Date.now() });
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
    participants = participants.filter(p => p.id !== id);
    syncStorage();
    renderStatistik();
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filter = document.getElementById('filterKelulusan').value;

    tbody.innerHTML = "";
    const filtered = participants.filter(p => {
        const matchSearch = p.nama.toLowerCase().includes(search) || p.nim.includes(search);
        const matchFilter = filter === "ALL" || p.keterangan === filter;
        return matchSearch && matchFilter;
    });

    filtered.forEach((p, i) => {
        const row = `<tr>
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
        </tr>`;
        tbody.innerHTML += row;
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

loadFromStorage();['mat','bindo','binggris'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => hitungRataDanKeterangan());
});

function validasiKode(kode) {
    if (!kode || kode.length !== 2) return { valid: false, message: "Kode harus 2 karakter!" };
    const first = kode[0].toUpperCase();
    const second = kode[1].toUpperCase();
    if (!['A','B','V'].includes(first)) return { valid: false, message: "Karakter awal harus A, B, atau V!" };
    const bulanValid = ['1','2','3','4','5','6','7','8','9','O','N','D'];
    if (!bulanValid.includes(second)) return { valid: false, message: "Karakter kedua: 1-9/O/N/D" };
    return { valid: true };
}
function getGedungDanBulan(kode) {
    if (!kode || kode.length !== 2) return "?";
    const first = kode[0].toUpperCase();
    const gedung = first === 'A' ? 'Gedung A' : (first === 'B' ? 'Gedung B' : 'Viktor');
    const second = kode[1].toUpperCase();
    const bulanMap = { '1':'Jan','2':'Feb','3':'Mar','4':'Apr','5':'Mei','6':'Jun','7':'Jul','8':'Agu','9':'Sep','O':'Okt','N':'Nov','D':'Des' };
    return `${gedung} (${bulanMap[second] || '?'})`;
}

function resetForm() {
    document.getElementById('nim').value = '';
    document.getElementById('nama').value = '';
    document.getElementById('kode').value = '';
    document.getElementById('jk').value = '';
    document.getElementById('asalSekolah').value = '';
    document.getElementById('mat').value = '0';
    document.getElementById('bindo').value = '0';
    document.getElementById('binggris').value = '0';
    hitungRataDanKeterangan();
    editId = null;
}

function simpanData() {
    const nim = document.getElementById('nim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const kode = document.getElementById('kode').value.trim().toUpperCase();
    const jk = document.getElementById('jk').value;
    const asal = document.getElementById('asalSekolah').value.trim();
    let mat = +document.getElementById('mat').value;
    let bindo = +document.getElementById('bindo').value;
    let bing = +document.getElementById('binggris').value;

    if (!nim || !nama || !kode || !jk || !asal) return Swal.fire("Error", "Semua field harus diisi!", "error");
    if (isNaN(mat) || isNaN(bindo) || isNaN(bing)) return Swal.fire("Error", "Nilai harus angka", "error");
    mat = Math.min(100, Math.max(0, mat));
    bindo = Math.min(100, Math.max(0, bindo));
    bing = Math.min(100, Math.max(0, bing));
    const valid = validasiKode(kode);
    if (!valid.valid) return Swal.fire("Kode tidak valid", valid.message, "warning");

    const rataFix = (mat + bindo + bing) / 3;
    let ketFix = rataFix >= 70 ? "Lulus" : (rataFix >= 60 ? "Cadangan" : "Tidak Lulus");
    const rataRounded = parseFloat(rataFix.toFixed(2));

    if (editId !== null) {
        const idx = participants.findIndex(p => p.id === editId);
        if (idx !== -1) {
            participants[idx] = { ...participants[idx], nim, nama, kode, jenisKelamin: jk, asalSekolah: asal, nilaiMat: mat, nilaiBindo: bindo, nilaiInggris: bing, rataRata: rataRounded, keterangan: ketFix };
            Swal.fire("Update", "Data berhasil diperbarui", "success");
        } else return Swal.fire("Error", "Data tidak ditemukan", "error");
    } else {
        const newId = Date.now();
        participants.push({ id: newId, nim, nama, kode, jenisKelamin: jk, asalSekolah: asal, nilaiMat: mat, nilaiBindo: bindo, nilaiInggris: bing, rataRata: rataRounded, keterangan: ketFix });
        Swal.fire("Tersimpan", "Pendaftaran sukses", "success");
    }
    syncStorage();
    resetForm();
    editId = null;
    renderStatistik();
    renderTable();
}

function hapusData(id) {
    Swal.fire({ title: "Hapus data?", text: "Data akan dihapus permanen", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Ya, hapus!" })
        .then(res => {
            if (res.isConfirmed) {
                participants = participants.filter(p => p.id !== id);
                syncStorage();
                renderStatistik();
                renderTable();
                Swal.fire("Terhapus", "", "success");
                if (editId === id) resetForm();
            }
        });
}
function editData(id) {
    const p = participants.find(p => p.id === id);
    if (!p) return;
    editId = id;
    document.getElementById('nim').value = p.nim;
    document.getElementById('nama').value = p.nama;
    document.getElementById('kode').value = p.kode;
    document.getElementById('jk').value = p.jenisKelamin;
    document.getElementById('asalSekolah').value = p.asalSekolah;
    document.getElementById('mat').value = p.nilaiMat;
    document.getElementById('bindo').value = p.nilaiBindo;
    document.getElementById('binggris').value = p.nilaiInggris;
    hitungRataDanKeterangan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getFilteredData() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filter = document.getElementById('filterKelulusan').value;
    let filtered = [...participants];
    if (search) filtered = filtered.filter(p => p.nim.includes(search) || p.nama.toLowerCase().includes(search) || p.asalSekolah.toLowerCase().includes(search));
    if (filter !== "ALL") filtered = filtered.filter(p => p.keterangan === filter);
    return filtered;
}

function renderTable() {
    const data = getFilteredData();
    const tbody = document.getElementById('tableBody');
    if (data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='13' style='text-align:center'>Tidak ada data pendaftar</td></tr>";
        return;
    }
    tbody.innerHTML = "";
    data.forEach((p, i) => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = i + 1;
        row.insertCell(1).innerText = p.nim;
        row.insertCell(2).innerText = p.nama;
        row.insertCell(3).innerText = p.kode;
        row.insertCell(4).innerText = getGedungDanBulan(p.kode);
        row.insertCell(5).innerText = p.jenisKelamin;
        row.insertCell(6).innerText = p.asalSekolah;
        row.insertCell(7).innerText = p.nilaiMat;
        row.insertCell(8).innerText = p.nilaiBindo;
        row.insertCell(9).innerText = p.nilaiInggris;
        row.insertCell(10).innerText = p.rataRata;
        let badge = p.keterangan === "Lulus" ? "✅ Lulus" : (p.keterangan === "Cadangan" ? "⚠️ Cadangan" : "❌ Tidak Lulus");
        row.insertCell(11).innerHTML = `<strong>${badge}</strong>`;
        const act = row.insertCell(12);
        act.className = "action-icons";
        act.innerHTML = `<i class="fas fa-edit" data-id="${p.id}"></i> <i class="fas fa-trash-alt" data-id="${p.id}"></i>`;
    });
    document.querySelectorAll('.fa-edit').forEach(icon => icon.addEventListener('click', e => editData(parseInt(icon.dataset.id))));
    document.querySelectorAll('.fa-trash-alt').forEach(icon => icon.addEventListener('click', e => hapusData(parseInt(icon.dataset.id))));
}

function renderStatistik() {
    document.getElementById('statLulus').innerText = participants.filter(p => p.keterangan === "Lulus").length;
    document.getElementById('statCadangan').innerText = participants.filter(p => p.keterangan === "Cadangan").length;
    document.getElementById('statTidak').innerText = participants.filter(p => p.keterangan === "Tidak Lulus").length;
    document.getElementById('statTotal').innerText = participants.length;
}

function initDarkMode() {
    const toggle = document.getElementById('darkToggle');
    const dark = localStorage.getItem('darkMode_v4') === 'true';
    if (dark) document.body.classList.add('dark');
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode_v4', document.body.classList.contains('dark'));
    });
}

document.getElementById('btnSimpan').addEventListener('click', simpanData);
document.getElementById('btnReset').addEventListener('click', () => { resetForm(); editId = null; Swal.fire("Reset", "Form dikosongkan", "info"); });
document.getElementById('searchInput').addEventListener('input', renderTable);
document.getElementById('filterKelulusan').addEventListener('change', renderTable);

document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initDarkMode();
    hitungRataDanKeterangan();
    renderTable();
});
