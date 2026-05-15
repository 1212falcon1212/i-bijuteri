"use client";

import Link from "next/link";
import { Truck, Clock, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { cmsApi, type CmsLayoutResponse, type TopbarSettings } from "@/lib/api";

interface TopbarProps {
  settings?: TopbarSettings | null;
}

const DEFAULTS: TopbarSettings = {
  enabled: true,
  shipping_text: "Türkiye geneli ücretsiz kargo",
  hours_text: "Hafta içi 09:00 – 18:00",
  phone: "0 542 848 26 46",
  seller_link_text: "Nasıl Satıcı Olurum?",
  seller_link_url: "/sayfalar/yardim",
  contact_link_text: "İletişim",
  contact_link_url: "/sayfa/iletisim",
  announcement_enabled: false,
  announcement_text: "",
};

/**
 * Dark utility topbar (3-row header pattern, row 1).
 * Admin panel "Topbar Ayarları" sayfasından yönetilir. Server-side `settings` prop
 * ile veya client-side fallback olarak `/cms/layout` endpoint'inden veri çekilir.
 */
export default function Topbar({ settings: settingsProp }: TopbarProps = {}) {
  const [settings, setSettings] = useState<TopbarSettings>(
    settingsProp ?? DEFAULTS,
  );

  useEffect(() => {
    if (settingsProp) {
      setSettings(settingsProp);
      return;
    }

    let active = true;
    cmsApi
      .getLayout()
      .then((res) => {
        if (!active || !res.data) {
          return;
        }
        // Laravel response: { status, data: { menus, settings, topbar } }
        const raw = res.data as { data?: CmsLayoutResponse } & CmsLayoutResponse;
        const layout = raw.data ?? raw;
        if (layout?.topbar) {
          setSettings({ ...DEFAULTS, ...layout.topbar });
        }
      })
      .catch(() => {
        // Sessizce DEFAULTS ile devam et
      });

    return () => {
      active = false;
    };
  }, [settingsProp]);

  if (!settings.enabled) {
    return null;
  }

  // Duyuru modu: tek satır ortalanmış duyuru metni
  if (settings.announcement_enabled && settings.announcement_text) {
    return (
      <div className="hidden md:block bg-[var(--color-topbar-bg)] text-[var(--color-topbar-ink)] text-[12.5px] tracking-[.01em]">
        <div className="max-w-[1320px] mx-auto px-8 py-2.5 text-center">
          {settings.announcement_text}
        </div>
      </div>
    );
  }

  const phoneHref = settings.phone
    ? `tel:${settings.phone.replace(/\s/g, "")}`
    : undefined;

  return (
    <div className="hidden md:block bg-[var(--color-topbar-bg)] text-[var(--color-topbar-ink)] text-[12.5px] tracking-[.01em]">
      <div className="max-w-[1320px] mx-auto px-8 py-2.5 flex items-center justify-between gap-6">
        {/* Sol: kargo + saat */}
        <div className="flex items-center gap-6">
          {settings.shipping_text && (
            <span className="flex items-center gap-2 opacity-90">
              <Truck className="w-3.5 h-3.5" />
              {settings.shipping_text}
            </span>
          )}
          {settings.hours_text && (
            <span className="flex items-center gap-2 opacity-90">
              <Clock className="w-3.5 h-3.5" />
              {settings.hours_text}
            </span>
          )}
        </div>

        {/* Sağ: linkler + telefon — aralarına dikey ayraç */}
        <div className="flex items-center">
          {settings.seller_link_text && (
            <Link
              href={settings.seller_link_url || "/"}
              className="flex items-center px-6 hover:text-white transition-colors border-r"
              style={{ borderRightColor: "rgba(232,222,200,0.25)" }}
            >
              {settings.seller_link_text}
            </Link>
          )}
          {settings.contact_link_text && (
            <Link
              href={settings.contact_link_url || "/"}
              className="flex items-center px-6 hover:text-white transition-colors border-r"
              style={{ borderRightColor: "rgba(232,222,200,0.25)" }}
            >
              {settings.contact_link_text}
            </Link>
          )}
          {settings.phone && phoneHref && (
            <a
              href={phoneHref}
              className="flex items-center gap-2 pl-6 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {settings.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
