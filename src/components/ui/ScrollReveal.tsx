'use client'

import { motion, type Variants } from 'framer-motion'
import { type ReactNode } from 'react'

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.32, 0.72, 0, 1],
    },
  },
}

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'ul' | 'li'
  stagger?: boolean
  delay?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  as = 'div',
  stagger = false,
  delay = 0,
  once = true,
}: ScrollRevealProps) {
  const Component = motion[as] as typeof motion.div

  if (stagger) {
    return (
      <Component
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-60px' }}
        className={className}
      >
        {children}
      </Component>
    )
  }

  return (
    <Component
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once, margin: '-60px' }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.32, 0.72, 0, 1],
      }}
      className={className}
    >
      {children}
    </Component>
  )
}

export function ScrollRevealItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
