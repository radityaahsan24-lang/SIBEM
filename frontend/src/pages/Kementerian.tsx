export default function Kementerian() {
  const kementerian = [
    {
      id: 1,
      nama: "PSDM",
      menteri: "Achmad Ricky",
      staff: 18,
      proker: 6,
      anggaran: "Rp15.000.000",
      status: "Aktif",
    },
    {
      id: 2,
      nama: "Kominfo",
      menteri: "Raditya",
      staff: 15,
      proker: 5,
      anggaran: "Rp12.000.000",
      status: "Aktif",
    },
    {
      id: 3,
      nama: "Sosial Masyarakat",
      menteri: "Angga",
      staff: 12,
      proker: 4,
      anggaran: "Rp10.000.000",
      status: "Aktif",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Kementerian</h1>
        <p className="text-gray-500">
          Kelola data kementerian dan struktur organisasi BEM
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari kementerian..."
          className="flex-1 rounded-xl border p-3"
        />

        <select className="rounded-xl border p-3">
          <option>Semua Status</option>
          <option>Aktif</option>
          <option>Nonaktif</option>
        </select>

        <button className="rounded-xl bg-orange-500 px-5 text-white">
          Tambah Kementerian
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <Card title="Total Kementerian" value="10" />
        <Card title="Total Staff" value="126" />
        <Card title="Total Proker" value="36" />
        <Card title="Kementerian Aktif" value="10" />
      </div>

      {/* List */}
      <div className="space-y-5">
        {kementerian.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white p-6 shadow"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Kementerian {item.nama}
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-y-2 text-gray-600">
                  <p>Menteri</p>
                  <p>{item.menteri}</p>

                  <p>Jumlah Staff</p>
                  <p>{item.staff} Orang</p>

                  <p>Program Kerja</p>
                  <p>{item.proker}</p>

                  <p>Anggaran</p>
                  <p>{item.anggaran}</p>

                  <p>Status</p>
                  <p className="text-green-600 font-medium">{item.status}</p>
                </div>
              </div>

              <div>
                <button className="rounded-lg border px-5 py-2 hover:bg-orange-500 hover:text-white">
                  Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );
}