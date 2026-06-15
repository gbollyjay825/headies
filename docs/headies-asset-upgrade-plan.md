# Headies Asset Upgrade Plan

Updated: 2026-06-14

## Source Files Reviewed

Local decks:

- `/Users/gbolahan.salami/Downloads/16TH_HEADIES_DOCUMENT.pdf`
  - 23 pages, 9.3 MB, iLovePDF producer, modified 2026-06-12.
  - Text-readable.
  - Dominant extracted font family: Calibri.
  - Useful content: Smooth Promotions positioning, Headies global audience claims, 16th edition goals, AREPC strategy, activity roadmap, past partners, event particulars.
- `/Users/gbolahan.salami/Downloads/18th Headies Partnership Deck (2).pdf`
  - 26 pages, 10 MB, iLovePDF producer, modified 2026-04-13.
  - Image-based PDF; text was not extractable with pypdf.
  - Visual direction: dark stage photography, magenta/cyan/gold accents, condensed uppercase headline type, page-number badges, punchy partnership language.
- `/Users/gbolahan.salami/Downloads/The 17th Headies Deck 2.pdf`
  - 17 pages, 6.9 MB, iLovePDF producer, modified 2026-06-12.
  - Partly text-readable.
  - Visual direction: black background, neon magenta/cyan/lime line work, condensed uppercase display type, bold event photography.

## Typography Decision

Mechanical extraction across readable PDFs found Calibri as the most common text font:

- 16th deck: Calibri family, 4,568 extracted characters.
- 17th deck: ArialMT, 502 extracted characters; Calibri family, 488 extracted characters.
- 18th deck: no extractable text, but rendered slides visually use a condensed uppercase display style.

Site implementation:

- Body font: `Calibri`, with Hanken Grotesk/system fallbacks.
- Display font: `Anton`, already imported, because it matches the newer 17th/18th deck headline look better than Calibri.
- Serif accent: Bodoni Moda retained only for selective editorial emphasis.

## Drive Source Map

The structured source map lives in `data/gallery-sources.json`.

| Collection | Status | Folder ID | Notes |
|---|---:|---|---|
| Headies Creative Conference - Day 1 | 200 | `13u3WU6HCz8lMFdQ2TP2I8lxTYUaDWuZ1` | Refresh at intervals. |
| Headies Creative Conference - Day 2 | 200 | `1KvBOWCZiV9DnKxmjWrbloRgnU5c9gtHi` | Refresh at intervals. |
| Headies Awards 2025 | 200 | `1eg3XPPW0Ts-vOwehqoP5-HEfVX1rM4KN` | Refresh at intervals. |
| Headies x US Consulate 2025 - Folder A | 200 | `1-2dzNEejXezgLTvfw-lPYqtTxjEVDwyA` | Use for partner proof. |
| Headies x US Consulate 2025 - Folder B | sign-in | `1d9zHoP7tGaFkIfHvKgKmLY34RsCxbPh9` | Needs public sharing or authenticated export. |
| Headies x US Consulate 2023 | 200 | `1E89sfLHBmEZNLcTLUFGVmaZowuWivABx` | Use in history/partners. |
| Brands | 200 | `1L4dM0c5X8un1z_EJnB0jTKR2cvLULvUp` | Use for sponsor visibility. |
| Red Carpet 2023 | 200 | `1PqKUTi1U35KHqUJ2uYqeMTuDTfkoMmY8` | Red carpet gallery. |
| Main Event | 200 | `18ing06JmBTXiaV9-7q8d23vG55kOWFXc` | Main event gallery and hero candidates. |
| Cultural Presentation | 200 | `1HV1rRLAIGBc8thbepC2O6FXYSe5LA-MJ` | Culture section. |
| Direct Drive Folder | 404 | `1Vh2pP1Y4VyaARQpqQWxBsCvDaCy22cPf` | Confirm URL/access. |
| Ambience and Brands | 200 | `1hJbWeExBiscc_TkxSfq1lQRnMhy4zkYO` | Ambience and brand proof. |
| Red Carpet 2025 | 200 | `1erGf-NxK8MTW4ElK9w6gT6YrkL2TlFbt` | Red carpet gallery. |
| Audience and Interaction | 200 | `1829JssMJFnQZ5kmj7Zl57ELopm8u3LZY` | Social proof and audience energy. |
| Stage | 200 | `1mraNKjhEqjcPY8W2udaduStIyYYzRO4w` | Stage gallery and hero candidates. |

