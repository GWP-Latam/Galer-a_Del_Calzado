import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Panel de administración",
    template: "%s — Panel de administración",
  },
  description: "Panel interno para administrar el contenido de galeriadelcalzado.com.mx",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
