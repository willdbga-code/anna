document.addEventListener("DOMContentLoaded", () => {
    
    // --- CUSTOM CURSOR ---
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        window.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.15,
                ease: 'power2.out'
            });
        });

        // Magnetic hover effects
        const bindHover = () => {
            const hoverTargets = document.querySelectorAll('button, a, .tab-btn, .package-card, label, .masonry-item img');
            hoverTargets.forEach(target => {
                target.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                target.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });
        };
        bindHover();
        
        // Re-bind on click for potential new DOM elements like lightbox
        document.addEventListener('click', () => setTimeout(bindHover, 100));
    }

    // --- 1. GSAP PRELOADER & INITIAL ANIMATION ---
    const preloader = document.getElementById('preloader');
    
    // Preloader Timeline
    const tl = gsap.timeline({
        onComplete: () => {
            if (preloader) preloader.style.display = 'none';
            triggerReveals();
        }
    });

    // Mask Text Reveal
    tl.to('.loader-title', {
        y: '0%',
        duration: 2,
        ease: 'power4.inOut',
        delay: 0.2
    })
    .to('.preloader-tagline', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
    }, "-=0.8")
    .to(preloader, {
        opacity: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        delay: 0.5
    });

    // --- 2. DATE PICKERS INIT ---
    flatpickr(".date-picker", { 
        locale: "pt", dateFormat: "d/m/Y", minDate: "today", 
        disableMobile: "true", monthSelectorType: "static" 
    });

    // --- 3. SCROLL REVEAL (GSAP SCROLLTRIGGER) ---
    gsap.registerPlugin(ScrollTrigger);
    let stInstances = [];

    function triggerReveals() {
        // Kill old instances
        stInstances.forEach(st => st.kill());
        stInstances = [];

        // Select all fade-in elements that are visible in the layout
        const allFadeEls = Array.from(document.querySelectorAll('.fade-in-up'));
        const elements = allFadeEls.filter(el => !el.closest('.hidden'));
        
        elements.forEach(el => {
            gsap.set(el, { opacity: 0, y: 40 });
            
            let delayTime = 0;
            if (el.classList.contains('delay-1')) delayTime = 0.1;
            if (el.classList.contains('delay-2')) delayTime = 0.2;
            if (el.classList.contains('delay-3')) delayTime = 0.3;
            if (el.classList.contains('delay-4')) delayTime = 0.4;
            if (el.classList.contains('delay-5')) delayTime = 0.5;

            const st = ScrollTrigger.create({
                trigger: el,
                start: "top 95%",
                onEnter: () => {
                    gsap.to(el, { opacity: 1, y: 0, duration: 1.2, delay: delayTime, ease: "power3.out" });
                },
                once: true
            });
            stInstances.push(st);
        });
    }

    // --- STATE MANAGEMENT ---
    let currentTab = 'social';
    let selections = {
        social: {
            makeType: null, // 'social' | 'civil'
            makePrice: 0,
            makeName: '',
            hairPrice: 0,
            hairName: 'Sem Penteado',
            hairLengthPrice: 0,
            hairLengthName: 'Curto/Médio',
            externo: false
        },
        noivas: {
            packageId: null,
            packagePrice: 0,
            packageName: '',
            madrinhas: 0,
            externo: false
        },
        debutantes: {
            packageId: null,
            packagePrice: 0,
            packageName: '',
            teste: false
        },
        cursos: {
            packageId: null,
            packagePrice: 0,
            packageName: ''
        }
    };

    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-content');
    const body = document.body;
    const tabIndicator = document.querySelector('.tab-indicator');

    function updateTabIndicator(activeTab) {
        if (!tabIndicator || !activeTab) return;
        tabIndicator.style.width = activeTab.offsetWidth + 'px';
        tabIndicator.style.left = activeTab.offsetLeft + 'px';
    }

    // Set initial position
    setTimeout(() => updateTabIndicator(document.querySelector('.tab-btn.active')), 100);
    window.addEventListener('resize', () => updateTabIndicator(document.querySelector('.tab-btn.active')));

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            
            // UI Update
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateTabIndicator(tab);
            
            sections.forEach(s => s.classList.add('hidden'));
            const activeSection = document.getElementById(`tab-${target}`);
            activeSection.classList.remove('hidden');

            // Restart GSAP Reveals on new section
            setTimeout(() => {
                triggerReveals();
            }, 50);

            // Theme Change
            body.className = `theme-${target}`;
            currentTab = target;

            if (target === 'portfolio' && !document.getElementById('portfolio-container').hasAttribute('data-loaded')) {
                loadPortfolio();
            }

            updateFooter();
        });
    });

    function loadPortfolio() {
        const container = document.getElementById('portfolio-container');
        try {
            // Check if FOTOS_DATA exists (loaded via script tag in index.html)
            const data = typeof FOTOS_DATA !== 'undefined' ? FOTOS_DATA : [];
            
            container.innerHTML = ''; // Clear loading state
            
            if (data.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:#888;">Nenhuma foto encontrada no portfólio.</p>';
                return;
            }

            data.forEach((foto, i) => {
                const item = document.createElement('div');
                item.className = 'masonry-item';
                
                const img = document.createElement('img');
                img.src = foto.src;
                img.alt = foto.alt || "Portfolio Image";
                img.loading = "lazy";
                img.style.cursor = "zoom-in";
                
                img.addEventListener('click', () => {
                    const lightbox = document.getElementById('lightbox');
                    const lbImg = document.getElementById('lightbox-img');
                    if(lightbox && lbImg) {
                        lbImg.src = foto.src;
                        lightbox.classList.add('show');
                    }
                });
                
                item.appendChild(img);
                container.appendChild(item);
            });
            
            container.setAttribute('data-loaded', 'true');
        } catch (error) {
            console.error("Erro ao carregar portfolio:", error);
            container.innerHTML = '<p style="text-align:center; color:#888;">Erro ao carregar fotos. Tente rodar o arquivo "Atualizar Portfolio.bat".</p>';
        }
    }

    // Lightbox close logic
    const lightboxElem = document.getElementById('lightbox');
    const lbClose = document.querySelector('.lightbox-close');
    if (lightboxElem && lbClose) {
        const closeLB = () => lightboxElem.classList.remove('show');
        lbClose.addEventListener('click', closeLB);
        lightboxElem.addEventListener('click', (e) => {
            if(e.target === lightboxElem) closeLB(); // fechar se clicar fora da imagem
        });
    }

    // --- 5. PACKAGE CARDS BEHAVIOR ---
    const cards = document.querySelectorAll('.package-card');

    cards.forEach(card => {
        // Skip styling/extras cards
        if (card.id === 'card-penteado') return;

        card.addEventListener('click', (e) => {
            // Prevent triggering if clicking inside the details (like lists)
            if(e.target.closest('.card-details')) return;

            const groupId = card.dataset.group || 'social'; // Using group to know which tab logic applies
            const id = card.dataset.id;
            const price = parseInt(card.dataset.price || (id === 'social' ? 150 : (id === 'formandas' ? 175 : 200)));
            const name = card.querySelector('.card-name').textContent.trim();

            const isSelected = card.classList.contains('selected');

            // Find siblings in the same section to unselect
            const section = card.closest('section');
            section.querySelectorAll('.package-card:not(.styling-card)').forEach(c => c.classList.remove('selected'));

            if (!isSelected) {
                card.classList.add('selected');
                
                // Update specific state
                if(currentTab === 'social') {
                    selections.social.makeType = id;
                    selections.social.makePrice = price;
                    selections.social.makeName = name;
                } else if(currentTab === 'noivas') {
                    selections.noivas.packageId = id;
                    selections.noivas.packagePrice = price;
                    selections.noivas.packageName = name;
                    document.getElementById('extras-area-noiva').style.display = 'block';
                } else if(currentTab === '15anos') {
                    selections.debutantes.packageId = id;
                    selections.debutantes.packagePrice = price;
                    selections.debutantes.packageName = name;
                    document.getElementById('extras-area-debutante').style.display = 'block';
                } else if(currentTab === 'cursos') {
                    selections.cursos.packageId = id;
                    selections.cursos.packagePrice = price;
                    selections.cursos.packageName = name;
                }
            } else {
                // Deselecting
                if(currentTab === 'social') selections.social.makePrice = 0;
                else if(currentTab === 'noivas') { 
                    selections.noivas.packagePrice = 0; 
                    document.getElementById('extras-area-noiva').style.display = 'none';
                }
                else if(currentTab === '15anos') { 
                    selections.debutantes.packagePrice = 0;
                    document.getElementById('extras-area-debutante').style.display = 'none';
                }
                else if(currentTab === 'cursos') selections.cursos.packagePrice = 0;
            }

            updateFooter();
            setTimeout(() => { if(!isSelected) card.scrollIntoView({behavior: "smooth", block: "center"}); }, 300);
        });
    });

    // --- 6. EXTRAS & INPUTS LOGIC ---
    // Social Hair
    const hairRadios = document.getElementsByName('hairType');

    hairRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const val = parseInt(radio.value);
            selections.social.hairPrice = val;
            selections.social.hairName = radio.nextElementSibling.nextElementSibling.textContent;
            selections.social.hairLengthPrice = 0; // Length disabled
            updateFooter();
        });
    });

    document.getElementById('s_externo').addEventListener('change', (e) => { 
        selections.social.externo = e.target.checked; 
        updateFooter(); 
    });

    // Noivas Extras
    const madrinhasSlider = document.getElementById('n_madrinhas');
    const madrinhasDisplay = document.getElementById('madrinhas-display');
    madrinhasSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        madrinhasDisplay.innerText = val;
        selections.noivas.madrinhas = val;
        updateFooter();
    });
    document.getElementById('n_externo').addEventListener('change', (e) => { selections.noivas.externo = e.target.checked; updateFooter(); });

    // Debutantes Extras
    document.getElementById('d_teste').addEventListener('change', (e) => { selections.debutantes.teste = e.target.checked; updateFooter(); });


    // --- 7. PRICE CALCULATIONS & FOOTER ---
    const stickyFooter = document.getElementById('sticky-footer');
    const totalDisplay = document.getElementById('total-display');
    const promoAlert = document.getElementById('combo-alert');

    function updateFooter() {
        let total = 0;
        promoAlert.style.opacity = 0; // reset promo text
        
        if (currentTab === 'social') {
            total += selections.social.makePrice;
            total += selections.social.hairPrice + selections.social.hairLengthPrice;
        } 
        else if (currentTab === 'noivas') {
            total += selections.noivas.packagePrice;
            if(total > 0) total += (selections.noivas.madrinhas * 290);
        }
        else if (currentTab === '15anos') {
            total += selections.debutantes.packagePrice;
            if(total > 0 && selections.debutantes.teste) total += 150;
        }
        else if (currentTab === 'cursos') {
            total += selections.cursos.packagePrice;
        }

        totalDisplay.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        if (total > 0) {
            stickyFooter.classList.add('visible');
        } else {
            stickyFooter.classList.remove('visible');
        }
    }


    // --- 8. WHATSAPP CHECKOUT ---
    const btnAgendar = document.getElementById('btn-agendar');
    
    btnAgendar.addEventListener('click', () => {
        const phone = "5512992236440"; 
        let msg = "";
        let name = "";
        const totalVal = totalDisplay.innerText;

        btnAgendar.classList.add('sending');
        btnAgendar.querySelector('.btn-text').innerText = "ENVIANDO";

        setTimeout(() => {
            if (currentTab === 'cursos') {
                name = document.getElementById('c_nome').value;
                if (!name) { alert("Por favor, preencha seu nome"); resetBtn(); return; }
                msg = `Olá Anna! Tenho interesse no curso de maquiagem.%0A%0A🌿 *Formato:* ${selections.cursos.packageName}%0A👩 *Aluna:* ${name}%0A💰 *Investimento:* ${totalVal}`;
            } 
            else if (currentTab === 'noivas') {
                name = document.getElementById('n_nome').value;
                if (!name) { alert("Por favor, preencha o seu nome"); resetBtn(); return; }
                let dateVal = document.getElementById('n_data').value || "A definir";
                let timeVal = document.getElementById('n_hora').value;
                
                msg = `Olá Anna! Sou a Noiva *${name}*.%0A%0A🗓 *Data:* ${dateVal} às ${timeVal}%0A💍 *Coleção:* ${selections.noivas.packageName}%0A`;
                if (selections.noivas.madrinhas > 0) msg += `👯‍♀️ *Madrinhas:* ${selections.noivas.madrinhas}%0A`;
                if (selections.noivas.externo) msg += `📍 *Local:* Atendimento Externo%0A`;
                msg += `%0A💰 *Estimativa:* ${totalVal}`;
            } 
            else if (currentTab === '15anos') {
                name = document.getElementById('d_nome').value;
                if (!name) { alert("Por favor, preencha o nome da Debutante"); resetBtn(); return; }
                let dateVal = document.getElementById('d_data').value || "A definir";
                let timeVal = document.getElementById('d_hora').value;
                
                msg = `Olá Anna! Gostaria de um orçamento para Debutante (15 Anos).%0A%0A👑 *Debutante:* ${name}%0A🗓 *Data:* ${dateVal} às ${timeVal}%0A✨ *Pacote:* ${selections.debutantes.packageName}%0A`;
                if (selections.debutantes.teste) msg += `💄 *Adicional:* Incluir Teste de Make/Penteado%0A`;
                msg += `%0A💰 *Estimativa:* ${totalVal}`;
            }
            else if (currentTab === 'social') {
                name = document.getElementById('s_nome').value;
                if (!name) { alert("Por favor, preencha seu nome"); resetBtn(); return; }
                let dateVal = document.getElementById('s_data').value || "A definir";
                let timeVal = document.getElementById('s_hora').value;
                
                msg = `Oi Anna! Gostaria de agendar uma produção.%0A%0A👩 *Nome:* ${name}%0A🗓 *Data:* ${dateVal} às ${timeVal}%0A%0A✨ *Serviços Selecionados:*%0A`;
                
                if(selections.social.makePrice > 0) msg += `• ${selections.social.makeName}%0A`;
                if(selections.social.hairPrice > 0) {
                    msg += `• Penteado: ${selections.social.hairName}%0A`;
                }
                if(selections.social.externo) msg += `📍 *Local:* Atendimento Externo%0A`;
                
                msg += `%0A💰 *Total Estimado:* ${totalVal}`;
            }

            window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
            resetBtn();
        }, 800);
    });

    function resetBtn() {
        btnAgendar.classList.remove('sending');
        btnAgendar.querySelector('.btn-text').innerText = "AGENDAR NO WHATSAPP";
    }

});
