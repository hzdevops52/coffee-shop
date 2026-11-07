# BREW & BARREL — Premium Coffee Website

A responsive static frontend concept using HTML, CSS, JavaScript, Three.js and GSAP.

## Run locally

From this directory:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

A local web server is recommended because the 3D scene uses JavaScript ES modules.

## Required brand asset

Place the **original, unmodified BREW & BARREL logo** at:

```text
assets/brew-barrel-logo.png
```

The logo image was not available in the working attachments when this package was created. The website currently displays a restrained text fallback until the real logo file is added. Do not replace the logo with a recreated mark.

If your logo is JPG, WebP or SVG, either convert it to PNG without changing its appearance, or update the two image paths in `index.html`.

## Included experience

- Procedural Three.js 3D ceramic coffee cup, handle, coffee surface, saucer and animated steam.
- Pointer-responsive cup movement and gentle floating motion.
- GSAP + ScrollTrigger hero entrance and restrained scroll parallax.
- Responsive desktop/mobile navigation.
- Working menu category filters.
- Gallery lightbox with Escape and backdrop close.
- Scroll progress indicator and active navigation state.
- Reduced-motion support and lower mobile rendering resolution.
- External coffee photography from Unsplash and Google Fonts.

## Before publishing

1. Add the authoritative brand logo at `assets/brew-barrel-logo.png`.
2. Replace all sample menu items and `PRICE TBC` labels with the approved menu and prices.
3. Add verified address, opening hours, phone, WhatsApp, Instagram and email.
4. Add the correct Google Maps embed after the location is confirmed.
5. Confirm image licensing/usage requirements for your commercial deployment. The current image URLs are illustrative remote Unsplash images.
6. Test on target mobile devices and confirm external CDN/image access.

## Static deployment

Upload the folder contents to any static host (Cloudflare Pages, Netlify, GitHub Pages, etc.). No build step or backend is required. Ensure the host serves `index.html` from the project root.

## Order basket / WhatsApp setup

The menu includes a frontend basket with quantity controls. To enable order confirmation through WhatsApp, open `script.js` and set `WHATSAPP_NUMBER` to the business's verified international number using digits only (for example `923001234567`). Until that is configured, the basket still works locally and checkout displays a setup message. Menu prices are intentionally not invented; confirm and add real prices before launch.
