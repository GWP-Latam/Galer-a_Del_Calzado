import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/inicio", destination: "/", permanent: true },
      { source: "/inicio/", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/home/", destination: "/", permanent: true },
      { source: "/informacion", destination: "/nosotros", permanent: true },
      { source: "/informacion/", destination: "/nosotros", permanent: true },
      { source: "/la-galeria", destination: "/directorio", permanent: true },
      { source: "/la-galeria/", destination: "/directorio", permanent: true },
      { source: "/portfolio-items", destination: "/promociones", permanent: true },
      { source: "/portfolio-items/:path*", destination: "/promociones", permanent: true },
      { source: "/temporada", destination: "/promociones", permanent: true },
      {
        source: "/wp-content/uploads/:year/:month/AVISO-DE-PRIVACIDAD.pdf",
        destination: "/aviso-de-privacidad",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
