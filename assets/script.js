function showFileNotification() {
    const fields = document.querySelectorAll(".required-field");
    let firstError = null;

    // sembunyikan pesan global dulu
    const globalError = document.getElementById("globalError");
    if (globalError) globalError.classList.add("d-none");

    fields.forEach(field => {
        const box = field.closest(".input-box");

        // VALIDASI KHUSUS RT & RW (3 digit)
        if (field.id === "rukun_tetangga_rt" || field.id === "rukun_warga_rw") {
            if (!/^\d{3}$/.test(field.value)) {
                box.classList.add("error");
                if (!firstError) firstError = field;
                return;
            }
        }

        // VALIDASI EMAIL
        if (field.type === "email" || field.id === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!field.value.trim() || !emailRegex.test(field.value.trim())) {
                box.classList.add("error");
                const errText = box.querySelector(".error-text");
                if (errText) errText.textContent = "Masukkan email yang valid (contoh: nama@gmail.com)";
                if (!firstError) firstError = field;
                return;
            } else {
                box.classList.remove("error");
            }
        }
        // VALIDASI FILE
        else if (field.type === "file") {
            if (!field.files || field.files.length === 0) {
                box.classList.add("error");
                if (!firstError) firstError = field;
            } else {
                box.classList.remove("error");
            }
        } 
        // VALIDASI UMUM
        else {
            if (!field.value.trim()) {
                box.classList.add("error");
                if (!firstError) firstError = field;
            } else {
                box.classList.remove("error");
            }
        }
    });

    // VALIDASI ANGGOTA PENELITI (jika pilih "Ada")
    const opsiAnggota = document.getElementById("opsi_anggota").value;
    if (opsiAnggota === "ada") {
        const inputs = document.querySelectorAll(".anggota-input");
        const adaYangIsi = Array.from(inputs).some(inp => inp.value.trim() !== "");
        const wrapper = document.getElementById("anggota-wrapper");
        if (!adaYangIsi || inputs.length === 0) {
            wrapper.classList.add("error");
            if (!firstError) firstError = document.getElementById("opsi_anggota");
        } else {
            wrapper.classList.remove("error");
            updateAnggotaHidden();
        }
    }

    // VALIDASI OPD
    const opdInputs = document.querySelectorAll(".opd-input");
    const opdWrapper = document.getElementById("opd-wrapper");
    const adaOPD = Array.from(opdInputs).some(inp => inp.value.trim() !== "");
    if (!adaOPD || opdInputs.length === 0) {
        opdWrapper.classList.add("error");
        if (!firstError) firstError = document.querySelector(".opd-input") || opdWrapper;
    } else {
        opdWrapper.classList.remove("error");
        updateOPDHidden();
    }

    // MASIH ADA ERROR
    if (firstError) {
        if (globalError) globalError.classList.remove("d-none");
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.focus();
        return;
    }

    if (typeof fillPreview === "function") fillPreview();

    document.getElementById("fileNotification").classList.remove("d-none");
}



document.addEventListener("input", function (e) {
    if (e.target.classList.contains("required-field")) {
        const box = e.target.closest(".input-box");
        if (e.target.value.trim()) {
            box.classList.remove("error");
        }
    }

    // kapital otomatis — pakai selectionRange biar kursor tidak loncat
    if (e.target.classList.contains("capitalize")) {
        const el = e.target;
        const start = el.selectionStart;
        const end   = el.selectionEnd;
        el.value = el.value.replace(/\b\w/g, c => c.toUpperCase());
        el.setSelectionRange(start, end);
    }
});


function toggleAnggota() {
    const opsi = document.getElementById("opsi_anggota").value;
    const wrapper = document.getElementById("anggota-wrapper");
    const hiddenField = document.getElementById("anggota_peneliti");

    if (opsi === "ada") {
        wrapper.style.display = "block";
        hiddenField.value = "";
        // Pastikan minimal ada 1 field
        if (document.querySelectorAll(".anggota-input").length === 0) {
            tambahAnggota();
        }
    } else {
        wrapper.style.display = "none";
        hiddenField.value = "-";
        // Bersihkan list
        document.getElementById("anggota-list").innerHTML = "";
    }
}

