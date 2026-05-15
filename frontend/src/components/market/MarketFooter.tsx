"use client";

import { useEffect, useState } from "react";
import BijuteriFooter from "@/components/design/BijuteriFooter";
import {
    cmsApi,
    type CmsLayoutResponse,
    type FooterSettings,
    type NavigationMenuItem,
} from "@/lib/api";

const DEFAULT_FOOTER: FooterSettings = {
    description:
        "Türkiye'nin güvenilir B2B bijuteri tedarik platformu. Onaylı toptancılarla, şeffaf fiyatlama ve hızlı kargo ile vitrininize doğrudan tedarik.",
    phone: "0 542 848 26 46",
    phone_raw: "05428482646",
    email: "destek@i-bijuteri.com",
    copyright: "i-bijuteri.com. Tüm hakları saklıdır.",
    tagline_note: "Satıcılar arası B2B pazaryeri",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
};

interface FooterLink {
    label: string;
    href: string;
}

interface FooterColumn {
    title: string;
    links: FooterLink[];
}

function menuToColumns(menus: NavigationMenuItem[]): FooterColumn[] | undefined {
    const groups = menus.filter((m) => m.children && m.children.length > 0);
    if (groups.length === 0) return undefined;
    // The BijuteriFooter renders exactly 3 link columns alongside the About block.
    return groups.slice(0, 3).map((g) => ({
        title: g.title,
        links: (g.children ?? []).map((c) => ({
            label: c.title,
            href: c.url || "#",
        })),
    }));
}

/**
 * Authenticated marketplace footer.
 * Pulls live menu/footer settings from CMS, falls back to a static config when unavailable,
 * and delegates the visual rendering to the canonical BijuteriFooter design component.
 */
export function MarketFooter() {
    const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER);
    const [columns, setColumns] = useState<FooterColumn[] | undefined>(undefined);

    useEffect(() => {
        cmsApi.getLayout().then((res) => {
            if (!res.data) return;
            const raw = res.data as { data?: CmsLayoutResponse };
            const layout = raw.data ?? res.data;
            if (layout.footer_settings) setFooter(layout.footer_settings);
            if (layout.menus?.footer) {
                const cols = menuToColumns(layout.menus.footer);
                if (cols) setColumns(cols);
            }
        });
    }, []);

    return (
        <BijuteriFooter
            description={footer.description}
            phone={footer.phone}
            email={footer.email}
            columns={columns}
        />
    );
}
