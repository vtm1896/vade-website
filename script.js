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
    async function fetchRatings() {
        // Show initial state immediately
        updateDashboard();

        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('ratings').select('rating');
            if (!error && data) {
                realRatings = data.map(r => r.rating);
                updateDashboard();
            }
        } catch (e) {
            console.error("Supabase fetch failed.");
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
        const totalCount = realRatings.length;
        
        let avg = 0;
        if (totalCount > 0) {
            const sum = realRatings.reduce((a, b) => a + b, 0);
            avg = (sum / totalCount).toFixed(1);
        } else {
            avg = "0.0";
        }
        
        // Update DOM
        const scoreEl = document.getElementById('avg-score');
        const countEl = document.getElementById('review-count');
        const labelEl = document.getElementById('rating-label');

        if (scoreEl) scoreEl.innerText = avg;
        if (countEl) countEl.innerText = `${totalCount} review${totalCount !== 1 ? 's' : ''}`;

        // Update Label
        if (labelEl) {
            if (totalCount === 0) labelEl.innerText = "No Ratings Yet";
            else if (avg >= 4.8) labelEl.innerText = "Exceptional";
            else if (avg >= 4.0) labelEl.innerText = "Best";
            else if (avg >= 3.0) labelEl.innerText = "Good";
            else if (avg >= 2.0) labelEl.innerText = "OK";
            else labelEl.innerText = "Bad";
        }

        // Update Bars
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        realRatings.forEach(r => counts[r]++);

        for (let i = 1; i <= 5; i++) {
            let percentage = 0;
            if (totalCount > 0) {
                percentage = ((counts[i] / totalCount) * 100).toFixed(0);
            }
            const bar = document.getElementById(`bar-${i}`);
            if (bar) bar.style.width = `${percentage}%`;
        }

        // Update visual stars
        const starsVisual = document.getElementById('stars-visual');
        if (starsVisual) {
            starsVisual.innerHTML = '';
            const numericAvg = Number(avg);
            for (let i = 1; i <= 5; i++) {
                const icon = document.createElement('i');
                icon.className = i <= Math.round(numericAvg) && numericAvg > 0 ? 'fa-solid fa-star' : 'fa-regular fa-star';
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
                alert("Error submitting rating: " + e.message + "\n\n(If it says 'new row violates row-level security', you need to enable INSERT policies in your Supabase dashboard).");
                submitBtn.innerText = "Submit Rating";
                submitBtn.disabled = false;
            }
        };
    }

    // Initial load
    fetchRatings();
    setupRealtime();
});
