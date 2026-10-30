/**
 * Teklif talebi gönderimi — /api/public/contact uç noktasını kullanır
 * (ad ≥ 2, konu ≥ 5, mesaj ≥ 10 karakter doğrulaması sunucuda yapılır).
 * Anasayfa teklif bandı, iletişim sayfası formu ve teklif modalı ortak kullanır.
 */
export interface QuotePayload {
  name: string
  email: string
  phone?: string
  services?: string[]
  quantity?: string
  size?: string
  material?: string
  message: string
  files?: string[]
  source: 'home' | 'contact' | 'modal' | 'service' | 'software'
}

export async function sendQuote(p: QuotePayload): Promise<{ ok: boolean; message?: string }> {
  const lines = [
    p.services?.length ? `Hizmetler: ${p.services.join(', ')}` : '',
    p.quantity ? `Adet: ${p.quantity}` : '',
    p.size ? `Yaklaşık ölçü: ${p.size}` : '',
    p.material ? `Malzeme / ortam: ${p.material}` : '',
    p.files?.length ? `Ekli dosya adları (dosyalar e-postayla istenecek): ${p.files.join(', ')}` : '',
    '',
    p.message,
    '',
    `Ad Soyad: ${p.name}`,
    p.phone ? `Telefon: ${p.phone}` : '',
    `E-posta: ${p.email}`,
    `Kaynak: ${p.source}`,
  ].filter((l, i, a) => l !== '' || (i > 0 && a[i - 1] !== ''))
  const subject = `Teklif talebi${p.services?.length ? `: ${p.services.slice(0, 3).join(', ')}` : ''}`.slice(0, 200)
  let message = lines.join('\n').trim()
  if (message.length < 10) message = `${message}\n(ayrıntı belirtilmedi)`
  try {
    const res = await fetch('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: p.name, email: p.email, phone: p.phone, subject: subject.length >= 5 ? subject : 'Teklif talebi', message: message.slice(0, 2000) }),
    })
    if (res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    return { ok: false, message: data?.message }
  } catch {
    return { ok: false }
  }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
