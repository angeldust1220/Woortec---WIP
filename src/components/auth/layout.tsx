'use client';
import * as React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Script from 'next/script';
import ReactGA from 'react-ga4';

import { paths } from '@/paths';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: { xs: 'flex', lg: 'grid' },
        flexDirection: 'column',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <Box sx={{ p: 3 }}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}></Box>
        </Box>
        <Box
          sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}
        >
          <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
          color: 'var(--mui-palette-common-white)',
          display: { xs: 'none', lg: 'flex' },
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography
              color="inherit"
              sx={{ fontSize: '24px', lineHeight: '32px', textAlign: 'center' }}
              variant="h1"
            >
              Welcome to{' '}
              <Box component="span" sx={{ color: '#15b79e' }}>
                Woortec
              </Box>
            </Typography>
            <Typography align="center" variant="subtitle1">
              At Woortec, we organize the advertising investment process, with our integrated platform designed to
              simplify ad management, providing you with a centralized hub for all your campaigns.
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box component="img" alt="Woortec" src="/assets/Woortec.png" sx={{ height: 'auto', width: '100%', maxWidth: '600px' }} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default function App({ Component, pageProps }: { Component: any; pageProps: any }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ReactGA.send({ hitType: 'pageview', page: url });
    };

    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
      ReactGA.initialize(process.env.NEXT_PUBLIC_GA_TRACKING_ID);
      router.events.on('routeChangeComplete', handleRouteChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        router.events.off('routeChangeComplete', handleRouteChange);
      }
    };
  }, [router.events]);

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      {/* Google Tag Manager */}
      <Script
        id="gtm"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
          `,
        }}
      />
      {/* End Google Tag Manager */}

      <Component {...pageProps} />
    </>
  );
}
