// keep the hero within the space below the navbar, including when links wrap.
const nav = document.querySelector(".nav");
const updateNavHeight = () => {
    document.documentElement.style.setProperty("--nav-h", `${nav.getBoundingClientRect().height}px`);
};
new ResizeObserver(updateNavHeight).observe(nav);
updateNavHeight();

fetch("/assets/data/board_members.json", { cache: "no-store" })
    .then(response => response.json())
    .then(members => {
        members.filter(m => m.current).forEach((m, i) => {
            const card = document.createElement("article");
            card.className = "boardmember";

            // add a delay so they come in one after another
            card.style.animationDelay = i * 0.2 + "s";
            card.innerHTML = `
                <figure class="split__figure">
                    <img src="${m.headshot}" alt="${m.name}">
                    <figcaption>${m.name}</figcaption>
                </figure>
                <div class="info">
                    <div>
                        <h3 class="name">${m.name}</h3>
                        <p class="title">${m.position}</p>
                    </div>
                    <div>
                        <p class="grad">'${String(m.graduatingYear).slice(-2)}</p>
                        <a href="mailto:${m.email}">${m.email}</a>
                    </div>
                </div>`;

            document.getElementById("current-board").appendChild(card);
        });
    })
    .catch(error => console.error("Could not load board_members.json:", error));



// any element with data-lines is split into the lines it is actually displayed on
// and each line fades in one after another when it scrolls into view.
const LINE_STEP = 0.1;   

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
        const line = document.createElement("span");
        line.className = "reveal-line reveal-item";
        line.style.setProperty("--reveal-delay", (parseFloat(el.dataset.delay) || 0) + i * LINE_STEP + "s");
        line.textContent = text.trim();
        el.append(line);
    });
}

// wait for fonts so the lines are measured with the right font
document.fonts.ready.then(() => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll("[data-lines]").forEach(el => {
        splitIntoLines(el);
        observer.observe(el);
    });
});
