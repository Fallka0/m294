'use client'

import type { HTMLAttributes, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface FadeContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  container?: string | Element | null
  blur?: boolean
  duration?: number
  ease?: string
  delay?: number
  threshold?: number
  initialOpacity?: number
  disappearAfter?: number
  disappearDuration?: number
  disappearEase?: string
  onComplete?: () => void
  onDisappearanceComplete?: () => void
}

export default function FadeContent({
  children,
  container,
  blur = false,
  duration = 1000,
  ease = 'power2.out',
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power2.in',
  onComplete,
  onDisappearanceComplete,
  className = '',
  ...props
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let scrollerTarget = container ?? document.getElementById('snap-main-container') ?? null
    if (typeof scrollerTarget === 'string') {
      scrollerTarget = document.querySelector(scrollerTarget)
    }

    const startPercentage = (1 - threshold) * 100
    const getSeconds = (value: number) => (value > 10 ? value / 1000 : value)

    gsap.set(element, {
      autoAlpha: initialOpacity,
      filter: blur ? 'blur(10px)' : 'blur(0px)',
      willChange: 'opacity, filter, transform',
    })

    const timeline = gsap.timeline({
      paused: true,
      delay: getSeconds(delay),
      onComplete: () => {
        onComplete?.()

        if (disappearAfter > 0) {
          gsap.to(element, {
            autoAlpha: initialOpacity,
            filter: blur ? 'blur(10px)' : 'blur(0px)',
            delay: getSeconds(disappearAfter),
            duration: getSeconds(disappearDuration),
            ease: disappearEase,
            onComplete: () => onDisappearanceComplete?.(),
          })
        }
      },
    })

    timeline.to(element, {
      autoAlpha: 1,
      filter: 'blur(0px)',
      duration: getSeconds(duration),
      ease,
    })

    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      scroller: (scrollerTarget as Element | Window | null) ?? window,
      start: `top ${startPercentage}%`,
      once: true,
      onEnter: () => timeline.play(),
    })

    return () => {
      scrollTrigger.kill()
      timeline.kill()
      gsap.killTweensOf(element)
    }
  }, [
    blur,
    container,
    delay,
    disappearAfter,
    disappearDuration,
    disappearEase,
    duration,
    ease,
    initialOpacity,
    onComplete,
    onDisappearanceComplete,
    threshold,
  ])

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
}
