import { MessageCircle } from 'lucide-react';
import { useSettings } from '@/features/settings/settings-api';
import { toWhatsAppDigits } from '@/lib/utils';

export function WhatsAppFloatButton() {
  const { data: settings } = useSettings();
  const whatsapp = settings?.contact?.whatsapp;

  if (!whatsapp) return null;

  return (
    <a
      href={`https://wa.me/${toWhatsAppDigits(whatsapp)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-charcoal/20 transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" fill="white" strokeWidth={0} />
    </a>
  );
}
