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
  urunler: any[];
}

interface HafizaTipi {
  uid: string | null;
  isim: string;
  butce: string;
  harcamalar: Harcama[];
  // GEÇİCİ FİŞ VERİSİ
  tempFis: TempFis;
  setUid: (yeniUid: string) => void;
  setIsim: (yeniIsim: string) => void;
  setButce: (yeniButce: string) => void;
  setHarcamalar: (liste: Harcama[]) => void;
  // Fiş verisini güncelleyen fonksiyon
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
    urunler: [],
  },
  setUid: (yeniUid) => set({ uid: yeniUid }),
  setIsim: (yeniIsim) => set({ isim: yeniIsim }),
  setButce: (yeniButce) => set({ butce: yeniButce }),
  setHarcamalar: (liste) => set({ harcamalar: liste }),
  // Mevcut veriyi koruyarak sadece değişeni günceller
  setTempFis: (veri) =>
    set((state) => ({
      tempFis: { ...state.tempFis, ...veri },
    })),
  toplamHarcama: () => {
    const liste = get().harcamalar;
    return liste.reduce((toplam, harcama) => toplam + harcama.tutar, 0);
  },
}));
