# Fitur Spreadsheet

## Deskripsi
Chatbot AI sekarang dapat membuat dan menghasilkan file spreadsheet Excel (.xlsx) berdasarkan permintaan pengguna.

## Cara Menggunakan

### 1. Meminta Spreadsheet
Anda dapat meminta chatbot untuk membuat spreadsheet dengan berbagai cara, misalnya:

- "Buatkan spreadsheet daftar mahasiswa"
- "Bisa buatkan spreadsheet data penjualan?"
- "Tolong buat tabel data karyawan"
- "Generate spreadsheet untuk inventaris barang"

### 2. Format Response
Ketika chatbot mendeteksi permintaan untuk membuat spreadsheet, ia akan:
1. Menghasilkan data dalam format JSON
2. Menampilkan penjelasan tentang spreadsheet yang dibuat
3. Menampilkan tombol **"Download Spreadsheet"** untuk mengunduh file Excel

### 3. Download Spreadsheet
- Klik tombol hijau **"Download Spreadsheet"** yang muncul di response chatbot
- File Excel (.xlsx) akan otomatis terunduh ke perangkat Anda
- File dapat dibuka dengan Microsoft Excel, Google Sheets, atau aplikasi spreadsheet lainnya

## Contoh Penggunaan

### Contoh 1: Daftar Mahasiswa
**Pertanyaan:**
```
Buatkan spreadsheet daftar 5 mahasiswa dengan kolom Nama, NIM, dan Jurusan
```

**Response:**
Chatbot akan menghasilkan spreadsheet dengan kolom:
- Nama
- NIM
- Jurusan

### Contoh 2: Data Penjualan
**Pertanyaan:**
```
Bisa buatkan spreadsheet data penjualan bulanan dengan kolom Bulan, Produk, dan Jumlah Terjual?
```

**Response:**
Chatbot akan menghasilkan spreadsheet dengan kolom:
- Bulan
- Produk
- Jumlah Terjual

### Contoh 3: Inventaris Barang
**Pertanyaan:**
```
Generate spreadsheet inventaris barang dengan kolom Kode, Nama Barang, Stok, dan Harga
```

**Response:**
Chatbot akan menghasilkan spreadsheet dengan kolom:
- Kode
- Nama Barang
- Stok
- Harga

## Format Data
Spreadsheet yang dihasilkan:
- Format: Excel (.xlsx)
- Nama file: `spreadsheet_[timestamp].xlsx`
- Sheet: Sheet1
- Header: Baris pertama berisi nama kolom
- Data: Baris selanjutnya berisi data yang dihasilkan oleh AI

## Teknologi
- **Backend**: Node.js + Express
- **Library**: ExcelJS (actively maintained, secure)
- **Format Output**: Excel 2007+ (.xlsx)

## Catatan
- Fitur ini menggunakan Google Gemini AI untuk menghasilkan data spreadsheet
- Data yang dihasilkan bersifat contoh/sample sesuai dengan permintaan pengguna
- Jumlah baris data dapat disesuaikan dengan permintaan
- Kolom dapat dikustomisasi sesuai kebutuhan

## Tips Penggunaan
1. Jelaskan dengan detail kolom apa saja yang diinginkan
2. Sebutkan jumlah baris data yang diinginkan (misal: "5 data", "10 mahasiswa")
3. Berikan konteks yang jelas untuk data yang diinginkan
4. File yang diunduh dapat langsung diedit di aplikasi spreadsheet favorit Anda

## Troubleshooting

### Tombol Download Tidak Muncul
- Pastikan response chatbot mengandung data dalam format yang benar
- Coba minta ulang dengan lebih spesifik: "Buatkan spreadsheet dengan format tabel"

### File Tidak Terunduh
- Pastikan browser mengizinkan download
- Periksa folder Downloads di perangkat Anda
- Coba klik tombol download lagi

### Data Tidak Sesuai
- Berikan instruksi yang lebih detail tentang data yang diinginkan
- Sebutkan kolom-kolom spesifik yang dibutuhkan
- Berikan contoh data jika perlu
