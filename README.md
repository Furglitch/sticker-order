# Sticker Commission Order Form

This is a simple web app for artists and customers to use when placing sticker orders.

## Customer-Side Features
Customers can use this app to fill out a Sticker Order Form for their sticker commission orders.

- Split stickers into sections, for example by theme or character
- Specify details for each sticker:
  - Expressions and Poses
  - Reference images
  - Toggles for NSFW content, YCH (Your Character Here) stickers, and multi-character stickers (with character count)
  - Additional notes for the artist
- Export the order details as a JSON file, either to send to the artist or to save as a draft for later editing

- Images can be uploaded via drag-and-drop, with a lightbox preview (click to enlarge).

## Artist-Side Features
Artists can use this app to easily view Sticker Order Sheets sent by customers.

- View sticker details in a clear, organised format
- View reference images in a lightbox preview
- Checklist functionality to keep track of completed stickers
- Number of stickers per 'toggle' (NSFW, YCH, multi-character) is clearly indicated to help with pricing and workload estimation
  - Artists can additionaly edit the toggles as they work through the order, for example to mark a sticker as NSFW if the customer hasn't specified it but the artist thinks it would be appropriate
- Add their own notes for each sticker

## Development

This site is built with [Jekyll](https://jekyllrb.com/) and served via GitHub Pages. 

To run it locally, clone the repo and run `bundle exec jekyll serve` in the terminal. The site will be available at `http://localhost:4000`.

### Deployment

Push to the `main` branch. GitHub Pages will build and deploy automatically.
In your repo settings → Pages, set the source to **Deploy from a branch** → `main` → `/ (root)`.

## Structure

```
/
├── _config.yml          # Jekyll configuration
├── index.html           # Page markup and styles
├── assets/
│   └── js/
│       └── app.js       # All application logic
└── .gitignore
```