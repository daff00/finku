import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-md text-center">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="size-10 bg-accent rounded-sm mb-4 flex items-center justify-center shadow-sm">
            <span className="text-white text-xl font-mono tracking-tight">
              金
            </span>
          </div>

          <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-sans">
            間 · Finku
          </div>
        </div>

        {/* 404 */}
        <div className="space-y-3">
          <div className="text-[72px] leading-none font-light font-playfair text-accent">
            404
          </div>

          <h1 className="text-xl font-light text-text-primary font-playfair">
            Page not found
          </h1>

          <p className="text-sm text-text-muted font-sans leading-relaxed">
            The page you’re looking for doesn’t exist or may have been moved.
          </p>
        </div>

        {/* Action */}
        <div className="mt-8">
          <Button
            className="bg-accent text-white rounded-[4px] hover:bg-accent/90 transition-colors font-sans text-sm font-normal"
          >
            <Link to="/">
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-text-muted/70 mt-10 font-sans tracking-wide">
          Finku · Personal Finance
        </p>
      </div>
    </div>
  )
}