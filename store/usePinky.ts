import { create } from "zustand";
import { emptyProfile, RankedLead, ResumeProfile, SearchParams } from "@/types";

interface PinkyState {
  resumeFileName?: string;
  profile: ResumeProfile;
  params: SearchParams;
  leads: RankedLead[];

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
  preferencesText: "",
};

export const usePinky = create<PinkyState>((set) => ({
  resumeFileName: undefined,
  profile: emptyProfile,
  params: defaultParams,
  leads: [],

  setResumeFileName: (name) => set({ resumeFileName: name }),
  setProfile: (profile) => set({ profile }),
  setParams: (params) =>
    set((state) => ({ params: { ...state.params, ...params } })),
  setLeads: (leads) => set({ leads }),
  reset: () =>
    set({
      resumeFileName: undefined,
      profile: emptyProfile,
      params: defaultParams,
      leads: [],
    }),
}));
