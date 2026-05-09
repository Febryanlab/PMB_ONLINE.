let participants = [];
let editId = null;

function loadFromStorage() {
    const stored = localStorage.getItem("univ_pendaftaran_v4");
    if (stored) {
        participants = JSON.parse(stored);
    } else {
        participants = [
            { 
                id: 1, nim: "202411001", nama: "Ahmad Fauzi", tempatLahir: "Jakarta", tanggalLahir: "2005-03-15",
                kode: "A3", jenisKelamin: "Laki-laki", asalSekolah: "SMA 1 Pamulang", 
                pekerjaanOrtu: "PNS/TNI/Polri", nilaiMat: 85, nilaiBindo: 78, nilaiInggris: 80, 
                rataRata: 81, keterangan: "Lulus" 
            },
            { 
                id: 2, nim: "202411002", nama: "Siti Nurhaliza", tempatLahir: "Tangerang", tanggalLahir: "2006-07-22",
                kode: "B7", jenisKelamin: "Perempuan", asalSekolah: "SMAN 2 Tangerang", 
                pekerjaanOrtu: "Karyawan Swasta", nilaiMat: 65, nilaiBindo: 70, nilaiInggris: 68, 
                rataRata: 67.67, keterangan: "Cadangan" 
            },
            { 
                id: 3, nim: "202411003", nama: "Budi Santoso", tempatLahir: "Depok", tanggalLahir: "2005-11-30",
                kode: "V1", jenisKelamin: "Laki-laki", asalSekolah: "SMA Cendekia", 
                pekerjaanOrtu: "Wiraswasta", nilaiMat: 45, nilaiBindo: 50, nilaiInggris: 48, 
                rataRata: 47.67, keterangan: "Tidak Lulus" 
            }
        ];
        syncStorage();
    }
    renderStatistik();
    renderTable();
}

function syncStorage() { 
    localStorage.setItem("univ_pendaftaran_v4", JSON.stringify(participants)); 
}

function hitungRataDanKeterangan() {
    let mat = +document.getElementById('mat').value || 0;
    let bindo = +document.getElementById('bindo').value || 0;
    let bing = +document.getElementById('binggris').value || 0;
    mat = Math.min(100, Math.max(0, mat));
    bindo = Math.min(100, Math.max(0, bindo));
    bing = Math.min(100, Math.max(0, bing));
    const rata = ((mat + bindo + bing) / 3).toFixed(2);
    document.getElementById('rata').value = rata;
    let keterangan = "";
    if (rata >= 70) keterangan = "Lulus";
    else if (rata >= 60) keterangan = "Cadangan";
    else keterangan = "Tidak Lulus";
    document.getElementById('keterangan').value = keterangan;
    return { rata: parseFloat(rata), keterangan };
}

['mat', 'bindo', 'binggris'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => hitungRataDanKeterangan());
});

function formatTanggal(tanggal) {
    if (!tanggal) return "-";
    const tgl = new Date(tanggal);
    const hari = tgl.getDate();
    const bulan = tgl.getMonth() + 1;
    const tahun = tgl.getFullYear();
    return `${hari.toString().padStart(2, '0')}/${bulan.toString().padStart(2, '0')}/${tahun}`;
}

function validasiKode(kode) {
    if (!kode || kode.length !== 2) return { valid: false, message: "Kode harus 2 karakter!" };
    const first = kode[0].toUpperCase();
    const second = kode[1].toUpperCase();
    if (!['A', 'B', 'V'].includes(first)) return { valid: false, message: "Karakter awal harus A, B, atau V!" };
    const bulanValid = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'O', 'N', 'D'];
    if (!bulanValid.includes(second)) return { valid: false, message: "Karakter kedua: 1-9/O/N/D" };
    return { valid: true };
}

function getGedungDanBulan(kode) {
    if (!kode || kode.length !== 2) return "?";
    const first = kode[0].toUpperCase();
    const gedung = first === 'A' ? 'Gedung A' : (first === 'B' ? 'Gedung B' : 'Viktor');
    const second = kode[1].toUpperCase();
    const bulanMap = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mei', '6': 'Jun', '7': 'Jul', '8': 'Agu', '9': 'Sep', 'O': 'Okt', 'N': 'Nov', 'D': 'Des' };
    return `${gedung} (${bulanMap[second] || '?'})`;
}

function resetForm() {
    document.getElementById('nim').value = '';
    document.getElementById('nama').value = '';
    document.getElementById('tempatLahir').value = '';
    document.getElementById('tanggalLahir').value = '';
    document.getElementById('kode').value = '';
    document.getElementById('jk').value = '';
    document.getElementById('asalSekolah').value = '';
    document.getElementById('pekerjaanOrtu').value = '';
    document.getElementById('mat').value = '0';
    document.getElementById('bindo').value = '0';
    document.getElementById('binggris').value = '0';
    hitungRataDanKeterangan();
    editId = null;
}

