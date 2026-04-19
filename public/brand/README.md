# Brand assets

Maticus Media 360 brand files. Anything in this folder is served by Next.js at `/brand/<filename>`.

## Current logos

| File | URL path | Dimensions | Use |
| --- | --- | --- | --- |
| `mm360_logo_mobile.webp` | `/brand/mm360_logo_mobile.webp` | 300 × 300 | Primary circular mark — MM360 |
| `automaticus_logo_mobile.webp` | `/brand/automaticus_logo_mobile.webp` | 525 × 300 | Automaticus AI wordmark |

The matching `.png` originals are kept alongside as backup. WebP versions are **lossless** (pixel-identical) and ~35–42% smaller.

## Embedding

Use `next/image` so Next.js serves optimal formats (AVIF/WebP) at the right size with lazy loading:

```tsx
import Image from "next/image";

<Image
  src="/brand/mm360_logo_mobile.webp"
  alt="Maticus Media 360"
  width={300}
  height={300}
  priority
/>
```

For above-the-fold logos add `priority`; for decorative/below-the-fold imagery omit it.
