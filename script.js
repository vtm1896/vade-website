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
        const SUPABASE_KEY = 'sb_publishable_lsu3ZW0trrz-OXmVsjnoSA_p9XdJfvh';
        const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

                              // Database state
                              let realRatings = [];
        const seedCount = 12450;
        const seedAvg = 4.8;

                              async function fetchRatings() {
                                          updateDashboard();
                                          if (!supabase) return;
                                          try {
                                                          const { data, error } = await supabase.from('ratings').select('rating');
                                                          if (!error && data) {
                                                                              realRatings = data.map(r => r.rating);
                                                                              updateDashboard();
                                                          }
                                          } catch (e) {
                                                          console.error("Supabase fetch failed", e);
                                          }
                              }

                              function updateDashboard() {
                                          const totalCount = realRatings.length + seedCount;
                                          const realSum = realRatings.reduce((a, b) => a + b, 0);
                                          const avg = parseFloat(((realSum + (seedCount * seedAvg)) / totalCount).toFixed(1));

            const avgScoreEl = document.getElementById('avg-score');
                                          const reviewCountEl = document.getElementById('review-count');
                                          if (avgScoreEl) avgScoreEl.innerText = avg;
                                          if (reviewCountEl) reviewCountEl.innerText = `${(totalCount / 1000).toFixed(1)}K reviews`;

            const labelEl = document.getElementById('rating-label');
                                          if (labelEl) {
                                                          if (avg >= 4.8) labelEl.innerText = "Exceptional";
                                                          else if (avg >= 4.5) labelEl.innerText = "Excellent";
                                                          else if (avg >= 4.0) labelEl.innerText = "Very Good";
                                                          else if (avg >= 3.5) labelEl.innerText = "Good";
                                                          else if (avg >= 3.0) labelEl.innerText = "Fair";
                                                          else labelEl.innerText = "Poor";
                                          }

            const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                                          realRatings.forEach(r => counts[r]++);
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
                              }

                              const modal = document.getElementById('rating-modal');
        const rateBtn = document.getElementById('rate-btn');
        const closeBtn = document.querySelector('.close-modal');
        const stars = document.querySelectorAll('.modal-stars i');
        const submitBtn = document.getElementById('submit-rating');
        let selectedRating = 0;

                              if (rateBtn) {
                                          rateBtn.onclick = () => {
                                                          if (localStorage.getItem('vade_rated')) {
                                                                              alert("You've already rated Vade! Thank you.");
                                                                              return;
                                                          }
                                                          modal.style.display = 'flex';
                                          }
                              }

                              if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
        window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; }

                              stars.forEach(star => {
                                          star.onclick = () => {
                                                          selectedRating = parseInt(star.dataset.rating);
                                                          stars.forEach((s, idx) => {
                                                                              if (idx < selectedRating) s.classList.replace('fa-regular', 'fa-solid');
                                                                              else s.classList.replace('fa-solid', 'fa-regular');
                                                          });
                                          }
                              });

                              if (submitBtn) {
                                          submitBtn.onclick = async () => {
                                                          if (selectedRating === 0) return;
                                                          submitBtn.innerText = "Submitting...";
                                                          submitBtn.disabled = true;
                                                          try {
                                                                              const { error } = await supabase.from('ratings').insert([{ rating: selectedRating }]);
                                                                              if (error) throw error;
                                                                              localStorage.setItem('vade_rated', 'true');
                                                                              modal.style.display = 'none';
                                                                              realRatings.push(selectedRating);
                                                                              updateDashboard();
                                                                              alert("Rating submitted! Thank you.");
                                                          } catch (err) {
                                                                              alert("Error submitting rating.");
                                                                              submitBtn.innerText = "Submit Rating";
                                                                              submitBtn.disabled = false;
                                                          }
                                          }
                              }

                              fetchRatings();
});
