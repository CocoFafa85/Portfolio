document.querySelectorAll('.row-link a img').forEach(img => {
    img.addEventListener('mouseenter', function() {
        // Clone et style pour effet central
        const clone = this.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = '50%';
        clone.style.left = '50%';
        clone.style.transform = 'translate(-50%, -50%) scale(0.65)';
        clone.style.zIndex = '1000';
        clone.style.pointerEvents = 'none';
        clone.style.borderRadius = '36px';
        clone.style.transition = 'transform 0.3s ease';
        clone.classList.add('zoomed-image');

        document.body.appendChild(clone);

        // Retirer quand la souris part
        this.addEventListener('mouseleave', function() {
            const zoomed = document.querySelector('.zoomed-image');
            if (zoomed) zoomed.remove();
        }, { once: true });
    });
});