function tambahAnggota() {
    const list = document.getElementById("anggota-list");
    const index = list.children.length + 1;

    const row = document.createElement("div");
    row.className = "anggota-row";
    row.innerHTML = `
        <span class="anggota-nomor">${index}.</span>
        <input type="text"
            class="form-control anggota-input capitalize"
            placeholder="Nama Lengkap Anggota ${index}"
            oninput="updateAnggotaHidden(); capitalizeInput(this)">
        <button type="button" class="btn-hapus-anggota" onclick="hapusAnggota(this)" title="Hapus">
            <i class="bi bi-trash3"></i>
        </button>
    `;
    list.appendChild(row);
    updateAnggotaHidden();
}

function hapusAnggota(btn) {
    const row = btn.closest(".anggota-row");
    row.remove();
    // Renomor ulang
    document.querySelectorAll(".anggota-row").forEach((r, i) => {
        r.querySelector(".anggota-nomor").textContent = (i + 1) + ".";
        r.querySelector("input").placeholder = `Nama Lengkap Anggota ${i + 1}`;
    });
    updateAnggotaHidden();
}

function updateAnggotaHidden() {
    const inputs = document.querySelectorAll(".anggota-input");
    const filled = Array.from(inputs).filter(inp => inp.value.trim() !== "");
    let result = "";
    if (filled.length === 1) {
        result = filled[0].value.trim();
    } else {
        result = filled.map((inp, i) => `${i + 1}. ${inp.value.trim()}`).join(", ");
    }
    document.getElementById("anggota_peneliti").value = result;
}

function capitalizeInput(el) {
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    el.value = el.value.replace(/\b\w/g, c => c.toUpperCase());
    el.setSelectionRange(start, end);
}


function hideFileNotification() {
    // Hide the file notification
    let fileNotification = document.getElementById("fileNotification");
    fileNotification.classList.add("d-none");
}

function proceedToUpload() {
    let fileNotification = document.getElementById("fileNotification");
    fileNotification.classList.add("d-none");
    UploadFile();
}

// ===== DYNAMIC OPD =====
function tambahOPD() {
    const list = document.getElementById("opd-list");
    const index = list.children.length + 1;

    const row = document.createElement("div");
    row.className = "anggota-row";
    row.innerHTML = `
        <span class="anggota-nomor">${index}.</span>
        <input type="text"
            class="form-control capitalize opd-input"
            placeholder="Nama OPD / Bidang ke-${index}"
            oninput="updateOPDHidden(); capitalizeInput(this)">
        <button type="button" class="btn-hapus-anggota" onclick="hapusOPD(this)" title="Hapus">
            <i class="bi bi-trash3"></i>
        </button>
    `;
    list.appendChild(row);
    updateOPDHidden();
}

function hapusOPD(btn) {
    btn.closest(".anggota-row").remove();
    document.querySelectorAll("#opd-list .anggota-row").forEach((r, i) => {
        r.querySelector(".anggota-nomor").textContent = (i + 1) + ".";
        r.querySelector("input").placeholder = `Nama OPD / Bidang ke-${i + 1}`;
    });
    updateOPDHidden();
}

function updateOPDHidden() {
    const inputs = document.querySelectorAll(".opd-input");
    const filled = Array.from(inputs).filter(inp => inp.value.trim() !== "");
    let result = "";
    if (filled.length === 1) {
        result = filled[0].value.trim();
    } else {
        result = filled.map((inp, i) => `${i + 1}. ${inp.value.trim()}`).join(", ");
    }
    document.getElementById("lokasi").value = result;
}


function fillPreview() {
    document.getElementById("pvNama").textContent =
        document.getElementById("nama").value;

    document.getElementById("pvJudul").textContent =
        document.getElementById("proposal").value;

    document.getElementById("pvTanggal").textContent =
        document.getElementById("tanggal_mulai").value +
        " s/d " +
        document.getElementById("tanggal_selesai").value;

    const fileInput = document.getElementById("attach");
    document.getElementById("pvFile").textContent =
        fileInput.files.length ? fileInput.files[0].name : "-";

    document.getElementById("previewBox").classList.remove("d-none");
}


