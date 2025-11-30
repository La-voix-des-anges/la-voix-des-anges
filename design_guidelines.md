# Design Guidelines: College Journal Platform

## Design Approach

**Reference-Based Strategy** inspired by modern digital publications:
- **Medium/Ghost**: Clean reading experience, typography-first approach, generous whitespace
- **The Verge**: Bold editorial imagery, modern news aesthetic
- **Linear**: Clean, efficient admin interfaces with subtle sophistication
- **Slack**: Intuitive team communication patterns

**Core Principle**: Balance professional journalism credibility with youthful, accessible college newspaper energy.

---

## Typography System

**Font Stack** (Google Fonts):
- **Headlines**: Playfair Display (serif, editorial gravitas) - 700 weight
- **Body/UI**: Inter (sans-serif, modern readability) - 400, 500, 600 weights

**Hierarchy**:
- Article headlines: text-5xl to text-6xl (Playfair Display)
- Section titles: text-3xl to text-4xl (Inter, semi-bold)
- Article body: text-lg (Inter, comfortable reading size ~18-20px)
- UI labels/buttons: text-sm to text-base (Inter)
- Metadata (dates, categories): text-sm (Inter, medium weight)

---

## Layout & Spacing System

**Tailwind Spacing Units**: Use 4, 6, 8, 12, 16, 20, 24 for consistency
- Component padding: p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-6, gap-8
- Container max-widths: max-w-7xl (main), max-w-3xl (article content)

**Grid Patterns**:
- Article grids: 1 column mobile → 2-3 columns desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Admin dashboard: Sidebar (w-64) + Main content
- Discussion: Sidebar channels list (w-80) + Chat area

---

## Component Library

### Public-Facing Components

**Header/Navigation**:
- Sticky top bar with journal logo (left), main nav links (center), search + user menu (right)
- Height: h-16
- Blur backdrop effect for depth (backdrop-blur-lg)

**Hero Section** (Homepage):
- Featured article with large hero image (h-96 to h-[32rem])
- Overlay gradient for text readability
- Headline + excerpt + "Read More" button with blurred background
- Secondary featured articles in 2-column grid below

**Article Cards**:
- Image thumbnail (aspect-ratio-16/9, rounded-lg)
- Category badge (small pill, rounded-full, px-3 py-1)
- Headline (text-xl, Playfair Display)
- Excerpt (2-line clamp)
- Author info with avatar (rounded-full, w-8 h-8) + name + date
- Hover: subtle scale transform (hover:scale-102)

**Article Detail Page**:
- Full-width hero image (h-[28rem])
- Content container: max-w-3xl, centered
- Article meta: Author card, category, date, read time
- Body text: Leading-relaxed for comfortable reading
- Comments section below with threaded replies

**Author Profile**:
- Header with author photo (rounded-full, w-32 h-32), bio, stats
- Grid of their published articles

### Internal/Admin Components

**Dashboard Layout**:
- Left sidebar (w-64): Logo, nav sections (Articles, Users, Discussions, Settings)
- Main area: Stats cards (grid-cols-3), recent activity list, pending articles queue

**Article Editor**:
- Clean distraction-free interface
- Title input (large, borderless)
- Rich text editor area (max-w-4xl)
- Right sidebar: Status selector, category/tags, featured image upload, publish controls

**Discussion Interface** (Team Chat):
- Left sidebar (w-80): Channel list, direct messages
- Main chat: Messages in thread, input at bottom
- Message bubbles: Different styling for current user vs others
- Timestamp + sender name for each message
- Article-linked channels show article preview at top

**Moderation Queue**:
- Table/card view of pending items
- Quick action buttons (Approve/Reject, inline editing)
- Filter chips at top (All, Pending, Flagged)

---

## Page Specifications

### Homepage
- Hero: Large featured article (full-width image, h-[32rem])
- "Latest Articles" section: 3-column grid of article cards
- "By Category" section: Horizontal scrollable category cards
- Newsletter signup: Centered block with simple email input

### Article Detail
- Hero image (if article has one)
- Content: max-w-3xl, generous line-height
- Sidebar (desktop): Table of contents, related articles
- Comments: Below article, threaded design

### Admin Dashboard
- 3 stat cards across top (Total Articles, Pending Reviews, Active Rédacteurs)
- Two-column: Recent activity + Quick actions
- Pending articles list with status badges

---

## Images

**Required Images**:
1. **Homepage Hero**: Large featured article image (1600x900px) - dramatic, high-quality photo related to featured story
2. **Article Cards**: Thumbnail images (800x450px) for each article preview
3. **Article Detail Hero**: Full-width header image (1920x1080px) for published articles
4. **Author Profiles**: Profile photos (400x400px) - professional headshots
5. **Placeholder**: Generic journal/newspaper imagery for articles without custom images

**Image Treatment**:
- Rounded corners (rounded-lg) for cards, sharp edges for full-width heroes
- Subtle overlay gradient on hero images for text contrast
- Lazy loading for performance
- Alt text required for accessibility

---

## Accessibility & Polish

- Focus states: Ring-2 ring-offset-2 for keyboard navigation
- Form inputs: Clear labels, error states with descriptive messages
- Sufficient contrast for all text (WCAG AA minimum)
- Skip navigation links for screen readers
- Semantic HTML throughout (article, nav, aside, section)

---

## Key Differentiators

1. **Editorial Credibility**: Playfair Display headlines give journalistic weight
2. **Clean Reading**: Generous max-w-3xl article containers, relaxed line-height
3. **Youthful Energy**: Rounded components, vibrant hover states, modern grid layouts
4. **Efficient Workflow**: Linear-inspired admin UI, quick actions, clear status indicators
5. **Team Collaboration**: Slack-like discussion interface for seamless coordination