function simpanData() {
    const nim = document.getElementById('nim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const tempatLahir = document.getElementById('tempatLahir').value.trim();
    const tanggalLahir = document.getElementById('tanggalLahir').value;
    const kode = document.getElementById('kode').value.trim().toUpperCase();
    const jk = document.getElementById('jk').value;
    const asal = document.getElementById('asalSekolah').value.trim();
    const pekerjaanOrtu = document.getElementById('pekerjaanOrtu').value;
    let mat = +document.getElementById('mat').value;
    let bindo = +document.getElementById('bindo').value;
    let bing = +document.getElementById('binggris').value;

    if (!nim || !nama || !tempatLahir || !tanggalLahir || !kode || !jk || !asal || !pekerjaanOrtu) {
        return Swal.fire("Error", "Semua field harus diisi!", "error");
    }
    if (isNaN(mat) || isNaN(bindo) || isNaN(bing)) {
        return Swal.fire("Error", "Nilai harus angka", "error");
    }
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
            participants[idx] = { 
                ...participants[idx], 
                nim, nama, tempatLahir, tanggalLahir, kode, jenisKelamin: jk, asalSekolah: asal, pekerjaanOrtu,
                nilaiMat: mat, nilaiBindo: bindo, nilaiInggris: bing, 
                rataRata: rataRounded, keterangan: ketFix 
            };
            Swal.fire("Update", "Data berhasil diperbarui", "success");
        } else return Swal.fire("Error", "Data tidak ditemukan", "error");
    } else {
        const newId = Date.now();
        participants.push({ 
            id: newId, nim, nama, tempatLahir, tanggalLahir, kode, jenisKelamin: jk, asalSekolah: asal, pekerjaanOrtu,
            nilaiMat: mat, nilaiBindo: bindo, nilaiInggris: bing, 
            rataRata: rataRounded, keterangan: ketFix 
        });
        Swal.fire("Tersimpan", "Pendaftaran sukses", "success");
    }
    syncStorage();
    resetForm();
    editId = null;
    renderStatistik();
    renderTable();
}

function hapusData(id) {
    Swal.fire({ 
        title: "Hapus data?", 
        text: "Data akan dihapus permanen", 
        icon: "warning", 
        showCancelButton: true, 
        confirmButtonColor: "#d33", 
        confirmButtonText: "Ya, hapus!" 
    }).then(res => {
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
    document.getElementById('tempatLahir').value = p.tempatLahir || '';
    document.getElementById('tanggalLahir').value = p.tanggalLahir || '';
    document.getElementById('kode').value = p.kode;
    document.getElementById('jk').value = p.jenisKelamin;
    document.getElementById('asalSekolah').value = p.asalSekolah;
    document.getElementById('pekerjaanOrtu').value = p.pekerjaanOrtu || '';
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
    if (search) {
        filtered = filtered.filter(p => 
            p.nim.includes(search) || 
            p.nama.toLowerCase().includes(search) || 
            (p.asalSekolah && p.asalSekolah.toLowerCase().includes(search))
        );
    }
    if (filter !== "ALL") filtered = filtered.filter(p => p.keterangan === filter);
    return filtered;
}

function renderTable() {
    const data = getFilteredData();
    const tbody = document.getElementById('tableBody');
    if (data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='16' style='text-align:center'>Tidak ada data pendaftar</td></tr>";
        return;
    }
    tbody.innerHTML = "";
    data.forEach((p, i) => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = i + 1;
        row.insertCell(1).innerText = p.nim;
        row.insertCell(2).innerText = p.nama;
        row.insertCell(3).innerText = p.tempatLahir || '-';
        row.insertCell(4).innerText = formatTanggal(p.tanggalLahir);
        row.insertCell(5).innerText = p.kode;
        row.insertCell(6).innerText = getGedungDanBulan(p.kode);
        row.insertCell(7).innerText = p.jenisKelamin;
        row.insertCell(8).innerText = p.asalSekolah;
        row.insertCell(9).innerText = p.pekerjaanOrtu || '-';
        row.insertCell(10).innerText = p.nilaiMat;
        row.insertCell(11).innerText = p.nilaiBindo;
        row.insertCell(12).innerText = p.nilaiInggris;
        row.insertCell(13).innerText = p.rataRata;
        let badge = p.keterangan === "Lulus" ? "✅ Lulus" : (p.keterangan === "Cadangan" ? "⚠️ Cadangan" : "❌ Tidak Lulus");
        row.insertCell(14).innerHTML = `<strong>${badge}</strong>`;
        const act = row.insertCell(15);
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

// Event Listeners
document.getElementById('btnSimpan').addEventListener('click', simpanData);
document.getElementById('btnReset').addEventListener('click', () => { 
    resetForm(); 
    editId = null; 
    Swal.fire("Reset", "Form dikosongkan", "info"); 
});
document.getElementById('searchInput').addEventListener('input', renderTable);
document.getElementById('filterKelulusan').addEventListener('change', renderTable);

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initDarkMode();
    hitungRataDanKeterangan();
    renderTable();
});
