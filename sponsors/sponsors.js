// Current sponsors have a section for each tier; cards keep the JSON order.
const TIER_SECTIONS = {
    "turing+": "turing-plus-sponsors",
    "turing": "turing-sponsors",
    "dijkstra": "dijkstra-sponsors"
};
const STAGGER = 0.1;   // seconds between cards / lines

// run something when elements scroll into view (elements that appear together are staggered)
function whenVisible(elements, show) {
    const observer = new IntersectionObserver(entries => {
        entries.filter(entry => entry.isIntersecting).forEach((entry, i) => {
            show(entry.target, i);
            observer.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -10% 0px" });

    elements.forEach(el => observer.observe(el));
}

// an empty line is skipped, so blank fields in the JSON don't leave gaps
function line(className, text) {
    return text ? `<p class="${className}">${text}</p>` : "";
}

function addCard(sectionId, s) {
    const card = document.createElement("a");
    card.className = "sponsor-card";

    // check if this exists before tyring to open it
    if (s.sponsorship) {
        card.href = s.sponsorship;
        card.target = "_blank";                    
    }

    card.innerHTML = `
        <img src="${s.logo}" alt="${s.name} logo">
        <div>
            <h3 class="sponsor-card__name">${s.name}</h3>
            ${line("sponsor-card__tier", s.tier)}
            ${line("sponsor-card__text", s.description)}
        </div>`;
    document.getElementById(sectionId).appendChild(card);
}


fetch("/assets/data/sponsors.json", { cache: "no-store" })
    .then(response => response.json())
    .then(sponsors => {
        sponsors.filter(s => s.current)
            .forEach(s => {
                const sectionId = TIER_SECTIONS[String(s.tier).trim().toLowerCase()];
                if (sectionId) addCard(sectionId, s);
            });

        sponsors.filter(s => !s.current)
            .forEach(s => addCard("past-sponsors", s));

        // cards fade in and up one after another as they scroll into view
        whenVisible(document.querySelectorAll(".sponsor-card"), (card, i) => {
            card.style.animationDelay = i * STAGGER + "s";
            card.classList.add("is-visible");
        });
    })
    .catch(error => console.error("Could not load sponsors.json:", error));



// any element with data-lines is split into the lines it is actually displayed on
// and each line fades in one after another. 
function splitIntoLines(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";

    // put every word in a span so we can see which line it landed on
    const spans = words.map(word => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        el.append(span);
        return span;
    });

    // words with the same vertical position are on the same line
    const lines = [];
    let lastTop;
    spans.forEach((span, i) => {
        if (span.offsetTop !== lastTop) {
            lines.push("");
            lastTop = span.offsetTop;
        }
        lines[lines.length - 1] += words[i] + " ";
    });

    // replace the word spans with one block per line
    el.textContent = "";
    lines.forEach((text, i) => {
        const lineEl = document.createElement("span");
        lineEl.className = "reveal-line reveal-item";
        lineEl.style.setProperty("--reveal-delay", (parseFloat(el.dataset.delay) || 0) + i * STAGGER + "s");
        lineEl.textContent = text.trim();
        el.append(lineEl);
    });
}

// wait for fonts so the lines are measured with the right font
document.fonts.ready.then(() => {
    const texts = document.querySelectorAll("[data-lines]");
    texts.forEach(splitIntoLines);
    whenVisible(texts, el => el.classList.add("is-visible"));
});
