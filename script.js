document.addEventListener('DOMContentLoaded', () => {
            const observer = new IntersectionObserver((entries) => {
                            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

                              const cursorGlow = document.getElementById('cursor-glow');
            document.addEventListener('mousemove', (e) => {
                            if (cursorGlow) { cursorGlow.style.left = e.clientX + 'px'; cursorGlow.style.top = e.clientY + 'px'; }
            });

                              const SUPABASE_URL = 'https://dkwaqolschyikupfrbdu.supabase.co';
            const SUPABASE_KEY = 'sb_publishable_lsu3ZW0trrz-OXmVsjnoSA_p9XdJfvh';
            const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

                              let realRatings = [];
            const seedCount = 12450;
            const seedAvg = 4.8;

                              async function fetchRatings() {
                                              updateDashboard();
                                              if (!supabase) return;
                                              try {
                                                                  const { data, error } = await supabase.from('ratings').select('rating');
                                                                  if (data && !error) { realRatings = data.map(r => r.rating); updateDashboard(); }
                                              } catch (e) { console.error("Fetch failed", e); }
                              }

                              function updateDashboard() {
                                              const totalCount = realRatings.length + seedCount;
                                              const realSum = realRatings.reduce((a, b) => a + b, 0);
                                              const avg = parseFloat(((realSum + (seedCount * seedAvg)) / totalCount).toFixed(1));

                const scoreEl = document.getElementById('avg-score');
                                              const countEl = document.getElementById('review-count');
                                              const labelEl = document.getElementById('rating-label');

                if (scoreEl) scoreEl.innerText = avg;
                                              if (countEl) countEl.innerText = `${(totalCount / 1000).toFixed(1)}K reviews`;

                if (labelEl) {
                                    if (avg >= 4.8) labelEl.innerText = "Exceptional";
                                    else if (avg >= 4.5) labelEl.innerText = "Excellent";
                                    else if (avg >= 4.0) labelEl.innerText = "Very Good";
                                    else if (avg >= 3.5) labelEl.innerText = "Good";
                                    else labelEl.innerText = "Fair";
                }

                const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                                              realRatings.forEach(r => counts[r]++);
                                              counts[5] += Math.round(seedCount * 0.85);
                                              counts[4] += Math.round(seedCount * 0.10);
                                              counts[3] += Math.round(seedCount * 0.03);

                for (let i = 1; i <= 5; i++) {
                                    const bar = document.getElementById(`bar-${i}`);
                                    if (bar) bar.style.width = ((counts[i] / totalCount) * 100).toFixed(0) + "%";
                }
                              }

                              const modal = document.getElementById('rating-modal');
            const openBtn = document.getElementById('open-rate-btn');
            const closeBtn = document.querySelector('.close-modal');
            const stars = document.querySelectorAll('.modal-stars i');
            const submitBtn = document.getElementById('submit-rating');
            let selected = 0;

                              if (openBtn) openBtn.onclick = () => {
                                              if (localStorage.getItem('vade_rated')) return alert("Already rated!");
                                              modal.style.display = 'flex';
                              };
            if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
            window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

                              stars.forEach(star => {
                                              star.onclick = () => {
                                                                  selected = parseInt(star.dataset.rating);
                                                                  stars.forEach((s, i) => s.classList.toggle('fa-solid', i < selected));
                                                                  stars.forEach((s, i) => s.classList.toggle('fa-regular', i >= selected));
                                              };
                              });

                              if (submitBtn) submitBtn.onclick = async () => {
                                              if (selected === 0) return alert("Select stars!");
                                              submitBtn.innerText = "Submitting...";
                                              submitBtn.disabled = true;
                                              try {
                                                                  const { error } = await supabase.from('ratings').insert([{ rating: selected }]);
                                                                  if (!error) {
                                                                                          localStorage.setItem('vade_rated', 'true');
                                                                                          modal.style.display = 'none';
                                                                                          await fetchRatings();
                                                                                          alert("Thanks!");
                                                                  }
                                              } catch (e) { alert("Error"); submitBtn.disabled = false; submitBtn.innerText = "Submit"; }
                              };

                              fetchRatings();
});
