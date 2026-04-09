'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Palette,
  Type,
  Image as ImageIcon,
  Footprints,
  MousePointerClick,
  LayoutGrid,
  Navigation,
  Space,
  FormInput,
  Columns,
  Check,
  RotateCcw,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useActiveTheme } from '@/providers/ActiveThemeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ThemeConfig {
  [key: string]: any;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
    white: string;
    black: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography?: {
    fonts?: { heading: string; body: string; button: string; nav: string };
    sizes?: Record<string, string>;
    weights?: Record<string, string>;
    lineHeights?: Record<string, string>;
    colors?: { heading: string; body: string };
  };
  hero?: {
    enabled: boolean;
    height: string;
    minHeight: string;
    backgroundColor: string;
    backgroundImage: string;
    overlay?: { enabled: boolean; color: string; opacity: number };
    title?: Record<string, any>;
    subtitle?: Record<string, any>;
    buttons?: Record<string, any>;
    alignment: string;
    animation?: { enabled: boolean; type: string; duration: string };
  };
  buttons?: { primary?: Record<string, any>; secondary?: Record<string, any>; tertiary?: Record<string, any> };
  cards?: any;
  navigation?: any;
  spacing?: any;
  borderRadius?: any;
  shadows?: any;
  forms?: any;
  layout?: {
    maxWidth: number;
    sidebar: boolean;
    headerStyle: string;
    footerStyle: string;
    containerPadding: string;
    sectionPadding: string;
  };
  features?: { heroSlider: boolean; portfolioGrid: boolean; blogList: boolean; contactForm: boolean };
  transitions?: any;
  fonts?: { heading: string; body: string };
  footer?: any;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito',
];

type TabId =
  | 'colors'
  | 'typography'
  | 'hero'
  | 'footer'
  | 'buttons'
  | 'cards'
  | 'navigation'
  | 'spacing'
  | 'forms'
  | 'layout';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: 'colors', label: 'Renkler', icon: Palette },
  { id: 'typography', label: 'Tipografi', icon: Type },
  { id: 'hero', label: 'Alt Sayfa Hero', icon: ImageIcon },
  { id: 'footer', label: 'Footer', icon: Footprints },
  { id: 'buttons', label: 'Butonlar', icon: MousePointerClick },
  { id: 'cards', label: 'Kartlar', icon: LayoutGrid },
  { id: 'navigation', label: 'Navigasyon', icon: Navigation },
  { id: 'spacing', label: 'Boşluklar', icon: Space },
  { id: 'forms', label: 'Formlar', icon: FormInput },
  { id: 'layout', label: 'Düzen', icon: Columns },
];

