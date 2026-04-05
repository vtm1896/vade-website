document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal animation
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // Navbar effect on scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Custom cursor glow tracking
    const cursorGlow = document.getElementById('cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // Interactive button hover for glow
    const buttons = document.querySelectorAll('.cta-btn, .feature-card, .executor-showcase');
    
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            cursorGlow.style.width = '400px';
            cursorGlow.style.height = '400px';
        });
        
        btn.addEventListener('mouseleave', () => {
            cursorGlow.style.width = '300px';
            cursorGlow.style.height = '300px';
        });
    });

    // Star Rating Interaction
    const stars = document.querySelectorAll('#stars-container i');
    const ratingText = document.getElementById('rating-text');
    let selectedRating = 0;

    const ratingLabels = {
        1: "Poor - Needs improvement",
        2: "Fair - Decent tool",
        3: "Good - Solid performance",
        4: "Great - Highly recommended",
        5: "Exceptional - Best in class!"
    };

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const value = parseInt(star.getAttribute('data-value'));
            highlightStars(value, 'hover');
        });

        star.addEventListener('mouseout', () => {
            highlightStars(selectedRating, 'active');
        });

        star.addEventListener('click', () => {
            selectedRating = parseInt(star.getAttribute('data-value'));
            highlightStars(selectedRating, 'active');
            ratingText.innerText = `You rated: ${ratingLabels[selectedRating]}`;
            ratingText.style.color = "gold";
            
            // Pulse animation on click
            star.style.transform = "scale(1.5)";
            setTimeout(() => star.style.transform = "", 200);
        });
    });

    function highlightStars(count, className) {
        stars.forEach((s, idx) => {
            s.classList.remove('hover', 'active');
            if (idx < count) {
                s.classList.add(className);
            }
        });
    }
});
