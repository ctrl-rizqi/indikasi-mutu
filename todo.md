# Daftar Fitur dan Pekerjaan yang Harus Diselesaikan (Updated Schema)

Sehubungan dengan pembaruan _skema Prisma_ (menjadi `Category`, `Item`, dan `ActivityLog`) dan _Flowchart Mermaid_, daftar pekerjaan atau _TODO_ untuk migrasi serta pengembangan lanjutan adalah sebagai berikut:

## Database & Backend

1. **Refactor Backend Routes (Master Data)**
   - Menghapus _routes_ lama seperti `jadwal.ts` dan `transaksi.ts`.
   - Membuat/mengubah _route_ menjadi `item.ts`, `category.ts`, dan `activity.ts`.
   - Menyelaraskan modul _auth.ts_ dengan struktur Role baru (`ADMIN` & `USER`).

2. **Memperbarui Stat Engine (Laporan)**
   - Menyusun ulang logika pelaporan (`GET /api/stats` atau `/api/laporan`) agar perhitungan indikator berbasis entri pada tabel `ActivityLog` bukan lagi tabel `Transaksi`.

3. **Memperbarui Prisma Seeder**
   - Membuat ulang _script_ di `prisma/seed.ts` agar mengisi _dummy_ `Category`, `Item`, dan Role yang baru sebelum UI dikerjakan.

## Frontend

1. **Refactor Akses Hook API (`React Query`)**
   - Membuang/Menyesuaikan _hooks_ lama di `apps/frontend/src/hooks` agar memanggil _endpoint_ yang baru (`/api/items`, `/api/activities`).

2. **Perombakan Halaman Master (`/master`)**
   - Mengubah form Master dari pengelolaan `Asset` static (AC/APAR _enum_) menjadi Form `Item` interaktif dengan pilihan relasi berdasarkan tabel `Category`. Termasuk penambahan _field_ Speseifikasi (`spec`) dan _Code_.

3. **Perombakan Form Aktivitas (Eks `/tugas`)**
   - Sesuai _flowchart_, mengubah UI menjadi "Dashboard Petugas -> Pilih Alat dari Master -> Form Input Aktivitas". Form ini harus punya input _Checklist_ yang ramah JSON dan form _Note_.

4. **Perombakan Halaman Dashboard Admin & Tabel (Laporan)**
   - Menyiapkan UI komponen filter kategori (_Dropdown Kategori_) dan _Date Range_ untuk mem-filter data yang masuk ke Visualisasi Tabel dan Grafik Aktivitas.

5. **Halaman Login dan _Session Management_**
   - _(Sisa dari TODO lama)_: Menghubungkan fungsi login _dummy_ dengan Auth _backend_ aktual beserta pembuatan halaman penjagaan/pembatasan rute (_Protected Routes_).
