import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  ALL_OPPORTUNITY_TYPES,
  emptyProfile,
  RankedLead,
  ResumeProfile,
  SearchParams,
} from "@/types";

interface PinkyState {
  resumeFileName?: string;
  profile: ResumeProfile;
  params: SearchParams;
  leads: RankedLead[];
  hasSearched: boolean;

  setResumeFileName: (name?: string) => void;
  setProfile: (profile: ResumeProfile) => void;
  setParams: (params: Partial<SearchParams>) => void;
  setLeads: (leads: RankedLead[]) => void;
  reset: () => void;
}

const defaultParams: SearchParams = {
  city: "",
  state: "",
  zip: "",
  radiusMiles: 25,
  remote: false,
  query: "",
  preferencesText: "",
  opportunityTypes: [...ALL_OPPORTUNITY_TYPES],
};

// Persist to localStorage on web so a browser refresh keeps the session.
// Native (and server render) falls back to in-memory storage — the factory is
// lazy so `window` is never touched during server evaluation.
const memory = new Map<string, string>();
const storage = createJSONStorage<Partial<PinkyState>>(() =>
  Platform.OS === "web" && typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : {
        getItem: (k: string) => memory.get(k) ?? null,
        setItem: (k: string, v: string) => void memory.set(k, v),
        removeItem: (k: string) => void memory.delete(k),
      }
);

export const usePinky = create<PinkyState>()(
  persist(
    (set) => ({
      resumeFileName: undefined,
      profile: emptyProfile,
      params: defaultParams,
      leads: [],
      hasSearched: false,

      setResumeFileName: (name) => set({ resumeFileName: name }),
      setProfile: (profile) => set({ profile }),
      setParams: (params) =>
        set((state) => ({ params: { ...state.params, ...params } })),
      setLeads: (leads) => set({ leads, hasSearched: true }),
      reset: () =>
        set({
          resumeFileName: undefined,
          profile: emptyProfile,
          params: defaultParams,
          leads: [],
          hasSearched: false,
        }),
    }),
    {
      name: "pinky-store",
      version: 1,
      storage,
      partialize: (s) => ({
        resumeFileName: s.resumeFileName,
        profile: s.profile,
        params: s.params,
        leads: s.leads,
        hasSearched: s.hasSearched,
      }),
    }
  )
);
