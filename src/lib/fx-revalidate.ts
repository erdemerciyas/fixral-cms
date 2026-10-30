/**
 * Panel ↔ site canlı bağlantısı: yönetim paneli API'lerindeki değiştirici
 * (POST/PUT/PATCH/DELETE) handler'ları bu sarmalayıcıdan geçer. Başarılı yanıttan
 * sonra FIXRAL site verisi önbelleği ve public sayfalar (ISR) anında tazelenir.
 */
import { revalidateFx } from './fx-data-server'

export function withFxRevalidate<A extends unknown[], R extends Response>(handler: (...args: A) => Promise<R>) {
  return async (...args: A): Promise<R> => {
    const res = await handler(...args)
    if (res && res.status < 400) revalidateFx()
    return res
  }
}