// ---------------------------------------------------------------------------
// Shared small components
// ---------------------------------------------------------------------------

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 rounded-md border border-border cursor-pointer shrink-0"
        />
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <select
        value={value || 'Inter'}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-sm"
      />
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full relative transition-colors ${
          value ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border/60 p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab content components
// ---------------------------------------------------------------------------

function ColorsTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  const colorEntries: [string, string][] = [
    ['colors.primary', 'Primary'],
    ['colors.secondary', 'Secondary'],
    ['colors.accent', 'Accent'],
    ['colors.background', 'Arkaplan'],
    ['colors.text', 'Metin'],
    ['colors.textLight', 'Açık Metin'],
    ['colors.white', 'Beyaz'],
    ['colors.black', 'Siyah'],
    ['colors.success', 'Başarı'],
    ['colors.warning', 'Uyarı'],
    ['colors.error', 'Hata'],
    ['colors.info', 'Bilgi'],
  ];

  return (
    <div className="space-y-5">
      <SectionCard title="Renk Paleti">
        <div className="grid grid-cols-2 gap-4">
          {colorEntries.map(([path, label]) => (
            <ColorField
              key={path}
              label={label}
              value={getNestedValue(config, path) || ''}
              onChange={(v) => update(path, v)}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function TypographyTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Font Aileleri">
        <div className="grid grid-cols-2 gap-4">
          <FontSelect label="Başlık Fontu" value={config.typography?.fonts?.heading || 'Inter'} onChange={(v) => update('typography.fonts.heading', v)} />
          <FontSelect label="Gövde Fontu" value={config.typography?.fonts?.body || 'Inter'} onChange={(v) => update('typography.fonts.body', v)} />
          <FontSelect label="Buton Fontu" value={config.typography?.fonts?.button || 'Inter'} onChange={(v) => update('typography.fonts.button', v)} />
          <FontSelect label="Navigasyon Fontu" value={config.typography?.fonts?.nav || 'Inter'} onChange={(v) => update('typography.fonts.nav', v)} />
        </div>
      </SectionCard>

      <SectionCard title="Font Boyutları">
        <div className="grid grid-cols-3 gap-4">
          {['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'small', 'tiny'].map((key) => (
            <TextField
              key={key}
              label={key.toUpperCase()}
              value={config.typography?.sizes?.[key] || ''}
              onChange={(v) => update(`typography.sizes.${key}`, v)}
              placeholder="1rem"
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Font Ağırlıkları">
        <div className="grid grid-cols-3 gap-4">
          {['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold'].map((key) => (
            <TextField
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={config.typography?.weights?.[key] || ''}
              onChange={(v) => update(`typography.weights.${key}`, v)}
              placeholder="400"
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Satır Yükseklikleri">
        <div className="grid grid-cols-2 gap-4">
          {['tight', 'normal', 'relaxed', 'loose'].map((key) => (
            <TextField
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={config.typography?.lineHeights?.[key] || ''}
              onChange={(v) => update(`typography.lineHeights.${key}`, v)}
              placeholder="1.5"
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Metin Renkleri">
        <div className="grid grid-cols-2 gap-4">
          <ColorField label="Başlık Rengi" value={config.typography?.colors?.heading || ''} onChange={(v) => update('typography.colors.heading', v)} />
          <ColorField label="Gövde Rengi" value={config.typography?.colors?.body || ''} onChange={(v) => update('typography.colors.body', v)} />
        </div>
      </SectionCard>
    </div>
  );
}

function HeroTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  const hero = config.hero;
  return (
    <div className="space-y-5">
      <SectionCard title="Genel">
        <div className="space-y-4">
          <ToggleField label="Hero Aktif" value={hero?.enabled ?? true} onChange={(v) => update('hero.enabled', v)} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Yükseklik" value={hero?.height || ''} onChange={(v) => update('hero.height', v)} placeholder="80vh" />
            <TextField label="Min. Yükseklik" value={hero?.minHeight || ''} onChange={(v) => update('hero.minHeight', v)} placeholder="600px" />
          </div>
          <TextField label="Arkaplan Rengi / Gradient" value={hero?.backgroundColor || ''} onChange={(v) => update('hero.backgroundColor', v)} placeholder="linear-gradient(...)" />
          <TextField label="Arkaplan Görseli URL" value={hero?.backgroundImage || ''} onChange={(v) => update('hero.backgroundImage', v)} placeholder="https://..." />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Hizalama</Label>
              <select
                value={hero?.alignment || 'center'}
                onChange={(e) => update('hero.alignment', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1.5"
              >
                <option value="left">Sol</option>
                <option value="center">Orta</option>
                <option value="right">Sağ</option>
              </select>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Overlay">
        <div className="space-y-4">
          <ToggleField label="Overlay Aktif" value={hero?.overlay?.enabled ?? true} onChange={(v) => update('hero.overlay.enabled', v)} />
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Overlay Rengi" value={hero?.overlay?.color || '#000000'} onChange={(v) => update('hero.overlay.color', v)} />
            <TextField label="Opaklık" value={String(hero?.overlay?.opacity ?? 0.4)} onChange={(v) => update('hero.overlay.opacity', parseFloat(v) || 0)} placeholder="0.4" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Başlık">
        <div className="space-y-4">
          <TextField label="Metin" value={hero?.title?.text || ''} onChange={(v) => update('hero.title.text', v)} />
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Renk" value={hero?.title?.color || '#FFFFFF'} onChange={(v) => update('hero.title.color', v)} />
            <TextField label="Font Boyutu" value={hero?.title?.fontSize || ''} onChange={(v) => update('hero.title.fontSize', v)} placeholder="3.5rem" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Font Ağırlığı" value={hero?.title?.fontWeight || ''} onChange={(v) => update('hero.title.fontWeight', v)} placeholder="700" />
            <TextField label="Satır Yüksekliği" value={hero?.title?.lineHeight || ''} onChange={(v) => update('hero.title.lineHeight', v)} placeholder="1.2" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Alt Başlık">
        <div className="space-y-4">
          <TextField label="Metin" value={hero?.subtitle?.text || ''} onChange={(v) => update('hero.subtitle.text', v)} />
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Renk" value={hero?.subtitle?.color || '#F3F4F6'} onChange={(v) => update('hero.subtitle.color', v)} />
            <TextField label="Font Boyutu" value={hero?.subtitle?.fontSize || ''} onChange={(v) => update('hero.subtitle.fontSize', v)} placeholder="1.25rem" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Animasyon">
        <div className="space-y-4">
          <ToggleField label="Animasyon Aktif" value={hero?.animation?.enabled ?? true} onChange={(v) => update('hero.animation.enabled', v)} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Tür</Label>
              <select
                value={hero?.animation?.type || 'fade-up'}
                onChange={(e) => update('hero.animation.type', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1.5"
              >
                <option value="fade-up">Fade Up</option>
                <option value="fade-in">Fade In</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="none">Yok</option>
              </select>
            </div>
            <TextField label="Süre" value={hero?.animation?.duration || ''} onChange={(v) => update('hero.animation.duration', v)} placeholder="0.8s" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function FooterTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  const entries: [string, string][] = [
    ['footer.backgroundColor', 'Arkaplan Rengi'],
    ['footer.textColor', 'Metin Rengi'],
    ['footer.headingColor', 'Başlık Rengi'],
    ['footer.linkColor', 'Link Rengi'],
    ['footer.linkHoverColor', 'Link Hover Rengi'],
    ['footer.accentColor', 'Vurgu Rengi'],
    ['footer.borderColor', 'Kenarlık Rengi'],
    ['footer.bottomBackgroundColor', 'Alt Arkaplan'],
    ['footer.bottomTextColor', 'Alt Metin Rengi'],
  ];

  return (
    <div className="space-y-5">
      <SectionCard title="Footer Renkleri">
        <div className="grid grid-cols-2 gap-4">
          {entries.map(([path, label]) => (
            <ColorField
              key={path}
              label={label}
              value={getNestedValue(config, path) || ''}
              onChange={(v) => update(path, v)}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function ButtonsTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  const variants: [string, string][] = [
    ['buttons.primary', 'Primary Buton'],
    ['buttons.secondary', 'Secondary Buton'],
    ['buttons.tertiary', 'Tertiary Buton'],
  ];

  return (
    <div className="space-y-5">
      {variants.map(([prefix, title]) => {
        const btn = getNestedValue(config, prefix) || {};
        return (
          <SectionCard key={prefix} title={title}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ColorField label="Arkaplan" value={btn.backgroundColor || ''} onChange={(v) => update(`${prefix}.backgroundColor`, v)} />
                <ColorField label="Metin Rengi" value={btn.textColor || ''} onChange={(v) => update(`${prefix}.textColor`, v)} />
                <ColorField label="Hover Arkaplan" value={btn.hoverBackgroundColor || ''} onChange={(v) => update(`${prefix}.hoverBackgroundColor`, v)} />
                <ColorField label="Hover Metin" value={btn.hoverTextColor || ''} onChange={(v) => update(`${prefix}.hoverTextColor`, v)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <TextField label="Font Boyutu" value={btn.fontSize || ''} onChange={(v) => update(`${prefix}.fontSize`, v)} placeholder="1rem" />
                <TextField label="Font Ağırlığı" value={btn.fontWeight || ''} onChange={(v) => update(`${prefix}.fontWeight`, v)} placeholder="600" />
                <TextField label="Padding" value={btn.padding || ''} onChange={(v) => update(`${prefix}.padding`, v)} placeholder="0.75rem 1.5rem" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Border Radius" value={btn.borderRadius || ''} onChange={(v) => update(`${prefix}.borderRadius`, v)} placeholder="0.5rem" />
                <TextField label="Geçiş" value={btn.transition || ''} onChange={(v) => update(`${prefix}.transition`, v)} placeholder="all 0.3s ease" />
              </div>
              {prefix !== 'buttons.primary' && (
                <div className="grid grid-cols-2 gap-4">
                  <ColorField label="Kenarlık Rengi" value={btn.borderColor || ''} onChange={(v) => update(`${prefix}.borderColor`, v)} />
                  <TextField label="Kenarlık Genişliği" value={btn.borderWidth || ''} onChange={(v) => update(`${prefix}.borderWidth`, v)} placeholder="2px" />
                </div>
              )}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

function CardsTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  const cards = config.cards || {};
  return (
    <div className="space-y-5">
      <SectionCard title="Kart Genel">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Arkaplan" value={cards.backgroundColor || ''} onChange={(v) => update('cards.backgroundColor', v)} />
            <TextField label="Padding" value={cards.padding || ''} onChange={(v) => update('cards.padding', v)} placeholder="1.5rem" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Border Radius" value={cards.borderRadius || ''} onChange={(v) => update('cards.borderRadius', v)} placeholder="0.75rem" />
            <TextField label="Gölge" value={cards.boxShadow || ''} onChange={(v) => update('cards.boxShadow', v)} placeholder="0 1px 3px rgba(0,0,0,0.1)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Hover Gölge" value={cards.hoverShadow || ''} onChange={(v) => update('cards.hoverShadow', v)} />
            <TextField label="Geçiş" value={cards.transition || ''} onChange={(v) => update('cards.transition', v)} placeholder="all 0.3s ease" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Kart Başlık">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Font Boyutu" value={cards.title?.fontSize || ''} onChange={(v) => update('cards.title.fontSize', v)} placeholder="1.25rem" />
          <TextField label="Font Ağırlığı" value={cards.title?.fontWeight || ''} onChange={(v) => update('cards.title.fontWeight', v)} placeholder="600" />
          <ColorField label="Renk" value={cards.title?.color || ''} onChange={(v) => update('cards.title.color', v)} />
          <TextField label="Alt Boşluk" value={cards.title?.marginBottom || ''} onChange={(v) => update('cards.title.marginBottom', v)} placeholder="0.75rem" />
        </div>
      </SectionCard>

      <SectionCard title="Kart Açıklama">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Font Boyutu" value={cards.description?.fontSize || ''} onChange={(v) => update('cards.description.fontSize', v)} placeholder="0.875rem" />
          <ColorField label="Renk" value={cards.description?.color || ''} onChange={(v) => update('cards.description.color', v)} />
          <TextField label="Satır Yüksekliği" value={cards.description?.lineHeight || ''} onChange={(v) => update('cards.description.lineHeight', v)} placeholder="1.6" />
        </div>
      </SectionCard>
    </div>
  );
}

function NavigationTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  const nav = config.navigation || {};
  return (
    <div className="space-y-5">
      <SectionCard title="Navigasyon Genel">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Arkaplan" value={nav.backgroundColor || ''} onChange={(v) => update('navigation.backgroundColor', v)} />
            <ColorField label="Metin Rengi" value={nav.textColor || ''} onChange={(v) => update('navigation.textColor', v)} />
            <ColorField label="Hover Rengi" value={nav.hoverColor || ''} onChange={(v) => update('navigation.hoverColor', v)} />
            <ColorField label="Aktif Rengi" value={nav.activeColor || ''} onChange={(v) => update('navigation.activeColor', v)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <TextField label="Font Boyutu" value={nav.fontSize || ''} onChange={(v) => update('navigation.fontSize', v)} placeholder="1rem" />
            <TextField label="Font Ağırlığı" value={nav.fontWeight || ''} onChange={(v) => update('navigation.fontWeight', v)} placeholder="500" />
            <TextField label="Yükseklik" value={nav.height || ''} onChange={(v) => update('navigation.height', v)} placeholder="70px" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Padding" value={nav.padding || ''} onChange={(v) => update('navigation.padding', v)} placeholder="1rem 1.5rem" />
            <TextField label="Gölge" value={nav.boxShadow || ''} onChange={(v) => update('navigation.boxShadow', v)} />
          </div>
          <ToggleField label="Sabit (Sticky)" value={nav.sticky ?? true} onChange={(v) => update('navigation.sticky', v)} />
        </div>
      </SectionCard>

      <SectionCard title="Logo">
        <div className="grid grid-cols-3 gap-4">
          <TextField label="Font Boyutu" value={nav.logo?.fontSize || ''} onChange={(v) => update('navigation.logo.fontSize', v)} placeholder="1.5rem" />
          <TextField label="Font Ağırlığı" value={nav.logo?.fontWeight || ''} onChange={(v) => update('navigation.logo.fontWeight', v)} placeholder="700" />
          <ColorField label="Renk" value={nav.logo?.color || ''} onChange={(v) => update('navigation.logo.color', v)} />
        </div>
      </SectionCard>
    </div>
  );
}

function SpacingTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Boşluklar">
        <div className="grid grid-cols-3 gap-4">
          {['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].map((key) => (
            <TextField
              key={key}
              label={key.toUpperCase()}
              value={config.spacing?.[key] || ''}
              onChange={(v) => update(`spacing.${key}`, v)}
              placeholder="1rem"
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Border Radius">
        <div className="grid grid-cols-3 gap-4">
          {['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].map((key) => (
            <TextField
              key={key}
              label={key.toUpperCase()}
              value={config.borderRadius?.[key] || ''}
              onChange={(v) => update(`borderRadius.${key}`, v)}
              placeholder="0.5rem"
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Gölgeler">
        <div className="grid grid-cols-2 gap-4">
          {['sm', 'md', 'lg', 'xl'].map((key) => (
            <TextField
              key={key}
              label={key.toUpperCase()}
              value={config.shadows?.[key] || ''}
              onChange={(v) => update(`shadows.${key}`, v)}
              placeholder="0 1px 2px rgba(0,0,0,0.05)"
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function FormsTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  const forms = config.forms || {};
  return (
    <div className="space-y-5">
      <SectionCard title="Input">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Arkaplan" value={forms.input?.backgroundColor || ''} onChange={(v) => update('forms.input.backgroundColor', v)} />
            <ColorField label="Kenarlık Rengi" value={forms.input?.borderColor || ''} onChange={(v) => update('forms.input.borderColor', v)} />
            <ColorField label="Metin Rengi" value={forms.input?.color || ''} onChange={(v) => update('forms.input.color', v)} />
            <ColorField label="Focus Kenarlık" value={forms.input?.focusBorderColor || ''} onChange={(v) => update('forms.input.focusBorderColor', v)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <TextField label="Font Boyutu" value={forms.input?.fontSize || ''} onChange={(v) => update('forms.input.fontSize', v)} placeholder="1rem" />
            <TextField label="Padding" value={forms.input?.padding || ''} onChange={(v) => update('forms.input.padding', v)} placeholder="0.75rem 1rem" />
            <TextField label="Border Radius" value={forms.input?.borderRadius || ''} onChange={(v) => update('forms.input.borderRadius', v)} placeholder="0.375rem" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Placeholder Rengi" value={forms.input?.placeholderColor || ''} onChange={(v) => update('forms.input.placeholderColor', v)} />
            <ColorField label="Focus Ring" value={forms.input?.focusRingColor || ''} onChange={(v) => update('forms.input.focusRingColor', v)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Label">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Font Boyutu" value={forms.label?.fontSize || ''} onChange={(v) => update('forms.label.fontSize', v)} placeholder="0.875rem" />
          <TextField label="Font Ağırlığı" value={forms.label?.fontWeight || ''} onChange={(v) => update('forms.label.fontWeight', v)} placeholder="500" />
          <ColorField label="Renk" value={forms.label?.color || ''} onChange={(v) => update('forms.label.color', v)} />
          <TextField label="Alt Boşluk" value={forms.label?.marginBottom || ''} onChange={(v) => update('forms.label.marginBottom', v)} placeholder="0.5rem" />
        </div>
      </SectionCard>

      <SectionCard title="Form Butonu">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Arkaplan" value={forms.button?.backgroundColor || ''} onChange={(v) => update('forms.button.backgroundColor', v)} />
            <ColorField label="Metin Rengi" value={forms.button?.textColor || ''} onChange={(v) => update('forms.button.textColor', v)} />
            <ColorField label="Hover Arkaplan" value={forms.button?.hoverBackgroundColor || ''} onChange={(v) => update('forms.button.hoverBackgroundColor', v)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <TextField label="Font Boyutu" value={forms.button?.fontSize || ''} onChange={(v) => update('forms.button.fontSize', v)} placeholder="1rem" />
            <TextField label="Font Ağırlığı" value={forms.button?.fontWeight || ''} onChange={(v) => update('forms.button.fontWeight', v)} placeholder="600" />
            <TextField label="Padding" value={forms.button?.padding || ''} onChange={(v) => update('forms.button.padding', v)} placeholder="0.75rem 2rem" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Border Radius" value={forms.button?.borderRadius || ''} onChange={(v) => update('forms.button.borderRadius', v)} placeholder="0.5rem" />
            <TextField label="Geçiş" value={forms.button?.transition || ''} onChange={(v) => update('forms.button.transition', v)} placeholder="all 0.3s ease" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function LayoutTab({ config, update }: { config: ThemeConfig; update: (path: string, val: any) => void }) {
  const layout = (config.layout || {}) as Record<string, any>;
  return (
    <div className="space-y-5">
      <SectionCard title="Düzen Ayarları">
        <div className="space-y-4">
          <TextField label="Maks. Genişlik (px)" value={String(layout.maxWidth || 1280)} onChange={(v) => update('layout.maxWidth', parseInt(v) || 1280)} type="number" />
          <ToggleField label="Sidebar" value={layout.sidebar ?? false} onChange={(v) => update('layout.sidebar', v)} description="Yan menü gösterilsin mi?" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Header Stili</Label>
              <select
                value={layout.headerStyle || 'fixed'}
                onChange={(e) => update('layout.headerStyle', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1.5"
              >
                <option value="fixed">Sabit</option>
                <option value="sticky">Yapışkan</option>
                <option value="static">Statik</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Footer Stili</Label>
              <select
                value={layout.footerStyle || 'simple'}
                onChange={(e) => update('layout.footerStyle', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1.5"
              >
                <option value="simple">Basit</option>
                <option value="detailed">Detaylı</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Container Padding" value={layout.containerPadding || ''} onChange={(v) => update('layout.containerPadding', v)} placeholder="1.5rem" />
            <TextField label="Section Padding" value={layout.sectionPadding || ''} onChange={(v) => update('layout.sectionPadding', v)} placeholder="5rem 0" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Özellik Kontrolleri">
        <div className="space-y-3">
          <ToggleField label="Hero Slider" value={config.features?.heroSlider ?? true} onChange={(v) => update('features.heroSlider', v)} />
          <ToggleField label="Portfolyo Grid" value={config.features?.portfolioGrid ?? true} onChange={(v) => update('features.portfolioGrid', v)} />
          <ToggleField label="Blog Listesi" value={config.features?.blogList ?? true} onChange={(v) => update('features.blogList', v)} />
          <ToggleField label="İletişim Formu" value={config.features?.contactForm ?? true} onChange={(v) => update('features.contactForm', v)} />
        </div>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utility: deeply get/set nested values
// ---------------------------------------------------------------------------

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): any {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.split('.');
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined || current[keys[i]] === null) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}

// ---------------------------------------------------------------------------
// Live preview
// ---------------------------------------------------------------------------

function LivePreview({ config }: { config: ThemeConfig }) {
  const c = config.colors;
  const nav = config.navigation || {};
  const cards = config.cards || {};
  const btn = config.buttons?.primary || {};
  const footer = config.footer || {};

  return (
    <div className="text-xs overflow-hidden rounded-lg border border-border" style={{ fontSize: '10px' }}>
      {/* Nav preview */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: nav.backgroundColor || c.white, color: nav.textColor || c.primary, boxShadow: nav.boxShadow }}
      >
        <span className="font-bold" style={{ color: nav.logo?.color || c.primary }}>Logo</span>
        <div className="flex gap-2" style={{ color: nav.textColor || c.primary }}>
          <span>Ana Sayfa</span>
          <span>Hakkımızda</span>
          <span>İletişim</span>
        </div>
      </div>

      {/* Hero preview */}
      {config.hero?.enabled !== false && (
        <div
          className="py-6 px-3 text-center relative"
          style={{ background: config.hero?.backgroundColor || `linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 100%)` }}
        >
          {config.hero?.overlay?.enabled && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: config.hero.overlay.color || '#000',
                opacity: config.hero.overlay.opacity ?? 0.4,
              }}
            />
          )}
          <div className="relative">
            <div className="font-bold mb-1" style={{ color: config.hero?.title?.color || '#fff' }}>
              {config.hero?.title?.text || 'Başlık'}
            </div>
            <div style={{ color: config.hero?.subtitle?.color || '#f3f4f6' }}>
              {config.hero?.subtitle?.text || 'Alt başlık metni'}
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-3 space-y-2" style={{ backgroundColor: c.background, color: c.text }}>
        {/* Card preview */}
        <div
          className="p-2 rounded"
          style={{
            backgroundColor: cards.backgroundColor || c.white,
            boxShadow: cards.boxShadow || '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: cards.borderRadius || '0.5rem',
          }}
        >
          <div className="font-semibold mb-0.5" style={{ color: cards.title?.color || c.primary }}>
            Kart Başlık
          </div>
          <div style={{ color: cards.description?.color || c.textLight }}>
            Kart açıklama metni burada yer alır.
          </div>
        </div>

        {/* Button preview */}
        <div className="flex gap-2">
          <span
            className="px-2 py-1 rounded text-center inline-block"
            style={{
              backgroundColor: btn.backgroundColor || c.primary,
              color: btn.textColor || c.white,
              borderRadius: btn.borderRadius || '0.5rem',
            }}
          >
            Buton
          </span>
          <span
            className="px-2 py-1 rounded text-center inline-block border"
            style={{
              color: config.buttons?.secondary?.textColor || c.primary,
              borderColor: config.buttons?.secondary?.borderColor || c.primary,
              borderRadius: config.buttons?.secondary?.borderRadius || '0.5rem',
            }}
          >
            Secondary
          </span>
        </div>

        {/* Color swatches */}
        <div className="flex gap-1 flex-wrap pt-1">
          {Object.entries(c).map(([key, val]) => (
            <div key={key} className="flex flex-col items-center">
              <div className="w-5 h-5 rounded border border-black/10" style={{ backgroundColor: val }} />
              <span className="text-[8px] text-muted-foreground mt-0.5 leading-none">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer preview */}
      <div
        className="px-3 py-2 text-center"
        style={{
          backgroundColor: footer.backgroundColor || '#0f1b26',
          color: footer.textColor || '#94a3b8',
        }}
      >
        <span style={{ color: footer.headingColor || '#fff' }} className="font-semibold">Footer</span>
        <div>© 2025 Site</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ThemeCustomizePage() {
  const { status } = useSession();
  const router = useRouter();
  const { refreshTheme } = useActiveTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('colors');
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    loadConfig();
  }, [status, router]);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/site-settings');
      if (!res.ok) throw new Error('Ayarlar yüklenemedi');
      const data = await res.json();
      const tc = data.themeConfig || {};
      if (!tc.colors) {
        tc.colors = {
          primary: '#003450', secondary: '#3A506B', accent: '#003450',
          background: '#F8F9FA', text: '#3D3D3D', textLight: '#6B7280',
          white: '#FFFFFF', black: '#000000', success: '#10B981',
          warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
        };
      }
      setConfig(tc);
      setOriginalConfig(JSON.parse(JSON.stringify(tc)));
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = useCallback(
    (path: string, value: any) => {
      setConfig((prev) => {
        if (!prev) return prev;
        return setNestedValue(prev, path, value);
      });
    },
    [],
  );

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeConfig: config }),
      });
      if (!res.ok) throw new Error('Kaydedilemedi');
      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setMessage({ type: 'success', text: 'Tema ayarları başarıyla kaydedildi!' });
      await refreshTheme();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Kaydetme sırasında hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalConfig) {
      setConfig(JSON.parse(JSON.stringify(originalConfig)));
      setMessage(null);
    }
  };

  // ------- Loading / Error states -------
  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div className="col-span-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl mb-4" />
            ))}
          </div>
          <div className="col-span-3">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Hata</h2>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button onClick={loadConfig} className="mt-2">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (!config) return null;

  // ------- Tab content renderer -------
  const tabContentMap: Record<TabId, React.ReactNode> = {
    colors: <ColorsTab config={config} update={updateConfig} />,
    typography: <TypographyTab config={config} update={updateConfig} />,
    hero: <HeroTab config={config} update={updateConfig} />,
    footer: <FooterTab config={config} update={updateConfig} />,
    buttons: <ButtonsTab config={config} update={updateConfig} />,
    cards: <CardsTab config={config} update={updateConfig} />,
    navigation: <NavigationTab config={config} update={updateConfig} />,
    spacing: <SpacingTab config={config} update={updateConfig} />,
    forms: <FormsTab config={config} update={updateConfig} />,
    layout: <LayoutTab config={config} update={updateConfig} />,
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tema Özelleştirme</h1>
        <p className="text-muted-foreground mt-1">Sitenizin görünümünü buradan özelleştirin</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* 3-column layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar – tab navigation */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-card rounded-xl border border-border/60 shadow-sm sticky top-20">
            <nav className="p-2 space-y-0.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : ''}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Save / Reset */}
            <div className="border-t border-border/60 p-3 space-y-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full rounded-lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Sıfırla
              </Button>
            </div>
          </div>
        </div>

        {/* Center – form fields */}
        <div className="col-span-12 lg:col-span-6">
          {tabContentMap[activeTab]}
        </div>

        {/* Right sidebar – live preview */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-card rounded-xl border border-border/60 shadow-sm sticky top-20">
            <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Canlı Önizleme</span>
            </div>
            <div className="p-3">
              <LivePreview config={config} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
