document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Mouse glow effect
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        if (cursorGlow) {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        }
    });

    // --- SUPABASE RATING SYSTEM ---
    const SUPABASE_URL = 'https://dkwaqolschyikupfrbdu.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2Fxb2xzY2h5aWt1cHZyYmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTE0MTQslmV4cCI6MjA5MDkyNzExNH0.mYQhccDx7ua_Gr5t2OvBqh1BQJedfcrFJiv7oboW0g';
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    // Database state
    let realRatings = [];
    // Seed data (simulated 12.4k reviews for social proof as requested)
    const seedCount = 12450;
    const seedAvg = 4.8;

    async function fetchRatings() {
        // Show initial seeded state immediately
        updateDashboard();

        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('ratings').select('rating');
            if (!error && data) {
                realRatings = data.map(r => r.rating);
                updateDashboard();
            }
        } catch (e) {
            console.error("Supabase fetch failed, showing seeded data only.");
        }
    }

    // --- REALTIME SUBSCRIPTION ---
    function setupRealtime() {
        if (!supabase) return;
        
        supabase
            .channel('public:ratings')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ratings' }, payload => {
                console.log('New rating received!', payload.new);
                realRatings.push(payload.new.rating);
                updateDashboard();
            })
            .subscribe();
    }

    function updateDashboard() {
        const totalCount = realRatings.length + seedCount;
        
        // Calculate average
        const realSum = realRatings.reduce((a, b) => a + b, 0);
        const avg = ((realSum + (seedCount * seedAvg)) / totalCount).toFixed(1);
        
        // Update DOM
        const scoreEl = document.getElementById('avg-score');
        const countEl = document.getElementById('review-count');
        const labelEl = document.getElementById('rating-label');

        if (scoreEl) scoreEl.innerText = avg;
        if (countEl) countEl.innerText = `${(totalCount / 1000).toFixed(1)}K reviews`;

        // Update Label
        if (labelEl) {
            if (avg >= 4.8) labelEl.innerText = "Exceptional";
            else if (avg >= 4.5) labelEl.innerText = "Excellent";
            else if (avg >= 4.0) labelEl.innerText = "Great";
            else labelEl.innerText = "Good";
        }

        // Update Bars
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        realRatings.forEach(r => counts[r]++);
        
        // Add weighted seed distribution
        counts[5] += Math.round(seedCount * 0.85);
        counts[4] += Math.round(seedCount * 0.10);
        counts[3] += Math.round(seedCount * 0.03);
        counts[2] += Math.round(seedCount * 0.01);
        counts[1] += Math.round(seedCount * 0.01);

        for (let i = 1; i <= 5; i++) {
            const percentage = ((counts[i] / totalCount) * 100).toFixed(0);
            const bar = document.getElementById(`bar-${i}`);
            if (bar) bar.style.width = `${percentage}%`;
        }

        // Update visual stars
        const starsVisual = document.getElementById('stars-visual');
        if (starsVisual) {
            starsVisual.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                const icon = document.createElement('i');
                icon.className = i <= Math.round(avg) ? 'fa-solid fa-star' : 'fa-regular fa-star';
                starsVisual.appendChild(icon);
            }
        }
    }

    // Modal & Star Input Logic
    const modal = document.getElementById('rate-modal');
    const openBtn = document.getElementById('open-rate-btn');
    const closeBtn = document.querySelector('.close-modal');
    const starsInput = document.querySelectorAll('#stars-input i');
    const submitBtn = document.getElementById('submit-rating-btn');
    const modalText = document.getElementById('modal-rating-text');
    let currentInput = 0;

    if (openBtn) {
        openBtn.onclick = () => {
            if (localStorage.getItem('vade_rated')) {
                alert("You have already rated Vade! Thank you for your support.");
                return;
            }
            modal.classList.add('active');
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.remove('active');
    }

    window.onclick = (e) => { 
        if (e.target == modal) modal.classList.remove('active');
    };

    starsInput.forEach(star => {
        star.onmouseover = () => {
            const val = parseInt(star.dataset.value);
            highlightInput(val, 'hover');
        };
        star.onmouseout = () => highlightInput(currentInput, 'active');
        star.onclick = () => {
            currentInput = parseInt(star.dataset.value);
            highlightInput(currentInput, 'active');
            submitBtn.disabled = false;
            modalText.innerText = `You are about to submit a ${currentInput}-star rating.`;
        };
    });

    function highlightInput(count, className) {
        starsInput.forEach((s, i) => {
            s.classList.remove('hover', 'active');
            if (i < count) s.classList.add(className);
        });
    }

    if (submitBtn) {
        submitBtn.onclick = async () => {
            if (!supabase || currentInput === 0) return;
            submitBtn.innerText = "Submitting...";
            submitBtn.disabled = true;

            try {
                const { error } = await supabase.from('ratings').insert([{ rating: currentInput }]);
                
                if (!error) {
                    localStorage.setItem('vade_rated', 'true');
                    modal.classList.remove('active');
                    await fetchRatings(); // Refresh dashboard
                    setTimeout(() => alert("Thank you! Your rating has been submitted."), 300);
                } else {
                    throw new Error(error.message);
                }
            } catch (e) {
                alert("Error submitting rating. Please try again later.");
                submitBtn.innerText = "Submit Rating";
                submitBtn.disabled = false;
            }
        };
    }

    // Initial load
    fetchRatings();
    setupRealtime();
});
