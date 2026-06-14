# The 18th Headies - "Africa to the World"

A multi-page marketing & event site for **The Headies** (Africa's biggest and most
prestigious music awards) celebrating its **18th edition**, hosted in **Canada, 2026**,
under the theme *"Africa to the World."*

A prestige / red-carpet aesthetic: deep blacks, gold-foil accents, large editorial serif
display type, cinematic photography, subtle scroll reveals, a live countdown, and an
interactive history timeline. Built as a static HTML / CSS / vanilla-JS site.

## Pages

| File | Page | Purpose |
|---|---|---|
| `index.html` | Home | Hero + countdown, the Lagos→Atlanta→Canada journey, legacy stats, history timeline, hall of legends, gallery, news, videos, travel teaser, newsletter |
| `about.html` | About | The Headies story + "Africa to the World" mission, values, stats |
| `winners.html` | Winners | 17th Headies (2025) winners, Hall of Legends, Next Rated legacy |
| `events.html` | Events & Tickets | 2026 lineup, countdown, 4 ticket tiers |
| `media.html` | Media | Videos + photo gallery with lightbox |
| `travel.html` | Travel | Booking widget, travel packages (Wakanow travel partner) |

## Structure

- `headies.css` - the design system: all tokens (gold/ink palette, type scale, radii,
  shadows), components, and responsive rules.
- `headies.js` - shared interactions: sticky nav, reveal-on-scroll, count-up stats,
  countdown, gallery lightbox, carousel, timeline drag-scroll.
- `image-slot.js` - `<image-slot>` custom element used for the photography.
- `assets/` - the official logo. Photography uses remote stock placeholders.

## Run locally

It's a static site - open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Notes

Photos are placeholders and the host city / ticket prices are indicative - replace with
the client's real event photography, venue, dates, and pricing before launch.

© 2026 The Headies. Africa to the World.