## Implemented Media Pass

The first Drive-backed media pass is implemented.

- `data/gallery-items.json`: generated gallery manifest with 481 public Drive image records.
- `data/gallery-inventory-summary.json`: folder-level access/status summary.
- `data/video-sources.json`: YouTube archive links extracted from prior Headies decks.
- `headies-gallery.js`: reusable renderer for the home gallery, media archive, source summaries, and video archive.
- `scripts/drive_inventory.py`: repeatable Drive inventory script for public folders.

All Unsplash/stock URLs were removed from the edited site pages. The remaining `.ph` blocks are graceful fallbacks behind image slots while media loads or if a future source fails.

Refresh command:

```bash
python3 scripts/drive_inventory.py
```

After refreshing, verify the generated manifests:

```bash
python3 -m json.tool data/gallery-items.json >/tmp/headies-gallery-items.pretty.json
python3 -m json.tool data/gallery-inventory-summary.json >/tmp/headies-gallery-summary.pretty.json
python3 -m json.tool data/video-sources.json >/tmp/headies-video-sources.pretty.json
```

## Step-by-Step Site Upgrade Plan

1. Access and inventory
   - Confirm all Drive folders are shared as "Anyone with the link - Viewer".
   - Fix Folder B and the direct Drive folder before using them.
   - Export or enumerate file names, mime types, dimensions, and Drive IDs.
   - Tag each asset by event, year, moment, people, orientation, and quality.

2. Build gallery data
   - Create a `gallery.json` manifest from `data/gallery-sources.json`.
   - Add per-item fields: `id`, `title`, `collection`, `year`, `type`, `driveFileId`, `thumbnailUrl`, `embedUrl`, `downloadUrl`, `orientation`, `featured`, `credit`, `priority`.
   - Keep the manifest portable so Drive URLs can later be replaced by Cloudinary/Vercel Blob URLs without rewriting the UI.

3. Replace site visual language
   - Use the 18th deck look as the lead visual system: dark photographic panels, magenta/cyan/gold accent lines, numbered editorial sections, bold uppercase headlines.
   - Use Calibri for body copy and Anton for display headings.
   - Reduce the current serif-heavy gala look where it conflicts with the newer deck.

4. Upgrade homepage
   - Replace the hero stock image with a strong stage or 2025 awards image.
   - Add a high-energy "From the Roots to the World" section using deck language.
   - Replace the home gallery with curated categories: Stage, Red Carpet, Audience, Brands, Cultural Presentation, Conference.
   - Use the US Consulate material as credibility/partnership proof.

5. Upgrade media page into a structured gallery
   - Add filter tabs by collection and year.
   - Add a featured hero media panel.
   - Use a masonry/editorial grid with real Drive-backed images.
   - Add "Refresh collection" metadata in the JSON, not visible UI copy.
   - For videos, embed Drive preview players or YouTube links where available.

6. Upgrade about/partners narrative
   - Pull strongest claims from the 16th deck: since 2006, global audience, cultural export, youth reach, platform for international collaboration.
   - Add partner proof from past partners and US Consulate folders.
   - Add a concise "Why The Headies must continue to thrive" section inspired by the 17th/18th decks.

7. Upgrade events and winners
   - Replace event-card placeholders with real conference, red carpet, main event, and stage visuals.
   - Use 2025 awards imagery on winners-related sections.
   - Make the pages feel less generic and more like an official archive.

8. Performance and reliability
   - Do not hardcode Google thumbnail URLs because Drive thumbnail links are short-lived.
   - For the quick pass, use public Drive preview/download patterns only where they work reliably.
   - For production, sync selected assets to a real CDN or object storage.
   - Lazy-load gallery images and cap the first-page payload.

