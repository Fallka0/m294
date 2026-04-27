'use client'

import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

type AnimationFrameSnapshot = Record<string, string | number>

function buildKeyframes(from: AnimationFrameSnapshot, steps: AnimationFrameSnapshot[]) {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))])

  return [...keys].reduce<Record<string, Array<string | number | undefined>>>((accumulator, key) => {
    accumulator[key] = [from[key], ...steps.map((step) => step[key])]
    return accumulator
  }, {})
}

interface BlurTextProps {
  text: string
  delay?: number
  className?: string
  animateBy?: 'words' | 'letters'
  direction?: 'top' | 'bottom'
  threshold?: number
  rootMargin?: string
  animationFrom?: AnimationFrameSnapshot
  animationTo?: AnimationFrameSnapshot[]
  easing?: (value: number) => number
  onAnimationComplete?: () => void
  stepDuration?: number
}

export default function BlurText({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (value) => value,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('')
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const current = ref.current
    if (!current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(current)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(current)
    return () => observer.disconnect()
  }, [rootMargin, threshold])

  const defaultFrom = useMemo<AnimationFrameSnapshot>(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -50 }
        : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction],
  )

  const defaultTo = useMemo<AnimationFrameSnapshot[]>(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5,
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction],
  )

  const fromSnapshot = animationFrom ?? defaultFrom
  const toSnapshots = animationTo ?? defaultTo
  const stepCount = toSnapshots.length + 1
  const totalDuration = stepDuration * (stepCount - 1)
  const times = Array.from({ length: stepCount }, (_, index) => (stepCount === 1 ? 0 : index / (stepCount - 1)))

  return (
    <p ref={ref} className={`blur-text flex flex-wrap ${className}`}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots)

        return (
          <motion.span
            key={`${segment}-${index}`}
            className="inline-block will-change-[transform,filter,opacity]"
            initial={fromSnapshot as never}
            animate={(inView ? animateKeyframes : fromSnapshot) as never}
            transition={{
              duration: totalDuration,
              times,
              delay: (index * delay) / 1000,
              ease: easing,
            }}
            onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        )
      })}
    </p>
  )
}
