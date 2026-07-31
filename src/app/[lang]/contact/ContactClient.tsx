'use client';

import { useState, useEffect, Suspense } from 'react';
import { m } from 'framer-motion';
import { MapPin, Mail as EnvelopeSimple, Phone, Clock, ArrowRight, CheckCircle, AlertCircle as WarningCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import PageHero from '@/components/common/PageHero';
import { BlueprintGrid, TechLabel } from '@/components/ui';
import { ScrollReveal, ScrollRevealItem } from '@/components/ui/ScrollReveal';

const ease = [0.32, 0.72, 0, 1] as const;

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
  };
}

function ContactPageContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'erdem.erciyas@gmail.com',
    phone: '+90 (532) 123 45 67',
    address: 'Altay Mahallesi Bilgi sk No: 5 Turgutlu Manisa',
    workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
    socialLinks: {
      linkedin: '',
      twitter: '@fixral',
      instagram: '',
      facebook: '',
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(true);
  const [hero, setHero] = useState<{ title: string; description: string }>({
    title: 'Bizimle İletişime Geçin',
    description: 'Sorularınız ve önerileriniz için bize ulaşın'
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/public/contact-info');
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data);
        }
      } catch (error) {
        console.error('Contact info fetch error:', error);
      } finally {
        setContactLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  useEffect(() => {
    fetch('/api/admin/page-settings/contact')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setHero({ title: data.title || 'Bizimle İletişime Geçin', description: data.description || '' });
        else setHero({ title: 'Bizimle İletişime Geçin', description: '' });
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Mesaj gönderilirken bir hata oluştu.');
      }

      setSubmitStatus('success');
      setSubmitMessage(result.message || 'Mesajınız başarıyla gönderildi!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Form gönderimi sırasında hata:', error);
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoItems = [
    {
      icon: EnvelopeSimple,
      label: 'E-posta',
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
    },
    {
      icon: Phone,
      label: 'Telefon',
      value: contactInfo.phone,
      href: `tel:${contactInfo.phone.replace(/\s/g, '')}`,
    },
    {
      icon: MapPin,
      label: 'Adres',
      value: contactInfo.address,
    },
    ...(contactInfo.workingHours
      ? [{
          icon: Clock,
          label: 'Çalışma Saatleri',
          value: contactInfo.workingHours,
        }]
      : []),
  ];

  return (
    <div className="min-h-dvh bg-background">
      <PageHero
        title={hero.title || 'İletişim'}
        description={hero.description || 'Bizimle iletişime geçin ve projelerinizi konuşalım'}
        buttonText="İletişim Formu"
        buttonLink="#contact-form"
        showButton={true}
        showBreadcrumbs={true}
        index={5}
      />

      <section id="contact-form" className="relative py-16 lg:py-24">
        {/* Blueprint band — bölüm başında aşağı doğru sönen teknik ızgara */}
        <BlueprintGrid
          density="coarse"
          opacity="faint"
          className="[mask-image:linear-gradient(to_bottom,black,transparent_45%)]"
        />
        <div className="container-content relative">
          <ScrollReveal className="mb-12 lg:mb-16">
            <TechLabel as="p" index={1} marker="crosshair">İletişim</TechLabel>
            <h2 className="mt-4 text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Size nasıl yardımcı olabiliriz?
            </h2>
            <p className="mt-3 max-w-xl text-base text-muted-foreground leading-relaxed">
              Proje teklifleriniz, sorularınız veya iş birliği önerileriniz için formu doldurun. En kısa sürede dönüş yapacağız.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Form — left, 7 cols */}
            <ScrollReveal className="lg:col-span-7" delay={0.05}>
              <div className="rounded-sm bg-card border border-border p-8 lg:p-10 shadow-[var(--shadow-sm)]">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">
                        Adınız Soyadınız
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Örn: Ali Veli"
                        required
                        className="h-12 rounded-xs border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-hidden transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        E-posta Adresiniz
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="iletisim@example.com"
                        required
                        className="h-12 rounded-xs border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-hidden transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground">
                      Konu
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Proje Teklifi"
                      required
                      className="h-12 rounded-xs border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-hidden transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">
                      Mesajınız
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Merhaba, ..."
                      required
                      className="rounded-xs border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-hidden resize-none transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                    />
                  </div>

                  <m.button
                    type="submit"
                    disabled={isSubmitting}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15, ease }}
                    className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xs bg-primary text-sm font-medium text-primary-foreground shadow-[var(--shadow-md)] transition-colors duration-150 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed motion-reduce:transition-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Gönderiliyor...
                      </span>
                    ) : (
                      <>
                        <span>Mesajı Gönder</span>
                        <ArrowRight
                          className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                        />
                      </>
                    )}
                  </m.button>

                  {submitStatus === 'success' && submitMessage && (
                    <m.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease }}
                      className="flex items-start gap-3 rounded-sm border border-success/30 bg-success/10 p-4 text-sm text-success"
                    >
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      <span>{submitMessage}</span>
                    </m.div>
                  )}
                  {submitStatus === 'error' && submitMessage && (
                    <m.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease }}
                      className="flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                    >
                      <WarningCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                      <span>{submitMessage}</span>
                    </m.div>
                  )}
                </form>
              </div>
            </ScrollReveal>

            {/* Info — right, 5 cols */}
            <ScrollReveal className="lg:col-span-5" delay={0.15}>
              <div className="space-y-8">
                <div className="rounded-sm border border-border bg-card p-8 shadow-[var(--shadow-sm)]">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground mb-6">
                    İletişim Bilgilerimiz
                  </h3>
                  {contactLoading ? (
                    <div className="space-y-5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <Skeleton className="h-10 w-10 rounded-xs shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ScrollReveal as="div" stagger className="space-y-5">
                      {infoItems.map((item) => (
                        <ScrollRevealItem key={item.label}>
                          <div className="flex items-start gap-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xs bg-accent">
                              <item.icon className="h-5 w-5 text-accent-foreground" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground mb-1">
                                {item.label}
                              </p>
                              {item.href ? (
                                <a
                                  href={item.href}
                                  className="text-sm text-foreground transition-colors duration-150 hover:text-accent-foreground motion-reduce:transition-none"
                                >
                                  {item.value}
                                </a>
                              ) : (
                                <p className="text-sm text-foreground leading-relaxed">{item.value}</p>
                              )}
                            </div>
                          </div>
                        </ScrollRevealItem>
                      ))}
                    </ScrollReveal>
                  )}
                </div>

                {!contactLoading && (contactInfo.socialLinks.linkedin || contactInfo.socialLinks.twitter || contactInfo.socialLinks.instagram || contactInfo.socialLinks.facebook) && (
                  <div className="rounded-sm border border-border bg-card p-8 shadow-[var(--shadow-sm)]">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground mb-5">
                      Sosyal Medya
                    </h3>
                    <div className="flex gap-3">
                      {contactInfo.socialLinks.linkedin && (
                        <a
                          href={contactInfo.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xs border border-border text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-accent-foreground hover:bg-accent motion-reduce:transition-none"
                        >
                          <span className="sr-only">LinkedIn</span>
                          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" /></svg>
                        </a>
                      )}
                      {contactInfo.socialLinks.twitter && (
                        <a
                          href={contactInfo.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xs border border-border text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-accent-foreground hover:bg-accent motion-reduce:transition-none"
                        >
                          <span className="sr-only">Twitter</span>
                          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" /></svg>
                        </a>
                      )}
                      {contactInfo.socialLinks.instagram && (
                        <a
                          href={contactInfo.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xs border border-border text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-accent-foreground hover:bg-accent motion-reduce:transition-none"
                        >
                          <span className="sr-only">Instagram</span>
                          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" /></svg>
                        </a>
                      )}
                      {contactInfo.socialLinks.facebook && (
                        <a
                          href={contactInfo.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xs border border-border text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-accent-foreground hover:bg-accent motion-reduce:transition-none"
                        >
                          <span className="sr-only">Facebook</span>
                          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" /></svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Map section */}
          <ScrollReveal className="mt-16 lg:mt-24" delay={0.1}>
            <div className="rounded-sm border border-border bg-card p-8 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">Konumumuz</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Haritada göster</span>
                </div>
              </div>

              {contactLoading ? (
                <div className="rounded-sm bg-muted p-4 space-y-3">
                  <Skeleton className="h-10 w-10 rounded-xs" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-sm bg-surface-secondary p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xs bg-accent">
                        <MapPin className="h-5 w-5 text-accent-foreground" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">İletişim Bilgileri</p>
                        <p className="text-xs text-muted-foreground">{contactInfo.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-xs border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors duration-150 hover:border-primary hover:text-accent-foreground motion-reduce:transition-none"
                      >
                        Büyük Harita
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contactInfo.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-xs bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 active:scale-[0.98] motion-reduce:transition-none"
                      >
                        Yol Tarifi
                      </a>
                    </div>
                  </div>

                  <div className="relative h-96 overflow-hidden rounded-sm bg-muted">
                    <iframe
                      src={`https://maps.google.com/maps?width=100%25&height=400&hl=tr&q=${encodeURIComponent(contactInfo.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="İletişim Konumu"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-muted pointer-events-none opacity-100 transition-opacity duration-700"
                      id="map-loading"
                    >
                      <div className="text-center">
                        <span className="mb-2 block h-8 w-8 mx-auto animate-spin rounded-full border-2 border-border border-t-primary" />
                        <span className="text-sm text-muted-foreground">Harita yükleniyor...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

export default function ContactClient() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-background">
        <div className="bg-primary pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="container-content text-center">
            <span className="mb-4 block h-16 w-16 mx-auto animate-spin rounded-full border-4 border-primary-foreground/25 border-t-primary-foreground" />
            <p className="text-primary-foreground/85 text-lg">İletişim sayfası yükleniyor...</p>
          </div>
        </div>
      </div>
    }>
      <ContactPageContent />
    </Suspense>
  );
}
