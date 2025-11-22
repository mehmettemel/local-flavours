"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAlertDialogStore } from '@/hooks/use-alert-dialog'

export function AlertDialogProvider() {
  const { isOpen, title, description, type, onConfirm, onCancel, close } = useAlertDialogStore()

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {type === 'confirm' && (
            <AlertDialogCancel onClick={onCancel}>İptal</AlertDialogCancel>
          )}
          <AlertDialogAction onClick={onConfirm}>
            {type === 'confirm' ? 'Onayla' : 'Tamam'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
