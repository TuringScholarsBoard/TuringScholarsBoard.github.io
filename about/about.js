const LINE_OFFSET = 0.12;   // seconds between lines
const BLOCK_OFFSET = 0.15;  // seconds after an image / number / map

// Keep the hero within the space below the navbar, including when links wrap.
const nav = document.querySelector(".nav");
const updateNavHeight = () => {
    document.documentElement.style.setProperty("--nav-h", `${nav.getBoundingClientRect().height}px`);
};
new ResizeObserver(updateNavHeight).observe(nav);
updateNavHeight();

/** copy and pasted from previous line code */
function splitLines(line) {
    if (line.dataset.text === undefined) {
        line.dataset.text = line.textContent.trim().replace(/\s+/g, " ");
    }

    // 1) one span per word so we can measure where lines wrap
    line.textContent = "";
    const words = line.dataset.text.split(" ").map(word => {
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        line.append(span, " ");
        return span;
    });

    // 2) group words by their vertical position
    const lines = [];
    let lastTop = null;
    words.forEach(span => {
        const top = span.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 2) {
            lines.push([]);
            lastTop = top;
        }
        lines[lines.length - 1].push(span.textContent);
    });

    // replace with one block per line
    line.textContent = "";
    lines.forEach(words => {
        const bruh = document.createElement("span");
        bruh.className = "fx-line";
        bruh.textContent = words.join(" ");
        line.append(bruh);
    });
    line.classList.add("is-split");
}

/** split all text in a group based on text length, then assign staggered delays in page order */
function layoutGroup(group) {
    let t = 0;
    group.querySelectorAll("[data-split], .fx-block").forEach(line => {
        if (line.matches("[data-split]")) {
            splitLines(line);
            line.querySelectorAll(".fx-line").forEach(line => {
                line.style.setProperty("--d", `${t.toFixed(2)}s`);
                t += LINE_OFFSET;
            });
        } else {
            line.style.setProperty("--d", `${t.toFixed(2)}s`);
            t += BLOCK_OFFSET;
        }
    });
}

// code to count numbers from 1-N
const fmt = new Intl.NumberFormat("en-US");

function renderCount(line, value) {
    line.textContent = `${line.dataset.prefix ?? ""}${fmt.format(value)}${line.dataset.suffix ?? ""}`;
}

// count from 1-N
function countUp(line) {
    const target = Number(line.dataset.count);
    // if (reducedMotion) return renderCount(line, target);

    const duration = 1800;
    const start = performance.now();
    function frame(now) {
        const p = Math.min((now - start) / duration, 1);

        // slowly make it go out
        // quandratic x^3 for slow ease out
        const eased = 1 - Math.pow(1 - p, 3); // ease-out
        renderCount(line, Math.max(1, Math.round(1 + (target - 1) * eased)));
        if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}


// function prepareCounts() {
//     if (reducedMotion) return;
//     document.querySelectorAll("[data-count]").forEach(line => renderCount(line, 1));
// }

// reveal groups when they come into view
function initReveal() {
    const groups = [...document.querySelectorAll(".reveal-group")];
    groups.forEach(layoutGroup);

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const group = entry.target;
            group.classList.add("is-visible");
            observer.unobserve(group);

            group.querySelectorAll("[data-count]").forEach(el => {
                const delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
                setTimeout(() => countUp(el), delay * 1000);
            });
        });
    }, { threshold: 0.15 });

    groups.forEach(group => observer.observe(group));

    // re-split lines if the width changes (wrapping changes or window resizing)
    let lastWidth = window.innerWidth;
    let timer;
    window.addEventListener("resize", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (window.innerWidth === lastWidth) return;
            lastWidth = window.innerWidth;
            groups.forEach(group => {
                layoutGroup(group);
                if (group.classList.contains("is-visible")) group.classList.add("is-static");
            });
        }, 200);
    });
}


// alumni carousel animation
const ALUMNI_LOGO_DIR = "/assets/logos/alumni/";

// I HATE REGEX!!!
const IMAGE_EXT = /\.(png|jpe?g|svg|webp|gif|avif)$/i;
const CAROUSEL_SPEED = 40; 


async function listAlumniLogos() {
    const base = new URL(ALUMNI_LOGO_DIR, location.origin);

    try {
        const res = await fetch(base);
        if (!res.ok) throw new Error("no folder listing");
        const doc = new DOMParser().parseFromString(await res.text(), "text/html");
        const files = [...doc.querySelectorAll("a[href]")]
            .map(a => a.getAttribute("href"))
            .filter(href => IMAGE_EXT.test(href.split("?")[0]))
            .map(href => new URL(href, base).pathname);
        if (files.length) return [...new Set(files)];
    } catch { }

    try {
        const res = await fetch(new URL("manifest.json", base));
        if (!res.ok) throw new Error("no manifest");
        const names = await res.json();
        return names.map(name => new URL(name, base).pathname);
    } catch {
        return [];
    }
}

