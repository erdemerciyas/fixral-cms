'use client'

import * as React from 'react'
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

type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

type ConfirmState = ConfirmOptions & {
  open: boolean
  resolve: ((value: boolean) => void) | null
}

const ConfirmContext = React.createContext<{
  confirm: (options?: ConfirmOptions) => Promise<boolean>
}>({
  confirm: () => Promise.resolve(false),
})

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmState>({
    open: false,
    resolve: null,
  })

  const confirm = React.useCallback((options: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        resolve,
        title: options.title || 'Emin misiniz?',
        description: options.description || 'Bu işlem geri alınamaz.',
        confirmText: options.confirmText || 'Evet, devam et',
        cancelText: options.cancelText || 'İptal',
        variant: options.variant || 'destructive',
      })
    })
  }, [])

  const handleAction = React.useCallback(
    (result: boolean) => {
      state.resolve?.(result)
      setState((prev) => ({ ...prev, open: false, resolve: null }))
    },
    [state.resolve]
  )

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) handleAction(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleAction(false)}>
              {state.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(true)}
              className={
                state.variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {state.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return React.useContext(ConfirmContext)
}