9. QA
   - Check desktop and mobile layouts in the local browser.
   - Verify no image text overflows cards/buttons.
   - Verify all placeholder image URLs are removed.
   - Check console errors, broken links, and slow-loading Drive media.

10. Deploy
   - Commit the manifest, gallery code, CSS, and page updates.
   - Deploy to Vercel.
   - Re-check the live site and asset loading.

## Open Items

- Confirm whether Google Drive should remain the live media host for launch or only be used for source organization.
- Fix access for Folder B and the direct Drive folder.
- Decide whether videos should be embedded from Drive, YouTube, or uploaded to a video platform.
- Provide any mandatory photo credits, sponsor logo usage rules, and names/titles for notable people in photos.

## Local Verification Notes

Local server used for this pass: `http://127.0.0.1:8755/`.

Checks completed on 2026-06-14:

- Homepage: Drive gallery rendered 7 featured cards; video archive rendered 4 cards; no broken images or browser console warnings/errors.
- Homepage lightbox: dynamically-rendered Drive image cards open as image lightboxes; video cards open YouTube embeds.
- Homepage refinement: replaced mismatched named-artist image cards with moment-based cards and added 4 grouped media sections covering Awards Night, Creative Events, Red Carpet, and Partnerships + Culture.
- Media page: archive rendered 36 initial cards from 481 public records; Stage filter narrowed to 50 photos; Load more expanded to all 50 Stage photos; no broken images or browser console warnings/errors.
- Media page refinement: added collection highlight cards and expanded filters, including creative conference, culture, brands, and US Consulate collections.
- Gallery naming refinement: public cards no longer expose Drive/camera filenames such as `640A7850`, `RED CARPET (10)`, or `MAIN EVENT (12)`. The UI now generates editorial names from collection context, year, and display sequence while retaining raw Drive filenames in `data/gallery-items.json` for reference.
- Video archive fix: replaced the invalid 10-character 16th Headies YouTube ID with `Y737YQOYFeQ`, verified all listed YouTube IDs through oEmbed, and added a `Watch on YouTube` fallback link in video lightboxes.
- Travel page refinement: removed the nonfunctional booking widget, removed package pricing, and replaced package actions with an early-access form collecting name, email, and phone number.
- Winners page: all 9 image slots use Drive-backed media; no Unsplash sources; no broken images or browser console warnings/errors.
- About, Events, Travel: Drive-backed image slots loaded with no broken images or browser console warnings/errors.
- Static check: `rg` found no remaining `images.unsplash.com` or missing `assets/stand` references.
- Cache-busted local scripts: `headies-gallery.js?v=20260614-drive` and `headies.js?v=20260614-drive`.

Checks completed on 2026-06-15:

- Travel landing refresh: replaced the simple travel page with a full landing page hero, travel support strip, image-led early-access section, package cards, luxury service request area, trust strip, and final CTA.
- Travel imagery: switched the page from Headies event photos to relatable travel visuals for airport travel, luggage, business class, hotel stay, airport transfer, and Toronto destination context.
- Travel image source references:
  - Airport traveler hero: https://unsplash.com/photos/walking-man-holding-luggage-3ot5ppgOhew
  - Airport luggage: https://unsplash.com/photos/green-suitcase-with-travel-stickers-in-airport-terminal-TQ1lLBpy6X4
  - Business class cabin: https://unsplash.com/photos/a-view-of-the-inside-of-an-airplane-with-a-television-n57AHgkaxyQ
  - Hotel room luggage: https://unsplash.com/photos/a-blue-suitcase-sitting-on-the-floor-next-to-a-bed-QStz1IM5eSg
  - Airport transfer: https://unsplash.com/photos/airport-terminal-vehicle-and-luggage-carts-A5MTm7YTUrw
  - Toronto skyline: https://unsplash.com/photos/toronto-skyline-with-cn-tower-under-cloudy-sky-WzWa6d4tHKs
- Local verification: all travel landing images loaded after scrolling, desktop and mobile had no horizontal overflow, browser console was clean, and both early-access and luxury service forms submitted with success messages.
