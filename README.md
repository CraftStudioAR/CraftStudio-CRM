# Craft Studio CRM

Private content manager for [Craft Studio](https://craftstudio.com.ar), a brand identity studio in Buenos Aires. The team uses it to compose, order and publish its case studies and Craft Lab articles without a developer. The public site ([CraftStudio](https://github.com/CraftStudioAR/CraftStudio)) reads what this app writes.

## What it does

- **Visual page builder.** A case study is a list of typed blocks, and the editor renders a live preview of each one using the same block schema as the public site. There are nine block types: single image, image feature (one main image plus two stacked), image pair, image with text, keywords, quote over image, stats, testimonial and text.
- **Real layout control per block.** Blocks expose column split (50/50, 60/40, 70/30, 66/34 and their mirrors), aspect ratio, which side the main image sits on, mobile ordering and stacking, text alignment, optional container, and font size per breakpoint (mobile, tablet, desktop) with tracking and leading.
- **Projects and articles.** Create, edit, duplicate, delete, reorder by drag and mark projects as featured. Craft Lab articles can be sorted by date or in a custom order.
- **Safe concurrent editing.** Saves use optimistic concurrency: an update only applies if `updated_at` still matches the version the editor opened. If someone else saved in between, the editor reports a conflict instead of overwriting their work, and it always reloads the latest version from the database before editing.
- **Version history.** `supabase/content_history.sql` installs triggers that store the previous version of every project or article on each update or delete, so any overwritten change can be recovered. The history table is readable only by signed-in users and writable only by the trigger.
- **Images.** Uploaded to Cloudinary with an unsigned preset and referenced by public ID, so the site can request each size it needs.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Supabase (Postgres, Auth, row-level security), Cloudinary.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in the Supabase and Cloudinary values
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (access is enforced by row-level security) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset |

Without Supabase variables the app runs in a local demo mode backed by the browser's storage.

## Project structure

```
src/
  components/   BlockBuilder, ProjectPreview, ImageUploader, Navbar
  pages/        Dashboard, ProjectsManager, ProjectEditor, ArticlesManager, ArticleEditor, Settings, Login
  lib/          Supabase data layer and Cloudinary URL helpers
  types/        Block and content types shared with the public site
supabase/       SQL for the version history triggers
```

---

Designed and built by [Giuliana Di Rocco](https://dev.giulianadirocco.com).
