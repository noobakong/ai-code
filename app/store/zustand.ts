// store.ts
'use client'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { indexedDBStorage } from './indexedDBStorage'

export interface CodeItem {
  png: string
  html: string
  date?: string
}

interface StoreState {
  aiInfo: {
    base_url: string
    key: string
  }
  setAiInfo: (aiInfo: StoreState['aiInfo']) => void
  history: CodeItem[]
  addRecord: (record: CodeItem) => void
  loadHistory: () => Promise<void>
}

const ISSERVER = typeof window === 'undefined'

const useStore = create<StoreState>()(devtools(set => ({
  // localStorage
  aiInfo: ISSERVER
    ? {}
    : localStorage?.getItem('aiInfo')
      ? JSON.parse(localStorage?.getItem('aiInfo') as string)
      : {
          base_url: '',
          key: '',
        },

  setAiInfo: (aiInfo: StoreState['aiInfo']) => {
    localStorage?.setItem('aiInfo', JSON.stringify(aiInfo))
    set(() => ({ aiInfo }))
  },
  history: [],
  addRecord: (record: CodeItem) => {
    set(state => ({ history: [...state.history, record] }))
    indexedDBStorage.setItem('history-storage', record)
  },
  loadHistory: async () => {
    const data = await indexedDBStorage.getItem('history-storage')
    console.log(data, 'data')
    set(() => ({ history: data.map((record: any) => record?.value) }))
  },
}), {
  name: 'ai-code',
}))

export function getGlobalStore() {
  return useStore.getState()
}

export default useStore
