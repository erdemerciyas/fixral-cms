---
description: Admin panel design rules for shadcn/ui migration. Applied to all files under src/app/admin/ and src/components/admin/.
globs: ["src/app/admin/**", "src/components/admin/**"]
---

# Admin Panel Design System Rules

## Active Configuration (taste-skill adapted for admin CMS)
- DESIGN_VARIANCE: 3 (clean, symmetrical, predictable admin layouts)
- MOTION_INTENSITY: 4 (subtle hover/transition, no heavy animations)
- VISUAL_DENSITY: 7 (data-dense dashboards and tables)

## Mandatory Architecture
- All admin UI components MUST use shadcn/ui primitives from `@/components/ui/`
- Use `lucide-react` for all icons (replacing @heroicons/react in admin)
- Use `sonner` for toast notifications (replacing react-hot-toast and sweetalert2)
- Use shadcn `AlertDialog` for confirmation dialogs (replacing Swal.fire)
- Use shadcn `Dialog` for modals (replacing FixralModal)
- Use shadcn `Sidebar` for navigation layout
- All forms should use shadcn `Input`, `Label`, `Textarea`, `Select`

## Color System
- Primary: brand #003450 (--primary CSS variable, HSL 200 100% 16%)
- Use `bg-primary`, `text-primary`, `bg-primary/10` etc. for brand colors
- Status: `bg-emerald-*` for success, `bg-amber-*` for warning, `bg-destructive` for errors
- Surfaces: `bg-background`, `bg-card`, `bg-muted` for layered surfaces
- Borders: `border-border` for standard, `border-input` for form elements
- Text: `text-foreground`, `text-muted-foreground` for hierarchy

## Layout Rules
- Admin layout uses SidebarProvider + Sidebar + SidebarInset pattern
- Page content padded with `p-6` inside SidebarInset main area
- Page headers use consistent pattern: title + description + actions row
- Data tables use @tanstack/react-table + shadcn Table primitives
- Cards use `rounded-xl border bg-card shadow` (shadcn Card)

## Anti-Patterns (BANNED)
- NO inline hex colors or rgb() in admin components
- NO sweetalert2 or react-hot-toast imports in admin pages
- NO FixralButton, FixralCard, FixralInput, FixralModal usage
- NO direct Tailwind color classes like `bg-indigo-600` or `bg-violet-500`
- NO custom CSS classes for admin UI (use shadcn utility classes only)
- NO `var(--admin-*)` CSS variables in new components (use shadcn tokens)
