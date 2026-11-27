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
  const [isHoldingIcon, setIsHoldingIcon] = useState(false)
  const holdTimerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    setIsHoldingIcon(false)
  }

  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) {
        clearTimeout(holdTimerRef.current)
      }
    }
  }, [])

  const handleIconPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onLongPressIcon) return
    if (e.pointerType === 'mouse' && e.button !== 0) return

    clearHoldTimer()
    longPressTriggeredRef.current = false
    setIsHoldingIcon(true)

    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null
      longPressTriggeredRef.current = true
      setIsHoldingIcon(false)
      onLongPressIcon()
    }, longPressMs)
  }

  const handleIconPointerEnd = () => {
    if (!onLongPressIcon) return
    clearHoldTimer()
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (longPressTriggeredRef.current) {
      e.preventDefault()
      e.stopPropagation()
      longPressTriggeredRef.current = false
      return
    }
    sound.playTap()
    onSelect()
  }

  return (
    <div
      onClick={handleClick}
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
      {/* Large, generous tactile icon (supports 5s long-press when configured) */}
      <div
        onPointerDown={handleIconPointerDown}
        onPointerUp={handleIconPointerEnd}
        onPointerCancel={handleIconPointerEnd}
        onPointerLeave={handleIconPointerEnd}
        onContextMenu={(e) => {
          if (onLongPressIcon) e.preventDefault()
        }}
        style={
          onLongPressIcon
            ? { WebkitTouchCallout: 'none', touchAction: 'none' }
            : undefined
        }
        className={`relative overflow-hidden flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${activity.color} text-white shadow-xs sm:shadow-md shrink-0`}
      >
        {onLongPressIcon && (
          <div
            aria-hidden="true"
            style={{
              height: isHoldingIcon ? '100%' : '0%',
              transition: isHoldingIcon
                ? `height ${longPressMs}ms linear`
                : 'height 120ms ease-out',
            }}
            className="absolute inset-x-0 bottom-0 bg-white/35 pointer-events-none"
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
    </div>
  )
}
