import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Harcama {
  id: string;
  ad: string;
  tutar: number;
  kategori: string;
  tarih: string;
}

interface Fis {
  id: string;
  magaza_adi: string;
  tarih: string;
  toplam_tutar: number | string;
  kategori: string;
  olusturulma_tarihi?: any;
  kullanici_id?: string;
  [key: string]: any;
}

interface TempFis {
  magazaAdi: string;
  tarih: string;
  toplamTutar: number;
  kategori: string;
  urunler: any[];
}

interface HafizaTipi {
  uid: string | null;
  isim: string;
  butce: string;
  harcamalar: Harcama[];

  tumFisler: Fis[];
  tumUrunler: any[];
  isFislerLoaded: boolean;

  tempFis: TempFis;

  setUid: (yeniUid: string) => void;
  setIsim: (yeniIsim: string) => void;
  setButce: (yeniButce: string) => void;
  setHarcamalar: (liste: Harcama[]) => void;

  setTumFisler: (fisler: Fis[]) => void;
  setTumUrunler: (urunler: any[]) => void;
  setIsFislerLoaded: (durum: boolean) => void;

  setTempFis: (veri: Partial<TempFis>) => void;
  toplamHarcama: () => number;
}

export const useStore = create<HafizaTipi>()(
  persist(
    (set, get) => ({
      uid: null,
      isim: "Misafir",
      butce: "0",
      harcamalar: [],

      tumFisler: [],
      tumUrunler: [],
      isFislerLoaded: false,

      tempFis: {
        magazaAdi: "",
        tarih: "",
        toplamTutar: 0,
        kategori: "",
        urunler: [],
      },

      setUid: (yeniUid) => set({ uid: yeniUid }),
      setIsim: (yeniIsim) => set({ isim: yeniIsim }),
      setButce: (yeniButce) => set({ butce: yeniButce }),
      setHarcamalar: (liste) => set({ harcamalar: liste }),

      setTumFisler: (fisler) => set({ tumFisler: fisler }),
      setTumUrunler: (urunler) => set({ tumUrunler: urunler }),
      setIsFislerLoaded: (durum) => set({ isFislerLoaded: durum }),

      setTempFis: (veri) =>
        set((state) => ({
          tempFis: { ...state.tempFis, ...veri },
        })),
      toplamHarcama: () => {
        const liste = get().harcamalar;
        return liste.reduce((toplam, harcama) => toplam + harcama.tutar, 0);
      },
    }),
    {
      name: "fis-takip-deposu", // AsyncStorage'da kaydedilecek klasör adı
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        uid: state.uid,
        isim: state.isim,
        butce: state.butce,
        tumFisler: state.tumFisler,
        tumUrunler: state.tumUrunler,
        harcamalar: state.harcamalar,
      }),
    },
  ),
);
