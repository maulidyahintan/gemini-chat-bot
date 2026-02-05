# Demo: Cara Menggunakan Fitur Spreadsheet

## Langkah-Langkah Penggunaan

### 1. Buka Aplikasi Chatbot
- Jalankan server dengan `node index.js`
- Buka browser dan akses `http://localhost:3000`

### 2. Minta Chatbot Membuat Spreadsheet

Contoh permintaan yang bisa Anda gunakan:

```
Buatkan spreadsheet daftar mahasiswa dengan 5 data
```

```
Bisa buatkan spreadsheet data penjualan?
```

```
Generate spreadsheet inventaris barang dengan kolom Kode, Nama, Stok, Harga
```

### 3. Chatbot Akan Merespons

Chatbot akan:
1. Menghasilkan data dalam format JSON
2. Menampilkan penjelasan tentang spreadsheet
3. Menampilkan tombol hijau **"Download Spreadsheet"**

Contoh response:
```
SPREADSHEET_DATA:
[
  {"Nama": "Ahmad Pratama", "NIM": "A001", "Jurusan": "Teknik Informatika"},
  {"Nama": "Siti Nurhaliza", "NIM": "A002", "Jurusan": "Sistem Informasi"},
  ...
]

Saya telah membuat spreadsheet dengan daftar 5 mahasiswa. 
Spreadsheet ini berisi kolom Nama, NIM, dan Jurusan.
```

### 4. Download Spreadsheet

Klik tombol hijau **"Download Spreadsheet"** yang muncul di bawah response.

File Excel (.xlsx) akan otomatis terunduh dengan nama format:
```
spreadsheet_1234567890.xlsx
```

### 5. Buka File Excel

Buka file yang sudah diunduh dengan:
- Microsoft Excel
- Google Sheets
- LibreOffice Calc
- Atau aplikasi spreadsheet lainnya

## Fitur Utama

### ✅ Yang Bisa Dilakukan:
- Membuat spreadsheet dengan berbagai tema (mahasiswa, penjualan, inventaris, dll)
- Menentukan kolom yang diinginkan
- Menentukan jumlah baris data
- Download langsung sebagai file Excel (.xlsx)
- Data dapat diedit di aplikasi spreadsheet favorit

### 🎯 Tips Penggunaan:
1. **Jelas dan Spesifik**: "Buatkan spreadsheet dengan 10 data karyawan, kolom: Nama, Posisi, Gaji"
2. **Berikan Konteks**: "Spreadsheet untuk laporan penjualan bulanan"
3. **Sebutkan Jumlah**: "5 data", "10 baris", "15 mahasiswa"
4. **Definisikan Kolom**: "dengan kolom A, B, dan C"

### 💡 Contoh Penggunaan Lanjutan

#### Spreadsheet Penjualan Produk:
```
Buatkan spreadsheet data penjualan dengan kolom:
- Tanggal
- Produk
- Jumlah Terjual
- Total Harga
Buat untuk 7 hari terakhir
```

#### Spreadsheet Daftar Tugas:
```
Bisa buatkan spreadsheet todo list dengan kolom:
- No
- Tugas
- Prioritas
- Status
- Deadline
Buat 10 contoh tugas
```

#### Spreadsheet Kontak:
```
Generate spreadsheet daftar kontak dengan:
- Nama
- Email
- Telepon
- Alamat
Buatkan 8 data contoh
```

## Troubleshooting

### Tombol Download Tidak Muncul
**Solusi:**
- Pastikan request Anda jelas menyebutkan "spreadsheet" atau "tabel"
- Coba gunakan kata kunci: "buatkan", "generate", "buat spreadsheet"

### File Tidak Terunduh
**Solusi:**
- Check pop-up blocker browser
- Pastikan browser mengizinkan download
- Cek folder Downloads

### Data Tidak Sesuai Harapan
**Solusi:**
- Buat request yang lebih detail
- Sebutkan semua kolom yang diinginkan
- Berikan contoh format jika perlu

## Testing Tanpa Server

Jika Anda ingin mencoba fitur download tanpa menjalankan server penuh:

1. Buka file `public/test-spreadsheet.html` di browser
2. Klik tombol test untuk generate spreadsheet
3. File akan langsung terdownload

File test ini menggunakan library yang sama (xlsx) dan mendemonstrasikan kemampuan download Excel di browser.

## Format File Excel

File yang dihasilkan:
- **Format**: Excel 2007+ (.xlsx)
- **Sheet**: Sheet1
- **Header**: Baris pertama berisi nama kolom (bold)
- **Data**: Baris berikutnya berisi data
- **Kompatibel dengan**: Excel, Google Sheets, LibreOffice, Numbers

## Keamanan

- ✅ CDN scripts menggunakan integrity check (SRI)
- ✅ No vulnerabilities found in CodeQL scan
- ✅ Server-side validation untuk data
- ✅ Safe file generation menggunakan library terpercaya (xlsx)

## Teknologi

- **Frontend**: Vanilla JavaScript, Fetch API
- **Backend**: Node.js, Express
- **Library**: SheetJS (xlsx) v0.18.5
- **AI**: Google Gemini 2.5 Flash

---

**Selamat mencoba! 🎉**

Jika ada pertanyaan atau masalah, silakan buka issue di repository GitHub.
