import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AlertCircle, CheckCircle, X } from 'lucide-react'

interface Toast {
  id: number
  message: string
  type: 'error' | 'success'
}

interface ToastContextType {
  showError: (message: string) => void
  showSuccess: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: 'error' | 'success') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), type === 'error' ? 5000 : 3000)
  }, [removeToast])

  const showError = useCallback((message: string) => addToast(message, 'error'), [addToast])
  const showSuccess = useCallback((message: string) => addToast(message, 'success'), [addToast])

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-3 rounded-lg shadow-lg border animate-slide-up ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle size={18} className="shrink-0 mt-0.5" />}
            <p className="text-sm flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
