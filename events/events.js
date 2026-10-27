const GALLERY_PHOTO_COUNT = 6; // maximum gallery photos per popup excluding the header

// fit the hero below the navbar including when navigation links wrap
const nav = document.querySelector('.nav');
const updateNavHeight = () => {
    document.documentElement.style.setProperty('--nav-h', `${nav.getBoundingClientRect().height}px`);
};
new ResizeObserver(updateNavHeight).observe(nav);
updateNavHeight();

const SITE_ROOT = '../';
const EVENTS_JSON = SITE_ROOT + 'assets/data/events.json'; 
const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i; // i hate regex
const HEADER_RE = /(^|\/)header\.[a-z0-9]+$/i;
const REVEAL_STEP = 0.08; // seconds between items

const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    'IntersectionObserver' in window;

const grid = document.getElementById('event-grid');
const dialog = document.getElementById('event-dialog');
const dialogHeader = dialog.querySelector('.event-dialog__header');
const dialogTitle = dialog.querySelector('.section-title');
const dialogText = dialog.querySelector('.event-dialog__description');
const dialogGallery = dialog.querySelector('.event-dialog__gallery');
let activeEvent = null;

/* 
   browsers can't list a folder so this tries, in order:
   1. an optional "images": ["a.jpg", ...] list on the event in events.json
   If neither provides images, probe header.jpg and numbered photos from 1
   through GALLERY_PHOTO_COUNT (also .jpeg, .png, .webp). */
   
function folderUrl(path) {
    const clean = SITE_ROOT + path.replace(/^\/+/, '');
    return new URL(clean.endsWith('/') ? clean : clean + '/', location.href).href;
}

const canLoad = url => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
});


async function listFolder(folder) {
    try {
        const response = await fetch(folder + "manifest.json");

        if (!response.ok) {
            throw new Error(`Cannot load manifest: ${response.status}`);
        }

        const files = await response.json();

        return files.map(name => new URL(name, folder).href);
    } catch (error) {
        console.error("Gallery loading failed:", folder, error);
        return [];
    }
}


async function probeFolder(folder) {
    const header = (await canLoad(`${folder}header.jpg`)) ? [`${folder}header.jpg`] : [];
    const numbered = await Promise.all(Array.from({ length: GALLERY_PHOTO_COUNT }, (_, i) => i + 1).map(async n => {
        for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
            if (await canLoad(`${folder}${n}.${ext}`)) return `${folder}${n}.${ext}`;
        }
        return null;
    }));
    return [...header, ...numbered.filter(Boolean)];
}

// uses header or the first image
function getMedia(event) {
    event.media ??= (async () => {
        const folder = folderUrl(event.gallery);
        let files = Array.isArray(event.images) ? event.images.map(name => folder + name) : await listFolder(folder);
        if (!files.length) files = await probeFolder(folder);
        const rest = files.filter(file => !HEADER_RE.test(file));
        return {
            header: files.find(file => HEADER_RE.test(file)) || rest[0] || `${folder}header.jpg`,
            gallery: rest.slice(0, GALLERY_PHOTO_COUNT)
        };
    })();
    return event.media;
}

// makes event card
function createCard(event) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'event-card';

    const img = new Image();
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = `${folderUrl(event.gallery)}header.jpg`;
    // no header.jpg then we use first image we can find
    img.addEventListener('error', () => {
        if (img.dataset.fallback) return;
        img.dataset.fallback = '1';
        getMedia(event).then(media => { img.src = media.header; });
    });

    const name = document.createElement('span');
    name.className = 'event-card__name';
    name.textContent = event.name;

    card.append(img, name);
    card.addEventListener('click', () => openEvent(event, img));
    return card;
}

function showMessage(text) {
    const message = document.createElement('p');
    message.className = 'event-grid__message';
    message.textContent = text;
    grid.replaceChildren(message);
}

async function loadEvents() {
    try {
        const response = await fetch(EVENTS_JSON);
        if (!response.ok) throw new Error(response.status);
        const events = await response.json();
        if (!events.length) return showMessage('Photos from past events will appear here.');
        grid.replaceChildren(...events.map(createCard));
        revealCards();
    } catch {
        showMessage('Past events could not be loaded. Please try again later.');
    }
}

