# Sticker Commission Order Form

A web app for sticker pack commissions. Customers use it to fill out a detailed order sheet and export it as a JSON file; artists import that file into their own dashboard to manage and track the work.

**Live site:** [sticker.furglitch.com](https://sticker.furglitch.com)


## Customer-Side Features

Customers fill out a structured order form and export it as a `.json` file to send to their artist.

### Pack Details
At the top of the form, customers provide overall pack metadata:
- **Pack Name / Title**
- **Username** (e.g. `@handle`)
- **Character Name**
- **General Notes** — character details, themes, vibes, colour schemes, etc.
- **Character Reference Images** — drag-and-drop, click, or paste an image URL; supports multiple images; thumbnails are shown with a lightbox preview

### Sections
Stickers are grouped into labelled sections (e.g. *Casual*, *Silly*, *Reactions*). Each section can be:
- Named freely
- Reordered (up/down)
- Deleted (with confirmation if it contains stickers)

### Sticker Cards
Each sticker card inside a section captures:
- **Title** — name of the sticker (e.g. *Laughing*, *Sleepy*, *Heart Eyes*)
- **Expression / Emotion** — e.g. *big silly grin, crying laughing*
- **Pose / Action** — e.g. *holding coffee, peace sign, waving*
- **Extra Notes** — text on sticker, backgrounds, accessories, special details
- **Reference Images** — drag-and-drop, click-to-upload, or paste an image URL

Each sticker also has three toggle flags:
| Flag | Description |
|------|-------------|
| **NSFW** | Marks the sticker as adult content |
| **YCH** | Marks the sticker as a "Your Character Here" slot |
| **Multi-Character** | Marks a sticker featuring more than one character; exposes a character count field (min 2) |

Stickers are numbered, and can be reordered or deleted individually.

### Import / Export
- **Export JSON** — saves the full form as a `.json` file named after the pack
- **Import JSON** — loads a previously exported draft back into the form
- **Reset** — clears the entire form (with confirmation)


## Artist-Side Features

Artists import `.json` order sheets from customers into a persistent dashboard.

### Commission Management
- **Import** one or more `.json` order sheets via the sidebar button
- **Sidebar** lists all imported commissions, each showing:
  - Pack name and character name
  - Progress bar (completed stickers vs total)
- Switch between commissions by clicking a sidebar entry
- **Delete** a commission from the dashboard (with confirmation)
- State is persisted in `localStorage`

### Commission View
When a commission is selected, the main panel shows:

**Metadata block** — pack name, username, character name, description, notes, and any character reference images (clickable lightbox)

**Stats bar** — a live breakdown of the active commission:
- Overall progress bar and percentage
- Pill badges for each sticker type:
  - Standard, NSFW, YCH, Multi-Character (broken down by character count)
  - Combinations: NSFW+YCH, NSFW+Multi, YCH+Multi, all three
- **Estimated total price** (shown when rates are configured)

**Sticker cards** — one per sticker, showing all customer-provided details plus:
- **Tag pills** — NSFW / YCH / multi-character count at a glance
- **Editable flags** — artists can override NSFW, YCH, and Multi-Character toggles (e.g. to flag a sticker the customer didn't mark)
- **Artist Notes** — a private textarea for personal per-sticker notes
- **Done checkbox** — marks a sticker as completed; the card is visually dimmed and the progress bar updates

### Rates & Pricing
Artists can configure their pricing in the sidebar:
| Field | Description |
|-------|-------------|
| **Base price** | Flat rate per sticker |
| **NSFW add-on** | Extra charge for NSFW stickers |
| **YCH add-on** | Extra charge for YCH stickers |
| **Multi-character add-on** | Extra charge **per additional character** beyond the first |

When any rate is set, an **Estimated Total** is calculated automatically for the active commission.

### Other
- **Sidebar toggle** — collapse/expand the commission list to maximise workspace
- **Image lightbox** — click any reference image thumbnail to preview it full-size

## Development

This site is built with [Jekyll](https://jekyllrb.com/) and deployed via GitHub Pages. It uses **vanilla JS** with no build step or external frameworks.

### Running locally

This site is built with [Jekyll](https://jekyllrb.com/) and served via GitHub Pages. 

To run it locally, clone the repo and run `jekyll serve` in the terminal. 

The site will be available at `http://localhost:4000`.

### Project Structure

```
/
├── _config.yml              # Jekyll configuration
├── index.html               # Landing page
├── customer/
│   └── index.html           # Customer order form
├── artist/
│   └── index.html           # Artist dashboard
└── assets/
    ├── css/
    │   ├── style.css        # Shared styles (Catppuccin, components)
    │   └── artist.css       # Artist dashboard layout & styles
    └── js/
        ├── state.js         # Customer app state (sections, images)
        ├── init.js          # Customer app bootstrap
        ├── sections.js      # Section add / render / move / delete
        ├── stickers.js      # Sticker card add / render / update
        ├── images.js        # Image upload, drag-and-drop, lightbox
        ├── data.js          # JSON export / import / clear
        ├── utils.js         # Shared utilities (uid, escHtml, slugify…)
        ├── theme.js         # Theme toggle & localStorage persistence
        └── artist/
            ├── state.js     # Artist app state & localStorage
            ├── data.js      # Commission import / delete / flag updates
            ├── ui.js        # Sidebar, stats bar, commission rendering
            └── init.js      # Artist dashboard bootstrap
```