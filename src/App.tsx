import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FiMonitor,
  FiHardDrive,
  FiCpu,
  FiServer,
  FiMapPin,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiChevronRight,
  FiClock,
  FiPlus,
  FiX,
  FiActivity,
  FiArrowLeft,
  FiEdit3,
  FiArchive,
} from "react-icons/fi";

const API_BASE_URL = "http://localhost:8000/api";

type SnapshotItem = {
  ram: string;
  cpu: string;
  depolama: string;
  ekran_karti: string;
};

type GecmisItem = {
  tarih: string;
  mesaj: string;
  snapshot?: SnapshotItem;
};

type InventoryItem = {
  id: number;
  marka: string;
  mudurluk: string;
  ip: string;
  kat: string | number;
  ram: string;
  cpu: string;
  isletim_sistemi: string;
  depolama: string;
  ekran_karti: string;
  durum: "Aktif" | "Pasif" | "Arızalı";
  gecmis: GecmisItem[];
};

function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  const [deptSearchQuery, setDeptSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [selectedPc, setSelectedPc] = useState<InventoryItem | null>(null);

  // New Note State
  const [newNote, setNewNote] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSpecs, setEditSpecs] = useState({
    ram: "",
    cpu: "",
    depolama: "",
    ekran_karti: "",
  });

  // Historical snapshot viewing state
  const [viewingSnapshot, setViewingSnapshot] = useState<GecmisItem | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDepartments();

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedDept) fetchInventory(selectedDept);
  }, [selectedDept]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(res.data);
    } catch (error) {
      console.error("Müdürlükler yüklenirken hata oluştu:", error);
    }
  };

  const fetchInventory = async (dept: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("mudurluk", dept);
      const res = await axios.get(`${API_BASE_URL}/inventory?${params.toString()}`);
      setInventory(res.data);

      // Update selected PC data automatically
      if (selectedPc) {
        const updatedPc = res.data.find((p: InventoryItem) => p.id === selectedPc.id);
        if (updatedPc) setSelectedPc(updatedPc);
      }
    } catch (error) {
      console.error("Envanter yüklenirken hata oluştu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitNote = async (pcId: number) => {
    if (!newNote.trim()) return;
    try {
      const payload: any = { mesaj: newNote };

      if (isEditMode) {
        if (editSpecs.ram !== selectedPc?.ram) payload.yeni_ram = editSpecs.ram;
        if (editSpecs.cpu !== selectedPc?.cpu) payload.yeni_cpu = editSpecs.cpu;
        if (editSpecs.depolama !== selectedPc?.depolama) payload.yeni_depolama = editSpecs.depolama;
        if (editSpecs.ekran_karti !== selectedPc?.ekran_karti) payload.yeni_ekran_karti = editSpecs.ekran_karti;
      }

      const res = await axios.post(`${API_BASE_URL}/inventory/${pcId}/note`, payload);

      // Update selected pc and specs smoothly
      if (res.data.guncel_veri) {
        setSelectedPc(res.data.guncel_veri);
        setEditSpecs({
          ram: res.data.guncel_veri.ram,
          cpu: res.data.guncel_veri.cpu,
          depolama: res.data.guncel_veri.depolama,
          ekran_karti: res.data.guncel_veri.ekran_karti,
        });
      }

      setNewNote("");
      setIsEditMode(false);
      fetchInventory(selectedDept!);
    } catch (error) {
      console.error("Not eklenemedi:", error);
    }
  };

  const handleDeptSelect = (dept: string) => {
    setSelectedDept(dept);
    setDeptSearchQuery("");
    setIsSearchFocused(false);
  };

  const openPcDetails = (pc: InventoryItem) => {
    setSelectedPc(pc);
    setEditSpecs({
      ram: pc.ram,
      cpu: pc.cpu,
      depolama: pc.depolama,
      ekran_karti: pc.ekran_karti,
    });
    setViewingSnapshot(null);
    setIsEditMode(false);
    setNewNote("");
  };

  const getStatusIcon = (status: string) => {
    if (status === "Aktif") return <FiCheckCircle className="text-emerald-500 w-5 h-5" />;
    if (status === "Pasif") return <FiAlertCircle className="text-amber-500 w-5 h-5" />;
    return <FiXCircle className="text-rose-500 w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "Aktif") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "Pasif") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-rose-100 text-rose-700 border-rose-200";
  };

  const searchQuery = deptSearchQuery.toLocaleLowerCase("tr-TR");
  const filteredDepartments = departments.filter((d) => d.toLocaleLowerCase("tr-TR").includes(searchQuery));

  const totalPcs = inventory.length;
  const activePcs = inventory.filter((p) => p.durum === "Aktif").length;
  const passivePcs = inventory.filter((p) => p.durum === "Pasif").length;
  const brokenPcs = inventory.filter((p) => p.durum === "Arızalı").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center">
      <div
        className={`transition-all duration-700 ease-in-out w-full flex flex-col items-center justify-center px-4 ${
          selectedDept ? "py-8 bg-white border-b border-slate-200 shadow-sm" : "h-screen pb-32"
        }`}
      >
        <div
          className={`flex flex-col items-center justify-center transition-all ${selectedDept ? "scale-90 mb-2" : "scale-100 mb-8"}`}
        >
          <div className="p-3 bg-blue-600 rounded-xl shadow-blue-500/30 shadow-xl text-white mb-6">
            <FiServer className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-blue-700 text-center">
            IT Envanter Yönetimi
          </h1>
        </div>

        {!selectedDept && (
          <div className="w-full max-w-2xl relative z-20" ref={searchRef}>
            <div className="relative group">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors z-10" />
              <input
                type="text"
                placeholder="Müdürlük arayın veya seçin..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 rounded-2xl outline-none transition-all shadow-lg text-lg relative z-0"
                value={deptSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setDeptSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
              />
            </div>

            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                {filteredDepartments.length > 0 ? (
                  <div className="py-2">
                    {filteredDepartments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => handleDeptSelect(dept)}
                        className="w-full text-left px-6 py-3 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors flex items-center justify-between group"
                      >
                        {dept}
                        <FiChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-slate-500">Sonuç bulunamadı</div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedDept && (
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setSelectedDept(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm px-4 py-2 rounded-xl hover:bg-slate-100 shadow-sm border border-slate-200 bg-white"
            >
              <FiArrowLeft /> Müdürlüklere Dön
            </button>
          </div>
        )}
      </div>

      {selectedDept && (
        <main className="w-full max-w-5xl px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            {selectedDept} Müdürlüğü
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Toplam Bilgisayar</p>
                <p className="text-3xl font-bold text-slate-800">{totalPcs}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                <FiMonitor className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Aktif Çalışan</p>
                <p className="text-3xl font-bold text-emerald-600">{activePcs}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Pasif / Boşta</p>
                <p className="text-3xl font-bold text-amber-600">{passivePcs}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Arızalı / Serviste</p>
                <p className="text-3xl font-bold text-rose-600">{brokenPcs}</p>
              </div>
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                <FiXCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-blue-500" /> Döküm Listesi
              </h2>
            </div>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : inventory.length === 0 ? (
              <div className="py-20 text-center text-slate-500">Bu müdürlükte kayıtlı bilgisayar bulunamadı.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {inventory.map((pc) => (
                  <div
                    key={pc.id}
                    onClick={() => openPcDetails(pc)}
                    className="p-4 sm:px-6 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-xl bg-white shadow-sm border ${pc.durum === "Aktif" ? "border-emerald-100" : pc.durum === "Arızalı" ? "border-rose-100" : "border-slate-200"}`}
                      >
                        <FiMonitor
                          className={`w-6 h-6 ${pc.durum === "Aktif" ? "text-emerald-500" : pc.durum === "Arızalı" ? "text-rose-500" : "text-slate-400"}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                          {pc.marka}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <FiMapPin /> {pc.kat === 0 ? "Zemin Kat" : `${pc.kat}. Kat`}
                          </span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="font-mono text-blue-600">{pc.ip}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 ${getStatusColor(pc.durum)}`}
                      >
                        {pc.durum}
                      </div>
                      <FiChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {selectedPc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPc(null)}
          ></div>

          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl relative z-10 flex flex-col lg:flex-row animate-in zoom-in-95 duration-200">
            <div className="w-full lg:w-3/5 flex flex-col bg-white">
              <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-white relative z-20 shadow-sm">
                <div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 border ${getStatusColor(selectedPc.durum)}`}
                  >
                    {getStatusIcon(selectedPc.durum)} {selectedPc.durum} Sistemi
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-800">{selectedPc.marka}</h2>
                  <p className="text-blue-600 font-mono font-medium mt-1">{selectedPc.ip}</p>
                </div>
                <button
                  onClick={() => setSelectedPc(null)}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors lg:hidden"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto p-8 flex-1 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <FiServer className="text-blue-500" /> Gelişmiş Donanım Özellikleri
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex gap-4 items-center shadow-sm">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <FiCpu className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">İşlemci (CPU)</p>
                      <p className="font-semibold text-slate-700">{selectedPc.cpu}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex gap-4 items-center shadow-sm relative overflow-hidden group">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl relative z-10">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="4" y="4" width="16" height="5" rx="2" ry="2"></rect>
                        <rect x="4" y="15" width="16" height="5" rx="2" ry="2"></rect>
                        <line x1="8" y1="4" x2="8" y2="9"></line>
                        <line x1="16" y1="4" x2="16" y2="9"></line>
                        <line x1="8" y1="15" x2="8" y2="20"></line>
                        <line x1="16" y1="15" x2="16" y2="20"></line>
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Bellek (RAM)</p>
                      <p className="font-semibold text-slate-700">{selectedPc.ram}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex gap-4 items-center shadow-sm">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <FiHardDrive className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Depolama (SSD/HDD)
                      </p>
                      <p className="font-semibold text-slate-700">{selectedPc.depolama}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex gap-4 items-center shadow-sm">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                        <path d="M6 8h.01"></path>
                        <path d="M10 8h.01"></path>
                        <path d="M14 8h.01"></path>
                        <path d="M18 8h.01"></path>
                        <path d="M8 16h8"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Ekran Kartı (GPU)
                      </p>
                      <p className="font-semibold text-slate-700">{selectedPc.ekran_karti}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-800 text-white border-none flex gap-4 items-center sm:col-span-2 shadow-lg">
                    <div className="p-3 bg-white/10 text-white rounded-xl">
                      <FiMonitor className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">İşletim Sistemi</p>
                      <p className="font-bold text-lg">{selectedPc.isletim_sistemi}</p>
                    </div>
                  </div>
                </div>

                {/* View snapshot module */}
                {viewingSnapshot && viewingSnapshot.snapshot && (
                  <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 relative animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => setViewingSnapshot(null)}
                      className="absolute top-4 right-4 text-blue-400 hover:text-blue-700 bg-white rounded-full p-1 shadow-sm"
                    >
                      <FiX />
                    </button>
                    <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                      <FiArchive /> "{viewingSnapshot.tarih}" Tarihindeki Sistem
                    </h4>
                    <p className="text-sm text-blue-700 mb-4 font-medium italic">
                      Değişiklik sebebi: {viewingSnapshot.mesaj}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                        <span className="text-slate-400 text-xs block mb-0.5">Önceki İşlemci</span>
                        <span className="font-medium text-slate-700">{viewingSnapshot.snapshot.cpu || "-"}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                        <span className="text-slate-400 text-xs block mb-0.5">Önceki RAM</span>
                        <span className="font-medium text-slate-700">{viewingSnapshot.snapshot.ram || "-"}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                        <span className="text-slate-400 text-xs block mb-0.5">Önceki Depolama</span>
                        <span className="font-medium text-slate-700">{viewingSnapshot.snapshot.depolama || "-"}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                        <span className="text-slate-400 text-xs block mb-0.5">Önceki Ekran K.</span>
                        <span className="font-medium text-slate-700">
                          {viewingSnapshot.snapshot.ekran_karti || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-2/5 bg-slate-50 border-l border-slate-200 flex flex-col relative">
              <div className="hidden lg:flex justify-end p-4 absolute top-0 right-0 z-10">
                <button
                  onClick={() => setSelectedPc(null)}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors bg-white/50 backdrop-blur-sm shadow-sm border border-slate-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 pb-4 pt-8 bg-white border-b border-slate-100 z-10 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FiClock className="text-blue-500" />
                  İşlem Takip Kayıtları
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 -z-0"></div>
                {selectedPc.gecmis &&
                  selectedPc.gecmis
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <div key={index} className="relative z-10 flex gap-4">
                        <div
                          className={`w-4 h-4 rounded-full border-4 border-slate-50 shrink-0 mt-1.5 ${item.snapshot ? "bg-amber-500 box-content drop-shadow-md" : "bg-blue-500"}`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1.5">
                            <div className="text-xs font-bold text-slate-500 bg-white inline-block px-2 py-1 rounded shadow-sm border border-slate-100">
                              {item.tarih}
                            </div>
                            {item.snapshot && (
                              <button
                                onClick={() => setViewingSnapshot(item)}
                                className="text-xs bg-amber-50 text-amber-600 border border-amber-200 font-bold px-2 py-1 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
                              >
                                Tarihe Bak
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 shadow-sm inline-block w-full">
                            {item.mesaj}
                          </p>
                        </div>
                      </div>
                    ))}

                {(!selectedPc.gecmis || selectedPc.gecmis.length === 0) && (
                  <p className="text-sm text-slate-500 italic pl-10">Henüz geçmiş cihaz kaydı yok.</p>
                )}
              </div>

              <div className="bg-white border-t border-slate-200 p-0 overflow-hidden shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10">
                {isEditMode ? (
                  <div className="p-4 bg-blue-50/50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-3 text-sm font-bold text-blue-800">
                      Donanım Güncellemesi{" "}
                      <button onClick={() => setIsEditMode(false)} className="text-slate-400 hover:text-slate-600">
                        <FiX />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">RAM</label>
                        <input
                          type="text"
                          value={editSpecs.ram}
                          onChange={(e) => setEditSpecs({ ...editSpecs, ram: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">CPU</label>
                        <input
                          type="text"
                          value={editSpecs.cpu}
                          onChange={(e) => setEditSpecs({ ...editSpecs, cpu: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Depolama</label>
                        <input
                          type="text"
                          value={editSpecs.depolama}
                          onChange={(e) => setEditSpecs({ ...editSpecs, depolama: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">GPU</label>
                        <input
                          type="text"
                          value={editSpecs.ekran_karti}
                          onChange={(e) => setEditSpecs({ ...editSpecs, ekran_karti: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                    <textarea
                      placeholder="Neden değişiklik yapıldı? (Örn: RAM eklendi)"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none h-16 transition-all font-medium mb-2 shadow-inner"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    ></textarea>
                    <button
                      onClick={() => submitNote(selectedPc.id)}
                      disabled={!newNote.trim()}
                      className="w-full bg-blue-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle /> Değişikliği Uygula ve Kaydet
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 group transition-colors">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between items-center">
                      Yeni Kayıt{" "}
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded normal-case"
                      >
                        <FiEdit3 /> Donanımı Değiştir
                      </button>
                    </p>
                    <div className="flex flex-col gap-2 relative">
                      <textarea
                        placeholder="Sadece not veya arıza durumu ekle..."
                        className="w-full p-3 pr-12 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none h-20 transition-all font-medium shadow-sm hover:border-slate-300"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      ></textarea>
                      <button
                        onClick={() => submitNote(selectedPc.id)}
                        disabled={!newNote.trim()}
                        className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                        title="Kaydet"
                      >
                        <FiPlus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
