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
});