// using native html dialog panel
function openEvent(event, cardImg) {
    activeEvent = event;
    dialogTitle.textContent = event.name;
    dialogText.textContent = event.description || '';
    dialogHeader.src = cardImg.currentSrc || cardImg.src;
    dialogGallery.replaceChildren(...Array.from({ length: GALLERY_PHOTO_COUNT }, () => document.createElement('div')));
    dialog.showModal();
    dialog.querySelector('.event-dialog__panel').scrollTop = 0;

    getMedia(event).then(media => {
        if (activeEvent !== event) return;
        dialogHeader.src = media.header;
        dialogGallery.replaceChildren(...media.gallery.map(src => {
            const img = new Image();
            img.src = src;
            img.alt = `${event.name} photo`;
            img.decoding = 'async';
            return img;
        }));
    });
}

dialog.querySelector('.event-dialog__close').addEventListener('click', () => dialog.close());
// the panel fills the dialog so a click that lands on the dialog itself is a click on the dark backdrop
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { activeEvent = null; });


const originalText = new WeakMap();

// splits plain text elements into one span per rendered line
function splitLines(element) {
    if (!originalText.has(element)) {
        originalText.set(element, element.textContent.trim().replace(/\s+/g, ' '));
    }
    const text = originalText.get(element);
    if (!text) return [element];
    element.textContent = text;
    const textNode = element.firstChild;
    const range = document.createRange();
    const lines = [];
    let previousTop;

    for (const word of text.matchAll(/\S+/g)) {
        range.setStart(textNode, word.index);
        range.setEnd(textNode, word.index + word[0].length);
        const top = range.getBoundingClientRect().top;
        if (previousTop === undefined || Math.abs(top - previousTop) > 2) {
            lines.push([]);
            previousTop = top;
        }
        lines.at(-1).push(word[0]);
    }

    const spans = lines.map(words => {
        const span = document.createElement('span');
        span.className = 'reveal-line reveal-item';
        span.textContent = words.join(' ');
        return span;
    });
    element.replaceChildren(...spans.flatMap((span, i) => i ? [document.createTextNode(' '), span] : [span]));
    return spans;
}

function prepareGroup(group) {
    let step = 0;
    const items = [...group.querySelectorAll(
        'h1, h2, h3, p, .calendar, .contact-list li, .embed-slot'
    )].filter(item => !item.closest('dialog'));
    // headings first then paragraphs then everything else
    const rank = item => item.matches('h1, h2, h3') ? 0 : item.matches('p') ? 1 : 2;
    items.sort((a, b) => rank(a) - rank(b));

    for (const item of items) {
        const canSplit = item.matches('h1, h2, h3, p') && (originalText.has(item) || !item.children.length);
        for (const part of canSplit ? splitLines(item) : [item]) {
            part.classList.add('reveal-item');
            part.style.setProperty('--reveal-delay', `${step++ * REVEAL_STEP}s`);
        }
    }
}

// event boxes appear one after another 
// each batch as it scrolls into view
function revealCards() {
    if (!animate) return;
    const cards = [...grid.querySelectorAll('.event-card')];
    const observer = new IntersectionObserver(entries => {
        entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => cards.indexOf(a.target) - cards.indexOf(b.target))
            .forEach((entry, i) => {
                entry.target.style.setProperty('--reveal-delay', `${i * REVEAL_STEP}s`);
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
    }, { rootMargin: '0px 0px -5% 0px' });
    cards.forEach(card => {
        card.classList.add('reveal-card');
        observer.observe(card);
    });
}

async function initTextReveals() {
    
    await document.fonts.ready;
    const groups = [...document.querySelectorAll('.page-header, main > .band')];
    groups.forEach(prepareGroup);
    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        }
    }, { rootMargin: '0px 0px -10% 0px' });
    groups.forEach(group => {
        
        group.getBoundingClientRect();
        observer.observe(group);
    });


    let viewportWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (window.innerWidth !== viewportWidth) {
            viewportWidth = window.innerWidth;
            groups.forEach(prepareGroup);
        }
    });
}

if (animate) initTextReveals();

loadEvents();