function altFromPath(path) {
    const file = decodeURIComponent(path.split("/").pop());
    return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

function makeGroup(items, { hidden = false } = {}) {
    const group = document.createElement("div");
    group.className = "carousel__group";
    if (hidden) group.setAttribute("aria-hidden", "true");

    items.forEach(src => {
        const tile = document.createElement("div");
        tile.className = "logo-tile";
        if (src) {
            const img = new Image();
            img.src = src;
            img.alt = hidden ? "" : altFromPath(src);
            img.draggable = false;
            tile.append(img);
        }
        group.append(tile);
    });
    return group;
}

function buildCarousel(carousel, items) {
    const track = carousel.querySelector(".carousel__track");
    track.textContent = "";

    // measure one copy of the set (tile sizes are fixed in CSS, so images needn't be loaded)
    const probe = makeGroup(items);
    track.append(probe);
    const copyWidth = probe.offsetWidth;
    const reps = Math.max(1, Math.ceil(carousel.clientWidth / copyWidth));
    probe.remove();

    // one group wider than the screen, then an identical copy for the seamless loop
    const repeated = Array.from({ length: reps }, () => items).flat();
    const group = makeGroup(repeated);
    track.append(group, makeGroup(repeated, { hidden: true }));
    carousel.dataset.reps = reps;

    const groupWidth = group.offsetWidth;
    track.style.setProperty("--duration", `${(groupWidth / CAROUSEL_SPEED).toFixed(1)}s`);

    // start the bottom row half a tile out of line with the top row, like the design
    if (carousel.dataset.direction === "right") {
        const tile = group.firstElementChild;
        const gap = parseFloat(getComputedStyle(group).columnGap) || 0;
        const offset = ((tile?.offsetWidth ?? 0) + gap) / 2;
        track.style.animationDelay = `${-(offset / CAROUSEL_SPEED).toFixed(2)}s`;
    }
}

async function initAlumni() {
    const carousels = [...document.querySelectorAll(".carousel")];
    const files = await listAlumniLogos();

    // split the images in half: first half on top, second half below
    // (empty white tiles are shown if no images are found)
    const third = Math.ceil(files.length / 3);
    const rows = files.length
        ? [files.slice(0, third), files.slice(third, third * 2), files.slice(third * 2)]
        : [Array(8).fill(null), Array(8).fill(null)];

    // a single logo can't be split in two rows
    if (!rows[1].length) rows[1] = rows[0];

    const build = () => carousels.forEach((c, i) => buildCarousel(c, rows[i]));
    build();

    // rebuild only if a wider screen needs more repeats
    let timer;
    window.addEventListener("resize", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const needsMore = carousels.some((c, i) => {
                const copy = makeGroup(rows[i]);
                c.querySelector(".carousel__track").append(copy);
                const needed = Math.ceil(c.clientWidth / copy.offsetWidth);
                copy.remove();
                return needed > Number(c.dataset.reps);
            });
            if (needsMore) build();
        }, 250);
    });
}

//use d3.js for better customization 
const SPREAD_COLORS = ["#005f86", "#6593da", "#4371b8", "#082e68", "#62bdff"];
const SPREAD_DATA_URL = "/assets/data/about_us_demographics.json"; // adjust to wherever your json lives
const SPREAD_SPIN_MS = 1400;

async function initSpread() {
    const size = 500;
    const radius = size / 2 - 8;

    const data = await (await fetch(SPREAD_DATA_URL)).json();
    const total = d3.sum(data, d => d.value);

    // while the json is still all zeros, draw equal slices so the design is visible
    const slices = d3.pie()
        .sort(null)                                   // keep json order
        .value(d => total ? d.value : 1)(data);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.id))
        .range(SPREAD_COLORS);

    const svg = d3.select("#student-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${size} ${size}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // wedge that grows clockwise from 12 o'clock; it clips the whole pie
    const sweep = d3.arc().innerRadius(0).outerRadius(radius + 10).startAngle(0);
    const wedge = svg.append("defs")
        .append("clipPath").attr("id", "spread-reveal")
        .append("path")
        .attr("d", sweep.endAngle(0)());

    const pie = svg.append("g")
        .attr("transform", `translate(${size / 2}, ${size / 2})`)
        .attr("clip-path", "url(#spread-reveal)");

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    pie.selectAll("path")
        .data(slices)
        .join("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.id))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

    // legend with percentages (blank percentages until real values are in)
    const legend = d3.select("#student-legend");
    legend.selectAll("li")
        .data(data)
        .join("li")
        .html(d => `
            <span class="spread__swatch" style="background:${color(d.id)}"></span>
            <span class="spread__name">${d.name}</span>
            <span class="spread__pct">${total ? Math.round(d.value / total * 100) + "%" : ""}</span>`);

    const play = () =>
        wedge.transition()
            .duration(SPREAD_SPIN_MS)
            .ease(d3.easeCubicInOut)
            .attrTween("d", () => t => sweep.endAngle(t * 2 * Math.PI)());

    // start when the chart scrolls into view
    const observer = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        play();
    }, { threshold: 0.3 });
    observer.observe(document.querySelector("#student-chart"));
}


//prepareCounts();

// wait for fonts so lines wrap the way they will actually render
await document.fonts.ready;
initReveal();

initAlumni().catch(err => console.error("Alumni carousels failed:", err));
initSpread().catch(err => console.error("Student spread failed:", err));
