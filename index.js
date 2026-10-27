
// the banner folder contains 1.webp through 50.webp, please change length manually
const bannerPhotos = Array.from({ length: 50 }, (_, index) =>
    `assets/photos/banner_photos/webp/${index + 1}.webp`
);


const firstFrame = document.querySelector('.landing_bg');
const secondFrame = firstFrame.cloneNode();
secondFrame.alt = '';
secondFrame.setAttribute('aria-hidden', 'true');
secondFrame.classList.add('landing_bg--hidden');
firstFrame.after(secondFrame);

let visibleFrame = firstFrame;
let hiddenFrame = secondFrame;
let currentPhoto = firstFrame.getAttribute('src');
let nextPhoto = null;

/*
preload the next photo while the current photo is displayed to minimize loading time
*/
function preloadNextPhoto() {
    const candidates = bannerPhotos.filter(photo => photo !== currentPhoto);
    //random selection
    const photo = candidates[Math.floor(Math.random() * candidates.length)];
    const preload = new Image();
    preload.onload = () => { nextPhoto = photo; };
    // keep the current image visible if a photo cannot be loaded and retry on the next tick
    preload.onerror = () => { nextPhoto = null; };
    preload.src = photo;
}

preloadNextPhoto();

window.setInterval(() => {
    if (!nextPhoto) {
        preloadNextPhoto();
        return;
    }

    // have them transition at the same time to create a blend effect
    hiddenFrame.src = nextPhoto;
    hiddenFrame.classList.remove('landing_bg--hidden');
    visibleFrame.classList.add('landing_bg--hidden');
    [visibleFrame, hiddenFrame] = [hiddenFrame, visibleFrame];
    currentPhoto = nextPhoto;
    nextPhoto = null;
    preloadNextPhoto();
}, 5000);

// reveal each section once with text lines photos captions and buttons in order.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    'IntersectionObserver' in window) {
    const groups = [...document.querySelectorAll('.landing_content, main > .band')];
    const originalText = new WeakMap();
    
    // splits the lines for a more dynamic fade in effect
    function splitLines(element) {
        // trims the text line by line
        if (!originalText.has(element)) {
            originalText.set(element, element.textContent.trim().replace(/\s+/g, ' '));
        }
        const text = originalText.get(element);
        element.textContent = text;
        const textNode = element.firstChild;
        const range = document.createRange();
        const lines = [];
        let previousTop;

        // check if it matches line break
        // adds them into a queue
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

        // spaces keep the original words separated when copied or read aloud.
        // not really needed
        element.replaceChildren(...spans.flatMap((span, index) =>
            index ? [document.createTextNode(' '), span] : [span]
        ));
        return spans;
    }

    // prepare for loading animation
    function prepareGroup(group) {
        let step = 0;
        const items = group.querySelectorAll(
            'h1, h2, p, .split__figure img, figcaption, .sponsor-card, .btn'
        );
        // text first, followed by photos, captions, and the action button
        const ordered = [...items].sort((a, b) => {
            const rank = item => item.matches('h1, h2') ? 0 :
                item.matches('p') ? 1 : item.matches('figcaption') ? 3 :
                item.matches('.btn') ? 4 : 2;
            return rank(a) - rank(b);
        });
        for (const item of ordered) {
            const parts = item.matches('h1, h2, p, figcaption') && !item.querySelector('a') ? splitLines(item) : [item];
            for (const part of parts) {
                part.classList.add('reveal-item');

                // reveal delay, increase for slower animation
                part.style.setProperty('--reveal-delay', `${step++ * 0.08}s`);
            }
        }
    }

    groups.forEach(prepareGroup);
    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        }
    }, { rootMargin: '0px 0px -10% 0px' });
    groups.forEach(group => observer.observe(group));

    // recalculate line breaks when fonts load or the viewport width changes
    document.fonts.ready.then(() => groups.forEach(prepareGroup));
    let viewportWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (window.innerWidth !== viewportWidth) {
            viewportWidth = window.innerWidth;
            groups.forEach(prepareGroup);
        }
    });
}