function UploadFile() {
    let submitBtn = document.querySelector(".btn-submit");
    let btnText = document.getElementById("btn-text");
    let loadingSpinner = document.getElementById("loading-spinner");

    let fileInput = document.getElementById("attach");
    let file = fileInput.files[0];

    if (!file) {
        showCustomAlert("Kamu belum memilih file! Silakan pilih file <strong>ZIP atau RAR</strong> terlebih dahulu.", "File Belum Dipilih", "📁");
        return;
    }

    const allowedExt = ["zip", "rar"];
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (!allowedExt.includes(fileExt)) {
        showCustomAlert("Format file tidak sesuai! File harus berformat <strong>ZIP atau RAR</strong>.", "Format Salah", "❌");
        return;
    }

    btnText.textContent = "MENGIRIM...";
    submitBtn.style.backgroundColor = "#f39c12";
    loadingSpinner.classList.remove("d-none");
    submitBtn.disabled = true;

    let loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
    loadingModal.show();

    // Animasi progress bar & label
    const progressFill = document.getElementById("loadingProgressFill");
    const progressLabel = document.getElementById("loadingProgressLabel");
    const tipsText = document.getElementById("loadingTipsText");

    const steps = [
        { pct: 15, label: "Membaca file..." },
        { pct: 35, label: "Mengemas data formulir..." },
        { pct: 55, label: "Mengunggah ke server..." },
        { pct: 75, label: "Memproses di server..." },
        { pct: 90, label: "Hampir selesai..." },
    ];

    const tips = [
        "Proses pengiriman biasanya memakan waktu 10–30 detik tergantung ukuran file.",
        "Pastikan koneksi internet stabil agar data terkirim dengan sempurna.",
        "Setelah terkirim, notifikasi akan dikirim ke email yang kamu daftarkan.",
        "Jangan refresh atau tutup halaman saat proses pengiriman berlangsung.",
    ];

    let stepIndex = 0;
    let tipIndex = 0;

    if (progressFill) progressFill.style.width = "5%";

    const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
            if (progressFill) progressFill.style.width = steps[stepIndex].pct + "%";
            if (progressLabel) progressLabel.textContent = steps[stepIndex].label;
            stepIndex++;
        }
    }, 2500);

    const tipsInterval = setInterval(() => {
        tipIndex = (tipIndex + 1) % tips.length;
        if (tipsText) {
            tipsText.style.opacity = "0";
            setTimeout(() => {
                tipsText.textContent = tips[tipIndex];
                tipsText.style.opacity = "1";
            }, 300);
        }
    }, 5000);

    let reader = new FileReader();
    reader.onload = function () {
        document.getElementById("fileContent").value = reader.result;
        document.getElementById("filename").value = file.name;

        fetch(document.getElementById("uploadForm").action, {
            method: "POST",
            body: new FormData(document.getElementById("uploadForm"))
        })
        .then(res => res.json())
        .then(() => {
            if (progressFill) progressFill.style.width = "100%";
            if (progressLabel) progressLabel.textContent = "Data berhasil dikirim! ✅";
            matikanAntiRefresh(); // matikan warning refresh
            setTimeout(() => {
                document.getElementById("uploadForm").reset();
                document.getElementById("notification").classList.remove("d-none");
            }, 600);
        })
        .catch(() => {
            showCustomAlert("Gagal mengirim data. Periksa koneksi internet kamu dan coba lagi.", "Gagal Mengirim", "❌");
        })
        .finally(() => {
            clearInterval(progressInterval);
            clearInterval(tipsInterval);
            btnText.textContent = "KIRIM DATA";
            submitBtn.style.backgroundColor = "#2c3e50";
            loadingSpinner.classList.add("d-none");
            submitBtn.disabled = false;
            loadingModal.hide();
        });
    };

    reader.readAsDataURL(file);
}

// Tampilkan popup saat halaman dibuka + auto tambah 1 OPD
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('popupModal').style.display = 'flex';
    tambahOPD(); // auto tambah 1 field OPD
});

function closePopup() {
    document.getElementById('popupModal').style.display = 'none';
}
function onlyThreeDigits(el) {
    el.value = el.value.replace(/\D/g, ""); // hanya angka
    if (el.value.length > 3) {
        el.value = el.value.slice(0, 3);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const today = new Date().toISOString().split("T")[0];

    const start = document.getElementById("tanggal_mulai");
    const end = document.getElementById("tanggal_selesai");
    const surat = document.getElementById("tgl_surat");

    // tanggal_mulai TIDAK dikunci ke hari ini — bebas pilih
    surat.max = today;

    start.addEventListener("change", () => {
        const startDate = new Date(start.value);
        const maxEnd = new Date(startDate);
        maxEnd.setMonth(maxEnd.getMonth() + 6);

        end.min = start.value;
        end.max = maxEnd.toISOString().split("T")[0];
        end.value = "";
    });

    end.addEventListener("change", () => {
        const limit = new Date(start.value);
        limit.setMonth(limit.getMonth() + 6);

        if (new Date(end.value) > limit) {
            showCustomAlert("Durasi penelitian maksimal <strong>6 bulan</strong> dari tanggal mulai.", "Tanggal Tidak Valid", "📅");
            end.value = "";
        }
    });
});

