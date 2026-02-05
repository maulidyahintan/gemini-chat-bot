# AI-ku Gemini Chatbot 🤖

Chatbot AI berbasis Google Gemini yang mendukung chat dengan file dan **generasi spreadsheet Excel**.

## ✨ Fitur

- 💬 Chat dengan AI menggunakan Google Gemini
- 📁 Upload dan analisis file (gambar, PDF, dokumen)
- 📊 **Generasi Spreadsheet Excel** - FITUR BARU!
- 💾 Riwayat chat tersimpan di localStorage
- 🌓 Mode terang/gelap
- 📱 Responsif untuk mobile
- ✏️ Formatting markdown untuk response AI

## 🆕 Fitur Spreadsheet

Chatbot sekarang dapat membuat dan menghasilkan file spreadsheet Excel (.xlsx)!

### Cara Menggunakan:
1. Minta chatbot untuk membuat spreadsheet, contoh:
   - "Buatkan spreadsheet daftar mahasiswa"
   - "Bisa buatkan spreadsheet data penjualan?"
   - "Generate spreadsheet inventaris barang"

2. Chatbot akan menghasilkan data dan menampilkan tombol **"Download Spreadsheet"**

3. Klik tombol untuk mengunduh file Excel (.xlsx)

Dokumentasi lengkap: [SPREADSHEET_FEATURE.md](./SPREADSHEET_FEATURE.md)

## 🚀 Instalasi

### Prerequisites
- Node.js (v14 atau lebih tinggi)
- npm atau yarn
- Google Gemini API Key

### Langkah Instalasi

1. Clone repository
```bash
git clone https://github.com/maulidyahintan/gemini-chat-bot.git
cd gemini-chat-bot
```

2. Install dependencies
```bash
npm install
```

3. Buat file `.env` dan tambahkan API key
```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

4. Jalankan aplikasi
```bash
node index.js
```

5. Buka browser dan akses `http://localhost:3000`

## 📦 Dependencies

- **@google/genai** - Google Gemini AI SDK
- **express** - Web framework
- **cors** - Cross-Origin Resource Sharing
- **multer** - File upload middleware
- **dotenv** - Environment variables
- **xlsx** - Excel file generation (untuk fitur spreadsheet)

## 🧪 Testing

Untuk menguji fitur spreadsheet tanpa menjalankan server lengkap:

1. Buka file `public/test-spreadsheet.html` di browser
2. Klik tombol test untuk generate dan download spreadsheet

## 📁 Struktur Folder

```
gemini-chat-bot/
├── index.js                 # Backend server
├── package.json            # Dependencies
├── .env                    # Environment variables (create this)
├── .gitignore             
├── FORMAT_EXAMPLE.md       # Contoh format response
├── SPREADSHEET_FEATURE.md  # Dokumentasi fitur spreadsheet
├── public/
│   ├── index.html         # Frontend HTML
│   ├── script.js          # Frontend JavaScript
│   ├── style.css          # Styling
│   └── test-spreadsheet.html  # Test page untuk spreadsheet
└── uploads/               # Folder untuk temporary file uploads
```

## 🔧 API Endpoints

### POST /api/chat
Chat tanpa file upload.

**Request:**
```json
{
  "conversation": [
    {"role": "user", "text": "Halo!"},
    {"role": "model", "text": "Halo! Ada yang bisa saya bantu?"}
  ]
}
```

### POST /api/chat-with-files
Chat dengan file upload (max 5 files, 10MB each).

**Request:**
- `message`: Text message
- `conversation`: Chat history (JSON string)
- `files`: Array of files (multipart/form-data)

### POST /api/generate-spreadsheet
Generate dan download Excel file.

**Request:**
```json
{
  "data": [
    {"Nama": "John", "Umur": 30},
    {"Nama": "Jane", "Umur": 25}
  ],
  "filename": "my_spreadsheet"
}
```

**Response:**
- Excel file (.xlsx) sebagai download

## 🎨 Fitur Frontend

- **Markdown Rendering** - Response AI dirender dengan markdown formatting
- **Syntax Highlighting** - Code blocks dengan highlight.js
- **Copy to Clipboard** - Copy pesan atau code dengan satu klik
- **File Preview** - Preview gambar sebelum upload
- **Dark/Light Mode** - Toggle tema
- **Chat History** - Simpan dan muat riwayat chat

## 🔐 Security

- File upload dibatasi untuk tipe file tertentu
- Maksimal ukuran file 10MB
- CORS enabled untuk security
- Environment variables untuk API keys

## 📝 Format Response

AI mendukung berbagai format markdown:
- **Bold text** dengan `**text**`
- *Italic text* dengan `*text*`
- Headers dengan `#`, `##`, `###`
- Bullet points dengan `*` atau `-`
- Numbered lists dengan `1.`, `2.`, dll
- Code blocks dengan `` ` `` atau ``` ```

Lihat [FORMAT_EXAMPLE.md](./FORMAT_EXAMPLE.md) untuk detail.

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat pull request atau issue.

## 📄 License

ISC License

## 👩‍💻 Author

Maulidyah Intan

## 🙏 Acknowledgments

- Google Gemini AI
- SheetJS (xlsx library)
- Font Awesome untuk icons
- Marked.js untuk markdown rendering
- Highlight.js untuk syntax highlighting

---

**Note:** Pastikan Anda memiliki Google Gemini API key untuk menjalankan aplikasi ini.
Dapatkan API key di: https://makersuite.google.com/app/apikey
