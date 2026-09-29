(function () {
    const wrapper = document.querySelector('.carousel-wrapper');
    const track = document.getElementById('carouselTrack');
    const count = track.children.length;
    const EDGE = 0.10;      // left/right 10% click zones
    const THRESHOLD = 50;   // px of dragging needed to change slide

    let index = 0, startX = 0, dx = 0, dragging = false, moved = false;

    function render() {
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    // still used by the buttons via onclick="moveCarousel(...)"
    window.moveCarousel = function (direction) {
        index = (index + direction + count) % count;
        render();
    };

    // --- swipe / drag ---
    wrapper.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.carousel-btn')) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        moved = false;
        startX = e.clientX;
        dx = 0;
        track.style.transition = 'none'; // follow the finger without lag
    });

    wrapper.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        dx = e.clientX - startX;
        if (Math.abs(dx) > 5) moved = true;
        track.style.transform = `translateX(calc(-${index * 100}% + ${dx}px))`;
    });

    function endDrag(cancelled) {
        if (!dragging) return;
        dragging = false;
        track.style.transition = ''; // restore the CSS transition
        if (!cancelled && dx <= -THRESHOLD) moveCarousel(1);
        else if (!cancelled && dx >= THRESHOLD) moveCarousel(-1);
        else render(); // snap back
    }

    wrapper.addEventListener('pointerup', () => endDrag(false));
    wrapper.addEventListener('pointercancel', () => endDrag(true));
    wrapper.addEventListener('pointerleave', () => endDrag(false)); // mouse dragged out

    // --- clicks: edge zones + stop swipes from opening links ---
    wrapper.addEventListener('click', (e) => {
        if (e.target.closest('.carousel-btn')) return;

        if (moved) {            // that was a swipe, not a click
            e.preventDefault();
            moved = false;
            return;
        }

        const rect = wrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;

        if (x < EDGE) {
            e.preventDefault();
            moveCarousel(-1);
        } else if (x > 1 - EDGE) {
            e.preventDefault();
            moveCarousel(1);
        }
        // otherwise the link works as normal
    });
})();