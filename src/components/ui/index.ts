// ── Core UI Primitives (shadcn-based) ──
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'
export { Badge, badgeVariants } from './badge'
export type { BadgeProps } from './badge'

// UI Component exports
export { default as Select } from './Select';
export { default as TagInput } from './TagInput';
export { default as LanguageSwitch } from './LanguageSwitch';
export { ThemeToggle } from './ThemeToggle';

// Utility Components
export { default as Pagination } from './Pagination';
export { default as UniversalEditor } from './UniversalEditor';

// ── Motion & interaction primitives (taste-skill, Phase 0) ──
export { RevealStagger } from './RevealStagger'
export { MagneticButton } from './MagneticButton'

// ── Layout & feedback primitives ──
export { SectionHeader } from './SectionHeader'
export { EmptyState } from './EmptyState'
export { ErrorState } from './ErrorState'
export { Skeleton } from './skeleton'
export { SkeletonText, SkeletonCard, SkeletonGrid, SkeletonHero } from './skeletons'

// ── Precision kit primitives (Phase 3) ──
export { BlueprintGrid } from './BlueprintGrid'
export { TechLabel, Eyebrow } from './TechLabel'
export { MeasureRule } from './MeasureRule'
export { DataStat } from './DataStat'
export {
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_STAGGER,
  fadeUp,
  clipReveal,
  staggerContainer,
  staggerItem,
  useMotionPresets,
} from './motion'
