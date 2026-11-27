import React, { useEffect, useRef, useState } from 'react'
import {
  ShoppingBasket,
  Sparkles,
  BookOpen,
  Search,
  HelpCircle,
  Home,
  Music,
  ListOrdered,
  Users,
  Coins,
  CupSoda,
  Clock,
  Mic,
  Briefcase,
  Phone,
  Sun,
  Dices,
  Compass,
  Puzzle,
  Armchair,
  Landmark,
} from 'lucide-react'
import type { ActivityMeta } from '../types'
import { sound } from '../services/sound'

interface Props {
  activity: ActivityMeta
  onSelect: () => void
  onLongPressIcon?: () => void
  longPressMs?: number
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBasket,
  Sparkles,
  BookOpen,
  Search,
  HelpCircle,
  Home,
  Music,
  ListOrdered,
  Users,
  Coins,
  CupSoda,
  Clock,
  Mic,
  Briefcase,
  Phone,
  Sun,
  Dices,
  Compass,
  Puzzle,
  Armchair,
  Landmark,
}

export function ActivityCard({
  activity,
  onSelect,
  onLongPressIcon,
  longPressMs = 5000,
}: Props) {
  const IconComponent = ICON_MAP[activity.iconName] || Sparkles
  const [isHolding, setIsHolding] = useState(false)
  const holdTimerRef = useRef<number | null>(null)
  const showHoldTimerRef = useRef<number | null>(null)
  const ignoreClickRef = useRef(false)
  const ignoreClickResetTimerRef = useRef<number | null>(null)
  const touchActiveRef = useRef(false)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)

  const clearHoldTimers = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    if (showHoldTimerRef.current !== null) {
      clearTimeout(showHoldTimerRef.current)
      showHoldTimerRef.current = null
    }
    setIsHolding(false)
    startPosRef.current = null
  }

  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) clearTimeout(holdTimerRef.current)
      if (showHoldTimerRef.current !== null) clearTimeout(showHoldTimerRef.current)
      if (ignoreClickResetTimerRef.current !== null) {
        clearTimeout(ignoreClickResetTimerRef.current)
      }
    }
  }, [])

  const startLongPress = (x: number, y: number) => {
    if (!onLongPressIcon) return
    clearHoldTimers()
    ignoreClickRef.current = false
    startPosRef.current = { x, y }

    // Delay visual progress slightly (180ms) so normal quick taps never flash
    showHoldTimerRef.current = window.setTimeout(() => {
      setIsHolding(true)
    }, 180)

    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null
      ignoreClickRef.current = true
      setIsHolding(false)
      onLongPressIcon()
    }, longPressMs)
  }

  const endLongPress = () => {
    if (!onLongPressIcon) return
    clearHoldTimers()
    if (ignoreClickRef.current) {
      // Keep click suppression active briefly after finger release so synthetic click never opens the game
      if (ignoreClickResetTimerRef.current !== null) {
        clearTimeout(ignoreClickResetTimerRef.current)
      }
      ignoreClickResetTimerRef.current = window.setTimeout(() => {
        ignoreClickRef.current = false
      }, 600)
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!onLongPressIcon) return
    touchActiveRef.current = true
    const t = e.touches[0]
    if (t) {
      startLongPress(t.clientX, t.clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!onLongPressIcon || !startPosRef.current) return
    const t = e.touches[0]
    if (!t) return
    const dist = Math.hypot(
      t.clientX - startPosRef.current.x,
      t.clientY - startPosRef.current.y,
    )
    // Allow natural finger movement up to 28px while holding for 5s
    if (dist > 28) {
      clearHoldTimers()
    }
  }

  const handleTouchEnd = () => {
    endLongPress()
    window.setTimeout(() => {
      touchActiveRef.current = false
    }, 400)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onLongPressIcon || touchActiveRef.current || e.button !== 0) return
    startLongPress(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    if (touchActiveRef.current) return
    endLongPress()
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ignoreClickRef.current) {
      e.preventDefault()
      e.stopPropagation()
      ignoreClickRef.current = false
      return
    }
    sound.playTap()
    onSelect()
  }

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => {
        if (onLongPressIcon) e.preventDefault()
      }}
      style={
        onLongPressIcon
          ? { WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }
          : undefined
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          sound.playTap()
          onSelect()
        }
      }}
      className={`relative group bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-5 border-2 sm:border-4 ${activity.borderColor} shadow-xs sm:shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-left cursor-pointer flex items-center gap-2.5 sm:gap-5 h-full w-full min-h-0 overflow-hidden`}
    >
      {/* Large, generous tactile icon */}
      <div
        className={`relative overflow-hidden flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${activity.color} text-white shadow-xs sm:shadow-md shrink-0`}
      >
        {onLongPressIcon && (
          <div
            aria-hidden="true"
            style={{
              height: isHolding ? '100%' : '0%',
              transition: isHolding
                ? `height ${longPressMs - 180}ms linear`
                : 'height 120ms ease-out',
            }}
            className="absolute inset-x-0 bottom-0 bg-white/40 pointer-events-none"
          />
        )}
        <IconComponent className="relative z-10 w-7 h-7 sm:w-12 sm:h-12 stroke-[2.4]" />
      </div>

      {/* Big Bold Typography with visible subtitle */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <h2 className="text-sm sm:text-2xl md:text-3xl font-black text-stone-950 leading-tight break-words">
          {activity.title}
        </h2>
        <p className="text-xs sm:text-lg md:text-xl font-bold text-stone-600 mt-0.5 leading-snug break-words">
          {activity.subtitle}
        </p>
      </div>

      {/* Subtle bottom progress bar while holding for 5 seconds */}
      {onLongPressIcon && (
        <div
          aria-hidden="true"
          style={{
            width: isHolding ? '100%' : '0%',
            transition: isHolding
              ? `width ${longPressMs - 180}ms linear`
              : 'width 120ms ease-out',
          }}
          className="absolute bottom-0 left-0 h-1.5 sm:h-2 bg-amber-500 pointer-events-none"
        />
      )}
    </div>
  )
}
