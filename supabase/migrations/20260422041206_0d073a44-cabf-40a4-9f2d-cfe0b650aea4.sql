UPDATE public.seo_settings SET value = 'https://nsangomagazine.com' WHERE key IN ('canonical_base_url', 'organization_url');

UPDATE public.seo_settings SET value = E'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /compte\nDisallow: /auth\n\nSitemap: https://nsangomagazine.com/sitemap.xml' WHERE key = 'robots_txt';

UPDATE public.premium_settings SET value = 'contact@nsangomagazine.com' WHERE key = 'site_contact_email' AND value = 'contact@kibafood.cm';