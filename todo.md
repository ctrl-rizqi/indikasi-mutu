# Daftar Fitur dan Endpoint yang Belum Terimplementasi

Berdasarkan _flowchart_ awal dan pengecekan kode saat ini pada _frontend_ maupun _backend_, berikut adalah daftar fitur, halaman, atau _endpoint_ yang belum terimplementasikan sepenuhnya:

## Frontend

1. **Halaman Dashboard Utama (`/`)**
   - **Belum terhubung ke API (Statis)**: Nilai ringkasan seperti "Kepatuhan Hari Ini", "Tugas Selesai", "Terlambat", dan tabel "Jadwal Pemeliharaan Hari Ini" masih berupa teks bawaan (statis). Belum menggunakan React Query untuk mengambil data dari _backend_.

2. **Halaman Login (`/login`)**
   - **Belum terhubung ke `POST /api/auth/login`**: Masih menggunakan form _dummy_ tanpa ada mekanisme pengiriman data `username` dan `password` ke _backend_.
   - **Belum ada Manajemen Sesi (_Session Management_)**: Belum ada mekanisme untuk menyimpan JWT Token, _role_ (`ADMIN` atau `PETUGAS`), dan _Redirect_ apabila _login_ berhasil / mencegah _user_ yang belum login mengakses halaman internal.

3. **Filter Waktu di Halaman Laporan (`/laporan`)**
   - Hanya menampilkan seluruh rentang waktu dari data _dummy_. Di _flowchart_/konsep awal, ada _Filter Bulanan_ untuk memilih bulan dan tahun laporan kepatuhan. Belum ada opsi untuk klien dalam memilih filter tersebut atau menampilkannya dalam bentuk grafik aktual (masih sekadar kotak teks "_placeholder_").

## Backend

1. **Filter Query di Halaman Laporan (`GET /api/laporan/indikator-mutu`)**
   - Data _request parameter_ seperti `month` dan `year` sudah diparsing, namun belum digunakan secara aktif di klausa `where` untuk metode `prisma.jadwal.count()` dan `prisma.transaksi.count()`. Hasilnya, persentase yang keluar selalu dihitung dari awal mula penciptaan aplikasi dan tidak per bulan spesifik.

2. **Implementasi Hash Password di Modul Auth (`POST /api/auth/login`)**
   - Pengecekan _password_ saat ini menggunakan komparasi _plain-text_ (`user.password !== password`). Di mode produksi, seharusnya disandingkan dengan _library_ pembungkus sandi kriptografis seperti _Bcrypt_ (_password hashing_).

3. **Mekanisme Penjadwalan Pemeliharaan Otomatis**
   - Dari sisi API sudah ada _endpoint_ `POST /api/jadwal` untuk membuat jadwal, namun pada skenario aslinya aplikasi rumah sakit seperti ini memerlukan jadwal rutin _(Automated Cron / Master Schedule Generator)_ untuk membuat jadwal harian baru secara otomatis keesokan harinya tanpa diketik satu-persatu secara manual dari API/aplikasi.
