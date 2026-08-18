import { useEffect, useRef, useState } from 'react'
import { Fuel, Loader2, Sparkles } from 'lucide-react'
import gsap from 'gsap'

interface InitialLoadingScreenProps {
  loading: boolean
}

export function InitialLoadingScreen({ loading }: InitialLoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.to(containerRef.current, {
        autoAlpha: 0,
        scale: 0.98,
        duration: 0.35,
        ease: 'power2.inOut',
        onComplete: () => {
          setVisible(false)
        },
      })
    }
  }, [loading])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      role="status"
      aria-label="Cargando datos de carburantes"
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-900/90 p-6 backdrop-blur-xl transition-all"
    >
      <div className="relative flex flex-col items-center max-w-sm text-center">
        {/* Glow de fondo animado */}
        <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />

        {/* Logo con aura */}
        <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/30">
          <Fuel className="h-8 w-8 text-white animate-bounce" style={{ animationDuration: '2s' }} />
        </div>

        {/* Título de la App */}
        <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          FuelSeeker
        </h2>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
          <Sparkles size={13} />
          Precios oficiales en tiempo real
        </p>

        {/* Barra de progreso pulsante */}
        <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800 ring-1 ring-white/10">
          <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500 animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]" />
        </div>

        {/* Mensaje informativo */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
          <Loader2 size={13} className="animate-spin text-emerald-400" />
          <span>Obteniendo estaciones y precios del MITECO…</span>
        </div>
      </div>
    </div>
  )
}
