import { create } from 'zustand'

export const useStore = create((set) => ({
  env: 'house', // 'house' | 'cafe' | 'office'
  night: false,
  explode: 0,
  transparent: false,
  lidar: false,
  botCam: true,
  speed: 0.35,
  distance: 0,
  set: (patch) => set(patch),
}))