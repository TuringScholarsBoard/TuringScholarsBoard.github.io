// Each FAQ expands independently; native details still work without JavaScript.
document.querySelectorAll('.faq__item').forEach(item => {
    const question = item.querySelector('summary');
    const answer = item.querySelector('.faq__answer');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let expanded = item.open;
    let animation;

    item.dataset.faqAnimated = '';
    question.setAttribute('aria-expanded', String(expanded));

    question.addEventListener('click', event => {
        event.preventDefault();
        expanded = !expanded;
        question.setAttribute('aria-expanded', String(expanded));

        // Measure before cancelling so repeated clicks reverse smoothly.
        const startHeight = item.open ? answer.getBoundingClientRect().height : 0;
        animation?.cancel();
        if (reducedMotion.matches || !answer.animate) {
            item.open = expanded;
            return;
        }

        item.open = true;
        animation = answer.animate([
            { height: `${startHeight}px` },
            { height: `${expanded ? answer.scrollHeight : 0}px` }
        ], { duration: 300, easing: 'ease-in-out', fill: 'both' });

        animation.onfinish = () => {
            item.open = expanded;
            animation.cancel();
            animation = null;
        };
    });
});
