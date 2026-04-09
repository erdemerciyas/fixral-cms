// ── Core UI Primitives (shadcn-based) ──
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'
export { Badge, badgeVariants } from './badge'
export type { BadgeProps } from './badge'

// ── Legacy re-exports for backward compatibility ──
export { Input, inputVariants } from './_legacy/Input/index'
export type { InputProps } from './_legacy/Input/index'
export { Card, CardHeader, CardTitle, CardBody, CardFooter } from './_legacy/Card/index'
export { Alert, alertVariants } from './_legacy/Alert/index'
export { DSkeleton } from './_legacy/Skeleton/index'
export { PageHeader } from './_legacy/PageHeader'
export { DataTable } from './_legacy/DataTable'
export type { Column as DataTableColumn } from './_legacy/DataTable'
export { FormSection } from './_legacy/FormSection'

// UI Component exports
export { default as Select } from './Select';

// Fixral Design System Components
export { default as FixralButton } from './FixralButton';
export { default as FixralBadge } from './FixralBadge';
export { default as FixralCard } from './FixralCard';
export { default as FixralInput } from './FixralInput';
export { default as FixralModal } from './FixralModal';
export { default as FixralTextarea } from './FixralTextarea';
export { default as FixralSelect } from './FixralSelect';
export { default as TagInput } from './TagInput';

// New UI Primitives
export { default as LanguageSwitch } from './LanguageSwitch';

// Utility Components
export { default as Pagination } from './Pagination';
export { default as SearchInput } from './SearchInput';
export { default as SortSelect } from './SortSelect';
export { default as PriceRangeFilter } from './PriceRangeFilter';
export { default as UniversalEditor } from './UniversalEditor';
