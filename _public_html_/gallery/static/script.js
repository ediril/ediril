// Image pages: arrow keys and horizontal swipes follow the Previous/Next links, Escape goes back to the grid.
// Pages without those links (the grid) are unaffected.

function follow(nav) {
    const link = document.querySelector(`a[data-nav="${nav}"]`);
    if (link) {
        window.location.href = link.href;
    }
}

document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
    }
    const nav = { ArrowLeft: 'prev', ArrowRight: 'next', Escape: 'back' }[event.key];
    if (nav) {
        follow(nav);
    }
});

let touchStart = null;

document.addEventListener('touchstart', (event) => {
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });

document.addEventListener('touchend', (event) => {
    if (!touchStart) {
        return;
    }
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        follow(dx < 0 ? 'next' : 'prev');
    }
}, { passive: true });
