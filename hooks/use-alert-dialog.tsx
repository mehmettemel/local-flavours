"use client"

import { create } from 'zustand'

interface AlertDialogState {
  isOpen: boolean
  title: string
  description: string
  type: 'alert' | 'confirm'
  onConfirm?: () => void
  onCancel?: () => void
}

interface AlertDialogStore extends AlertDialogState {
  showAlert: (description: string, title?: string) => void
  showConfirm: (description: string, title?: string) => Promise<boolean>
  close: () => void
}

export const useAlertDialogStore = create<AlertDialogStore>((set, get) => ({
  isOpen: false,
  title: '',
  description: '',
  type: 'alert',
  onConfirm: undefined,
  onCancel: undefined,

  showAlert: (description: string, title: string = 'Uyarı') => {
    set({
      isOpen: true,
      title,
      description,
      type: 'alert',
      onConfirm: () => {
        get().close()
      },
      onCancel: undefined,
    })
  },

  showConfirm: (description: string, title: string = 'Onay') => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title,
        description,
        type: 'confirm',
        onConfirm: () => {
          get().close()
          resolve(true)
        },
        onCancel: () => {
          get().close()
          resolve(false)
        },
      })
    })
  },

  close: () => {
    set({
      isOpen: false,
      title: '',
      description: '',
      type: 'alert',
      onConfirm: undefined,
      onCancel: undefined,
    })
  },
}))

export function useAlertDialog() {
  const store = useAlertDialogStore()

  return {
    alert: store.showAlert,
    confirm: store.showConfirm,
  }
}
