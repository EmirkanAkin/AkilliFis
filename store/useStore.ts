import { create } from "zustand";

interface Harcama {
  id: string;
  ad: string;
  tutar: number;
  kategori: string;
  tarih: string;
}

// Fişten gelen geçici verilerin yapısı
interface TempFis {
  magazaAdi: string;
  tarih: string;
  toplamTutar: number;
  kategori: string; // <-- fisKategorisi BURADA kategori OLARAK DÜZELTİLDİ
  urunler: any[];
}

interface HafizaTipi {
  uid: string | null;
  isim: string;
  butce: string;
  harcamalar: Harcama[];
  tempFis: TempFis;
  setUid: (yeniUid: string) => void;
  setIsim: (yeniIsim: string) => void;
  setButce: (yeniButce: string) => void;
  setHarcamalar: (liste: Harcama[]) => void;
  setTempFis: (veri: Partial<TempFis>) => void;
  toplamHarcama: () => number;
}

export const useStore = create<HafizaTipi>((set, get) => ({
  uid: null,
  isim: "Misafir",
  butce: "0",
  harcamalar: [],
  // Başlangıçta boş fiş
  tempFis: {
    magazaAdi: "",
    tarih: "",
    toplamTutar: 0,
    kategori: "", // <-- BURADA DA kategori OLARAK DÜZELTİLDİ
    urunler: [],
  },
  setUid: (yeniUid) => set({ uid: yeniUid }),
  setIsim: (yeniIsim) => set({ isim: yeniIsim }),
  setButce: (yeniButce) => set({ butce: yeniButce }),
  setHarcamalar: (liste) => set({ harcamalar: liste }),
  setTempFis: (veri) =>
    set((state) => ({
      tempFis: { ...state.tempFis, ...veri },
    })),
  toplamHarcama: () => {
    const liste = get().harcamalar;
    return liste.reduce((toplam, harcama) => toplam + harcama.tutar, 0);
  },
}));
