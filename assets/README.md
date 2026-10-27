# TSSA Website Editing Guide

The site is built to be modular. Board members, events, and sponsors are each controlled by a JSON file, so they are easy to change without touching the HTML. The About Us location chart has its own file, `assets/data/about_us_demographics.json`, and the animation plays the same no matter what you put in it.

This guide explains how to change those three categories, and then how to add or change other assets on the site.

## 1. Board Members

Each board member looks like this:

```json
{
    "position": "Role",
    "name": "First Last",
    "email": "jane.doe@example.com",
    "headshot": "/assets/photos/board_headshots/first_last.[jpg, png, jpeg]",
    "description": "Description",
    "graduatingYear": 20XX,
    "current": true
}
```

Copy and paste this template and fill in the information.

A member only shows up if `current` is `true`. If someone leaves the board, set it to `false`.

**Note:** members set to `false` are hidden, but their information can still be seen through inspect element. If a member is gone, delete all of their information.

Put headshots in `assets/photos/board_headshots/` and follow the naming pattern (`first_last.jpg`). If you don't have the photo yet, still fill in the `headshot` field with the file path it will have.

The file is a list, so the order is kept. Members display top to bottom, left to right. Roles are currently in display order, so if you add a new role, put it where you want it to appear. It's usually easier to swap the data in an existing entry than to add a new one.

## 2. Events

Each event looks like this:

```json
{
    "name": "Event Name",
    "description": "Event description about what the event was and how it went. Usually, this includes some regular description about why the event was hosted or where it was hosted as well. Sometimes, for corporate events, a quick explanation of what the company does and how they structured the event is also helpful.",
    "gallery": "/assets/photos/event_gallery/event_name/"
}
```

To add or edit an event, change the name, description, or gallery link. To add photos, put them in that event's gallery folder.

Each event popup shows up to 6 photos. To change this, open `events/event.js` and edit `GALLERY_PHOTO_COUNT` at the top. This applies to all popups.

Each gallery card looks for a file named `header` (`.jpg`, `.png`, or `.jpeg`) and uses it as the card image. If there isn't one, it picks a random photo from the gallery. If a gallery is empty, can't be opened, or doesn't exist, placeholder images are used until it's fixed.

## 3. Sponsors

Each sponsor looks like this:

```json
{
    "name": "Company Name",
    "logo": "/assets/logos/company[.png, .jpg, .jpeg]",
    "sponsorship": "https://company.com/",
    "tier": "[Turing+, Turing, Dijkstra]",
    "description": "Something about what the company does and how they've partnered with Turing in the past, or currently partner with Turing. Usually, some form of appreciative statement is also included",
    "current": true
}
```

To add a sponsor, append this object to the list in `sponsors.json` and fill in every field. If a past sponsor returns, set `current` to `true`. If a sponsor stops sponsoring, set it to `false`. Update `tier` when it changes. Each sponsor links to its website in a new tab.

## 4. Other Changes

### Hero Images

To replace a hero image, put the new photo in `assets/photos/hero_photos/` and keep the same file name and extension. The current files are:

- About Us: `aboutus_hero.jpeg`
- TSSA: `TSSA_hero.webp`
- Sponsors: `sponsors_hero.png`
- Events: `events_hero.jpg`
- Resources: `resources_hero.jpg`

If you change a name or extension, update the image path. The About Us path is in `about/about.html`. The others are in `TSSA/TSSA.css`, `sponsors/sponsors.css`, `events/events.css`, and `resources/resources.css`.

The Austin and Recruitment guide images are set in `resources/austin.css` and `resources/recruitment.css` with `--hero-image`. They currently point to `assets/photos/regular_photos/`. Update the path there to use a different photo or folder.

The home page uses a slideshow. Its photos are in `assets/photos/banner_photos/webp/` and are named `1.webp`, `2.webp`, and so on. To change how many photos there are, edit the `length` value in `bannerPhotos` at the top of `index.js` and keep the numbers consecutive. The first photo is set in `index.html` on the image with class `landing_bg`.

### Logo Wheels

**Home page:** the logos are listed directly in `index.html` in the sponsors section. Put new logos in `assets/logos/` and update the `img` `src` and `alt` text inside `logo-group`. To add or remove a logo, add or remove its `img` element.

There are two `logo-group` blocks. The second has `aria-hidden="true"` and repeats the first so the loop looks seamless. Keep the same logos in the same order in both.

This wheel is separate from `assets/data/sponsors.json`. Changing that file updates the Sponsors page but not the home page wheel.

**About Us alumni:** `about/about.js` loads logos from `assets/logos/alumni/`. Add or replace images in that folder. The script first tries to read a directory listing. If your hosting doesn't provide one, it looks for `assets/logos/alumni/manifest.json`.

The manifest isn't included, so create it if you need it. It is a list of the exact file names to display:

```json
[
    "company_one.png",
    "company_two.svg"
]
```

If you use a manifest, update it whenever you add or remove a logo. The script builds and repeats the two rows for you. To change the scroll speed, edit `CAROUSEL_SPEED` in `about/about.js`. A higher value is faster.

### Resources

The resources pages are edited directly in HTML.

- `resources/resources.html`: the Resource Guides introduction, GitHub contribution link, guide descriptions, and buttons
- `resources/austin.html`: the Austin guide
- `resources/recruitment.html`: the Recruitment guide

To add to an existing section, edit or add paragraphs, list items, and links inside its `guide-band__inner`. To add a section, copy an existing `guide-band` section, give it a unique `id`, and replace the heading and content. Keep the `guide-band__inner` wrapper and the existing class names so the layout still works.

Shared styles are in `resources/resources.css`. Austin and Recruitment also have `resources/austin.css` and `resources/recruitment.css`. `resources/resources.js` handles the text animations automatically, so normal text changes don't need any script edits.

### About Us Statistics

The three statistics are in `about/about.html` inside the section with `id="stats"`. Change the heading text to rename a statistic. For each `stat__value`, update both `data-count` and the visible text so they match:

```html
<p class="stat__value fx-block" data-count="20" data-prefix="" data-suffix=" years">20 years</p>
```

`data-count` is the number the animation counts up to, so keep it numeric. `data-prefix` goes before the number and `data-suffix` goes after it, such as `" years"` or `"%"`.

The student location pie chart is separate. Edit `assets/data/about_us_demographics.json` to change its categories or values. Each object has an `id`, a display `name`, and a numeric `value`. Keep ids unique and use the same units for every value. The chart works out each percentage from the total, so you can use student counts or percentages (percentages should add up to 100). The list order sets the order of the slices and legend.

### About Us FAQ

The questions are in `about/about.html` inside the section with `id="faq"`. Each one looks like this:

```html
<details class="faq__item fx-block">
    <summary class="faq__q">Question goes here</summary>
    <div class="faq__answer">
        <p>Answer goes here.</p>
    </div>
</details>
```

To edit a question, change the `summary` text. To edit an answer, change the paragraph inside `faq__answer`. Add links with `<a href="https://example.com/">link text</a>`. To add a question, copy a whole `details` block and fill it in. To remove one, delete its whole `details` block. Questions appear in the order they are listed.

Keep the class names so the arrows, expanding blue boxes, and animations keep working. `about/faq.js` opens and closes each question separately, so several can stay open at once. The styles are in `about/about.css`. Normal question and answer changes don't need edits to either file.