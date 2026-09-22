'use client'

import { useState, useEffect } from 'react'

const CORRECT_PIN = '0000'

export default function PinLock({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('pin_unlocked')
    if (session === 'true') setUnlocked(true)
    setMounted(true)
  }, [])

  const press = (digit: string) => {
    if (pin.length >= 4) return
    const next = pin + digit
    setPin(next)
    setError(false)

    if (next.length === 4) {
      if (next === CORRECT_PIN) {
        sessionStorage.setItem('pin_unlocked', 'true')
        setUnlocked(true)
      } else {
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
        }, 700)
      }
    }
  }

  const backspace = () => {
    setPin(p => p.slice(0, -1))
    setError(false)
  }

  if (!mounted) return null
  if (unlocked) return <>{children}</>

  const dots = Array.from({ length: 4 }, (_, i) => i < pin.length)

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#eef2ff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Cairo', sans-serif",
      gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#4338ca' }}>الحسين النجاري</div>
        <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>أدخل الرمز السري</div>
      </div>

      {/* dots */}
      <div style={{ display: 'flex', gap: 18 }}>
        {dots.map((filled, i) => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: '50%',
            background: error ? '#ef4444' : filled ? '#4338ca' : 'transparent',
            border: `2px solid ${error ? '#ef4444' : '#4338ca'}`,
            transition: 'background 0.15s',
          }} />
        ))}
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: 13, marginTop: -16 }}>رمز خاطئ</div>
      )}

      {/* numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 12 }}>
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <button key={d} onClick={() => press(d)} style={btnStyle}>{d}</button>
        ))}
        <div />
        <button onClick={() => press('0')} style={btnStyle}>0</button>
        <button onClick={backspace} style={{ ...btnStyle, background: 'transparent', color: '#4338ca', fontSize: 20 }}>⌫</button>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 72, height: 72, borderRadius: '50%',
  background: '#fff',
  border: '1.5px solid #c7d2fe',
  fontSize: 24, fontWeight: 600, color: '#1e1b4b',
  cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
