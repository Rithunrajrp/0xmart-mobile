import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TestnetState {
  isTestnetMode: boolean;
  setTestnetMode: (enabled: boolean) => void;
  toggleTestnetMode: () => void;
}

export const useTestnetStore = create<TestnetState>()(
  persist(
    (set) => ({
      isTestnetMode: false,
      setTestnetMode: (enabled: boolean) => set({ isTestnetMode: enabled }),
      toggleTestnetMode: () => set((state) => ({ isTestnetMode: !state.isTestnetMode })),
    }),
    {
      name: "testnet-mode-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
