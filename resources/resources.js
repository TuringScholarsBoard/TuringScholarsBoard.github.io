// shared scroll reveals for the resources index and both guides
(async () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    await document.fonts.ready;
    if (reducedMotion.matches) return;

    const selector = 'h1, h2, h3, h4, p, li, .guide-btn, .guide-table-wrap';
    const items = [...document.querySelectorAll('main > section')].flatMap(section =>
        [...section.querySelectorAll(selector)].filter(item =>
            !item.closest('table') &&
            !item.parentElement.closest('.guide-table-wrap') &&
            !(item.matches('li') && item.querySelector('p, ul, ol'))
        )
    );
    const order = new Map(items.map((item, index) => [item, index]));
    const originalContent = new WeakMap();
    const parts = new WeakMap();
    const revealed = new WeakSet();

    // basically taken from index.js,
    // measure each words rendered line 
    // clone the ranges instead
    // of replacing textContent so inline links and emphasis keep working.
    function splitLines(element) {
        if (!originalContent.has(element)) {
            const content = document.createDocumentFragment();
            content.append(...[...element.childNodes].map(node => node.cloneNode(true)));
            originalContent.set(element, content);
        }
        element.replaceChildren(originalContent.get(element).cloneNode(true));
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const lines = [];
        let node;
        while ((node = walker.nextNode())) {
            for (const word of node.textContent.matchAll(/\S+/g)) {
                const range = document.createRange();
                range.setStart(node, word.index);
                range.setEnd(node, word.index + word[0].length);
                const top = range.getBoundingClientRect().top;
                let line = lines.at(-1);
                if (!line || Math.abs(top - line.top) > 2) {
                    line = { top, range: range.cloneRange() };
                    lines.push(line);
                } else {
                    line.range.setEnd(node, word.index + word[0].length);
                }
            }
        }
        const spans = lines.map(line => {
            const span = document.createElement('span');
            span.className = 'guide-reveal-line';
            span.append(line.range.cloneContents());
            return span;
        });
        element.replaceChildren(...spans.flatMap((span, index) =>
            index ? [document.createTextNode(' '), span] : [span]
        ));
        return spans;
    }

    function prepare(item) {
        const canSplit = item.matches('h1, h2, h3, h4, p, li') &&
            !item.querySelector('.guide-note');
        const elements = canSplit ? splitLines(item) : [item];
        elements.forEach(part => {
            part.classList.add('guide-reveal');
            if (revealed.has(item)) {
                part.classList.add('guide-reveal--visible', 'guide-reveal--settled');
            }
        });
        parts.set(item, elements);
    }

    const reveal = (item, delay = 0) => {
        parts.get(item).forEach((part, index) => {
            part.style.setProperty('--guide-reveal-delay', `${delay + index * 0.08}s`);
            part.classList.add('guide-reveal--visible');
        });
        revealed.add(item);
        observer.unobserve(item);
    };

    // delay only the items entering the viewport together so long guides
    // don't accumulate delays for content further down the page.
    const observer = new IntersectionObserver(entries => {
        let step = 0;
        entries.filter(entry => entry.isIntersecting)
            .sort((a, b) => order.get(a.target) - order.get(b.target))
            .forEach(entry => {
                reveal(entry.target, step * 0.08);
                step += parts.get(entry.target).length;
            });
    }, { rootMargin: '0px 0px -5% 0px' });

    items.forEach(item => {
        prepare(item);
        observer.observe(item);
    });

    let viewportWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (window.innerWidth === viewportWidth) return;
        viewportWidth = window.innerWidth;
        items.forEach(prepare);
    });

    // keyboard navigation 
    document.addEventListener('focusin', event => {
        const item = items.find(item => item.contains(event.target));
        if (item) {
            reveal(item);
            parts.get(item).forEach(part => part.style.setProperty('--guide-reveal-delay', '0s'));
        }
    });

    reducedMotion.addEventListener('change', event => {
        if (!event.matches) return;
        observer.disconnect();
        items.forEach(item => reveal(item));
    });
})();
