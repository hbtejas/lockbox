import { X } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import Button from './Button'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
}

function Modal({ open, title, onClose, children }: PropsWithChildren<ModalProps>) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default Modal