// ===== CUSTOM MODAL FUNCTIONS =====
function showCustomAlert(msg, title = "Perhatian", icon = "⚠️") {
  document.getElementById("customAlertMsg").innerHTML = msg;
  document.getElementById("customAlertTitle").textContent = title;
  document.getElementById("customAlertIcon").textContent = icon;
  document.getElementById("customAlert").style.display = "flex";
}

function closeCustomAlert() {
  document.getElementById("customAlert").style.display = "none";
}

function konfirmasiReset() {
  document.getElementById("customConfirmReset").style.display = "flex";
}

function closeCustomConfirmReset() {
  document.getElementById("customConfirmReset").style.display = "none";
}

function doReset() {
  closeCustomConfirmReset();
  document.getElementById("uploadForm").reset();

  // Reset OPD list — hapus semua, tambah 1 field kosong
  document.getElementById("opd-list").innerHTML = "";
  tambahOPD();
  document.getElementById("opd-wrapper").classList.remove("error");

  // Reset anggota list
  document.getElementById("anggota-list").innerHTML = "";
  document.getElementById("anggota-wrapper").style.display = "none";
  document.getElementById("anggota-wrapper").classList.remove("error");

  // Sembunyikan preview box & global error
  document.getElementById("previewBox").classList.add("d-none");
  const ge = document.getElementById("globalError");
  if (ge) ge.classList.add("d-none");

  // Bersihkan semua error state
  document.querySelectorAll(".input-box.error").forEach(el => el.classList.remove("error"));

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function konfirmasiKembali() {
  document.getElementById("customConfirmBack").style.display = "flex";
}

function closeCustomConfirmBack() {
  document.getElementById("customConfirmBack").style.display = "none";
}

function doKembali() {
  formDiisi = false;
  window.location.href = "index.html";
}

// Tutup modal kalau klik di luar box
document.addEventListener("DOMContentLoaded", function () {
  ["customAlert", "customConfirmReset", "customConfirmBack"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", function (e) {
        if (e.target === this) this.style.display = "none";
      });
    }
  });
});

let formDiisi = false;

// Deteksi kalau user sudah mulai mengisi form
document.addEventListener("input", function(e) {
    if (e.target.closest("#uploadForm")) {
        formDiisi = true;
    }
});

window.addEventListener("beforeunload", function(e) {
    // Jangan tampilkan kalau form sudah berhasil dikirim
    if (formDiisi) {
        const pesan = "Data yang sudah kamu isi akan hilang jika meninggalkan halaman. Yakin ingin keluar?";
        e.preventDefault();
        e.returnValue = pesan;
        return pesan;
    }
});

// Matikan warning setelah berhasil kirim
function matikanAntiRefresh() {
    formDiisi = false;
}

// ===== DRAG & DROP visual state untuk file upload =====
(function() {
    const area = document.querySelector(".file-upload-area");
    if (!area) return;
    ["dragenter","dragover"].forEach(ev => {
        area.addEventListener(ev, e => { e.preventDefault(); area.classList.add("dragover"); });
    });
    ["dragleave","drop"].forEach(ev => {
        area.addEventListener(ev, () => area.classList.remove("dragover"));
    });
})();

// ===== RIPPLE EFFECT pada tombol submit =====
(function() {
    const btn = document.querySelector(".btn-submit");
    if (!btn) return;
    btn.addEventListener("click", function(e) {
        const circle = document.createElement("span");
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius   = diameter / 2;
        const rect     = btn.getBoundingClientRect();
        circle.style.cssText = `
            width:${diameter}px; height:${diameter}px;
            left:${e.clientX - rect.left - radius}px;
            top:${e.clientY - rect.top - radius}px;
        `;
        circle.classList.add("ripple");
        btn.querySelector(".ripple")?.remove();
        btn.appendChild(circle);
    });
})();

// ===== SCROLL ENTRANCE ANIMATION untuk section-group =====
(function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("section-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll(".section-group").forEach((el, i) => {
        el.style.animationDelay = `${i * 0.07}s`;
        el.classList.add("section-hidden");
        observer.observe(el);
    });
})();