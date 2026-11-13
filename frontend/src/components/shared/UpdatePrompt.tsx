import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 border-[0.5px] border-border bg-surface p-4 text-text-primary rounded-[4px] sm:inset-x-auto sm:right-4 sm:w-96"
    >
      <p className="font-sans text-[13px] font-medium">New Version Available</p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          className="btn-ghost focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={() => setNeedRefresh(false)}
        >
          Later
        </button>
        <button
          type="button"
          className="btn-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={() => updateServiceWorker(true)}
        >
          Update Now
        </button>
      </div>
    </aside>
  )
}
