import {
  Banknote,
  Building2,
  CalendarDays,
  ClipboardList,
  FileDown,
  FileText,
  Printer,
  Search,
} from "lucide-react";

type Status = "Selesai" | "Proses" | "Menunggu" | "Ditolak";

interface LaporanData {
  id: number;
  namaKegiatan: string;
  kementerian: string;
  tanggal: string;
  statusKak: Status;
  anggaran: number;
  statusLaporan: Status;
}

/*
 * DATA MANUAL
 * Silakan ubah nilai ringkasan dan isi laporanData sesuai kebutuhan.
 */
const ringkasan = {
  totalKegiatan: 24,
  pengajuanKak: 18,
  totalAnggaran: "Rp128,5 Jt",
  jumlahKementerian: 8,
};

const laporanData: LaporanData[] = [
  {
    id: 1,
    namaKegiatan: "Seminar Nasional Teknologi",
    kementerian: "Riset dan Keilmuan",
    tanggal: "2026-05-24",
    statusKak: "Selesai",
    anggaran: 12500000,
    statusLaporan: "Selesai",
  },
  {
    id: 2,
    namaKegiatan: "Pelatihan Kepemimpinan Mahasiswa",
    kementerian: "PSDM",
    tanggal: "2026-06-03",
    statusKak: "Selesai",
    anggaran: 8750000,
    statusLaporan: "Proses",
  },
  {
    id: 3,
    namaKegiatan: "Bakti Sosial Desa Binaan",
    kementerian: "Sosial Masyarakat",
    tanggal: "2026-06-14",
    statusKak: "Proses",
    anggaran: 15000000,
    statusLaporan: "Menunggu",
  },
  {
    id: 4,
    namaKegiatan: "ElectroMen Creative Market",
    kementerian: "Ekonomi Kreatif",
    tanggal: "2026-07-02",
    statusKak: "Menunggu",
    anggaran: 10250000,
    statusLaporan: "Menunggu",
  },
  {
    id: 5,
    namaKegiatan: "Forum Kajian Strategis",
    kementerian: "Kajian dan Aksi Strategis",
    tanggal: "2026-07-18",
    statusKak: "Ditolak",
    anggaran: 5000000,
    statusLaporan: "Ditolak",
  },
];

const formatRupiah = (nominal: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);

const formatTanggal = (tanggal: string) =>
  new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getStatusStyle = (status: Status) => {
  const styles: Record<Status, string> = {
    Selesai: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Proses: "bg-blue-50 text-blue-700 ring-blue-600/20",
    Menunggu: "bg-amber-50 text-amber-700 ring-amber-600/20",
    Ditolak: "bg-red-50 text-red-700 ring-red-600/20",
  };

  return styles[status];
};

const getStatusDot = (status: Status) => {
  const styles: Record<Status, string> = {
    Selesai: "bg-emerald-500",
    Proses: "bg-blue-500",
    Menunggu: "bg-amber-500",
    Ditolak: "bg-red-500",
  };

  return styles[status];
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
        status,
      )}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(status)}`}
      />
      {status}
    </span>
  );
}

export default function Laporan() {
  const ringkasanCards = [
    {
      label: "Total Kegiatan",
      value: ringkasan.totalKegiatan,
      note: "Seluruh kegiatan",
      icon: ClipboardList,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pengajuan KAK",
      value: ringkasan.pengajuanKak,
      note: "KAK telah diajukan",
      icon: FileText,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total Anggaran",
      value: ringkasan.totalAnggaran,
      note: "Akumulasi anggaran",
      icon: Banknote,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Jumlah Kementerian",
      value: ringkasan.jumlahKementerian,
      note: "Kementerian terdaftar",
      icon: Building2,
      iconStyle: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Judul dan tombol aksi */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            Laporan SIBEM
          </h1>
          <p className="mt-1 text-sm text-gray-500 md:text-base">
            Ringkasan data kegiatan, pengajuan KAK, anggaran, dan kementerian.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
          >
            <Printer size={17} />
            Cetak Laporan
          </button>

          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            <FileDown size={17} />
            Export PDF
          </button>
        </div>
      </section>

      {/* Ringkasan */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ringkasanCards.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-800">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{item.note}</p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconStyle}`}
                >
                  <Icon size={21} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Filter */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[220px_240px_1fr]">
          <div className="relative">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              aria-label="Pilih periode laporan"
              defaultValue=""
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Semua Periode</option>
              <option value="januari">Januari 2026</option>
              <option value="februari">Februari 2026</option>
              <option value="maret">Maret 2026</option>
              <option value="april">April 2026</option>
              <option value="mei">Mei 2026</option>
              <option value="juni">Juni 2026</option>
              <option value="juli">Juli 2026</option>
            </select>
          </div>

          <select
            aria-label="Pilih kategori laporan"
            defaultValue=""
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Semua Kategori</option>
            <option value="kegiatan">Kegiatan</option>
            <option value="kak">Pengajuan KAK</option>
            <option value="anggaran">Anggaran</option>
            <option value="kementerian">Kementerian</option>
          </select>

          <div className="relative md:col-span-2 xl:col-span-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Cari kegiatan atau kementerian..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {/* Tabel laporan */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-800">Daftar Laporan Kegiatan</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Menampilkan {laporanData.length} data laporan
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-400 sm:mt-0">
            Terakhir diperbarui: 6 Juli 2026
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  No
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Nama Kegiatan
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Kementerian
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tanggal
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status KAK
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Anggaran
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status Laporan
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {laporanData.map((laporan, index) => (
                <tr
                  key={laporan.id}
                  className="transition hover:bg-blue-50/30"
                >
                  <td className="px-5 py-4 text-sm font-medium text-gray-500">
                    {String(index + 1).padStart(2, "0")}
                  </td>

                  <td className="px-5 py-4">
                    <p className="max-w-[260px] text-sm font-semibold text-gray-800">
                      {laporan.namaKegiatan}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {laporan.kementerian}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                    {formatTanggal(laporan.tanggal)}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={laporan.statusKak} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-700">
                    {formatRupiah(laporan.anggaran)}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={laporan.statusLaporan} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            Data laporan dikelola secara manual pada komponen.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-semibold text-white">
              1
            </span>
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}