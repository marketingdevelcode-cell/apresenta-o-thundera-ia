document.addEventListener('DOMContentLoaded', () => {

    // --- Master DOM References ---
    const domSlides = Array.from(document.querySelectorAll('.slide'));

    // --- Engine State ---
    let slides = [];
    let totalSlides = 0;
    let currentSlideIndex = 0;

    // --- UI Elements ---
    const progressBar = document.getElementById('progress-bar');
    const displayCurrent = document.getElementById('current-slide');
    const displayTotal = document.getElementById('total-slides');

    const uiHeader = document.querySelector('.ui-header');

    // Map Overlay
    const mapOverlay = document.getElementById('slide-map');
    const mapGrid = document.getElementById('slide-map-grid');
    const btnMap = document.getElementById('btn-map');
    const btnCloseMap = document.getElementById('btn-close-map');

    // Triggers
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnToggleEye = document.getElementById('btn-toggle-eye');
    const btnExportPdf = document.getElementById('btn-export-pdf');

    // New: Company & Study UI
    const companySelector = document.getElementById('company-selector');
    const btnStudyArea = document.getElementById('btn-study-area');
    const studyOverlay = document.getElementById('study-area-overlay');
    const btnCloseStudy = document.getElementById('btn-close-study');

    // Navigation Hitboxes
    const prevHitbox = document.getElementById('nav-area-prev');
    const nextHitbox = document.getElementById('nav-area-next');

    let isMapOpen = false;
    let isStudyOpen = false;

    // --- Init ---
    function init() {
        populateCompanySelector();
        initializeCompanyContext();
        compileSlides();
    }

    // --- Engine Compiler ---
    // Recalcula quais slides farão parte da timeline com base no modo
    function compileSlides() {
        const isPresenting = document.body.classList.contains('is-presenting');

        // Se isPresenting: filtra .hidden-slide. Senão: pega todos
        slides = domSlides.filter(s => {
            if (isPresenting && s.classList.contains('hidden-slide')) {
                // Esconde forçado para limpar o motor
                s.style.display = 'none';
                return false;
            }
            // Garante que resetou o display none de quem voltou no modo rascunho
            s.style.display = '';
            return true;
        });

        totalSlides = slides.length;

        // Tratamento de segurança se o cara tava no slide 5, ocultou ele e deu tela cheia (total virou 4)
        // Precisamos realinhar o motor para o array novo
        if (currentSlideIndex >= totalSlides) {
            currentSlideIndex = totalSlides - 1;
        }

        // Reconstrói visual e Mapa
        buildMap();
        updateDOM();
        updateEyeButton();
    }

    // --- Map Builder ---
    function buildMap() {
        mapGrid.innerHTML = '';
        displayTotal.textContent = String(totalSlides).padStart(2, '0');

        slides.forEach((slide, idx) => {
            const title = slide.getAttribute('data-title') || `Slide ${idx + 1}`;

            const card = document.createElement('div');
            card.className = 'map-card';

            // Verifica status de ocultamento
            const isHidden = slide.classList.contains('hidden-slide');
            const eyeIcon = isHidden ? 'ph-eye-closed' : 'ph-eye';
            const eyeColor = isHidden ? 'color: var(--color-danger); opacity: 1;' : 'opacity: 0.5;';

            if (isHidden) {
                card.style.opacity = '0.5';
                card.style.borderStyle = 'dashed';
            }

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                    <span class="map-num">${String(idx + 1).padStart(2, '0')}</span>
                    <button class="map-eye-btn btn-icon" style="padding: 0; font-size: 1.4rem; ${eyeColor}">
                        <i class="ph ${eyeIcon}"></i>
                    </button>
                </div>
                <span class="map-title">${title}</span>
            `;

            // Navegar para o slide ao clicar no card
            card.addEventListener('click', () => {
                goToSlide(idx);
                toggleMap(false);
            });

            // Alternar visibilidade ao clicar apenas no botão do olho
            const btnEye = card.querySelector('.map-eye-btn');
            btnEye.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que clique navegue para a página
                slide.classList.toggle('hidden-slide');
                compileSlides(); // Reconstroi o motor e o mapa instantaneamente
            });

            mapGrid.appendChild(card);
        });
    }

    // --- Actions ---

    function toggleSlideVisibility() {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;

        // Inverte estado do Dom original
        currentSlide.classList.toggle('hidden-slide');

        // Recompila (vai atualizar o botão olho e refazer o mapa visualmente)
        compileSlides();
    }

    function updateEyeButton() {
        if (!btnToggleEye) return;
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;

        if (currentSlide.classList.contains('hidden-slide')) {
            btnToggleEye.classList.add('is-hidden');
            btnToggleEye.innerHTML = '<i class="ph ph-eye-closed"></i>';
        } else {
            btnToggleEye.classList.remove('is-hidden');
            btnToggleEye.innerHTML = '<i class="ph ph-eye"></i>';
        }
    }

    // --- Core Navigation Logic ---
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;

        currentSlideIndex = index;
        updateDOM();
    }

    function nextSlide() {
        if (currentSlideIndex < totalSlides - 1) goToSlide(currentSlideIndex + 1);
    }

    function prevSlide() {
        if (currentSlideIndex > 0) goToSlide(currentSlideIndex - 1);
    }

    // --- Numerical Count Animation ---
    function animateScoreCount() {
        const scoreEl = document.getElementById('thundera-score-value');
        if (!scoreEl) return;

        const target = 88;
        const duration = 2000; // 2 seconds
        const startTime = Date.now();

        function update() {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);

            // Easing function for smoother feel (easeOutExpo)
            const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(easedProgress * target);

            scoreEl.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // --- Company Logic ---
    function populateCompanySelector() {
        if (!companySelector) return;

        companySelector.innerHTML = companyData.map(c =>
            `<option value="${c.id}">${c.empresa_nome}</option>`
        ).join('');
    }

    function initializeCompanyContext() {
        if (!companySelector) return;
        const firstId = companyData[0].id;
        updateCompanyContext(firstId);
    }

    function updateCompanyContext(id) {
        const data = companyData.find(c => c.id === id);
        if (!data) return;

        // 1. Update Slide Dashboard (Slide 2)
        const dashEmpresaNome = document.getElementById('dash-empresa-nome');
        if (dashEmpresaNome) {
            dashEmpresaNome.textContent = data.empresa_nome;
            document.getElementById('dash-decisor-nome').textContent = data.decisor_nome;
            document.getElementById('dash-decisor-tempo').textContent = data.decisor_tempo_empresa;
            document.getElementById('dash-faturamento').textContent = data.faturamento_anual;
            document.getElementById('dash-orcamento').textContent = data.orcamento_ti;
            document.getElementById('dash-percentual').textContent = data.ti_percentual_receita;
            document.getElementById('dash-setor').textContent = data.empresa_setor;
        }

        // 2. Update Study Area (Deep Dive)
        document.getElementById('study-empresa-header').textContent = data.empresa_nome;
        document.getElementById('study-setor-header').textContent = data.empresa_setor;

        const grid = document.getElementById('study-details-grid');
        grid.innerHTML = '';

        const fields = [
            { label: 'Empresa', val: data.empresa_nome },
            { label: 'Setor', val: data.empresa_setor },
            { label: 'Decisor', val: data.decisor_nome },
            { label: 'Cargo', val: data.decisor_cargo },
            { label: 'Tempo de Empresa', val: data.decisor_tempo_empresa },
            { label: 'Faturamento Anual', val: data.faturamento_anual },
            { label: 'Orçamento TI', val: data.orcamento_ti },
            { label: 'TI/Receita (%)', val: data.ti_percentual_receita },
            { label: 'Crescimento Orç.', val: data.crescimento_orcamento },
            { label: 'Nível Hierárquico', val: data.nivel_hierarquico },
            { label: 'Reporte de TI', val: data.reporte_ti },
            { label: 'Perspectiva Negócio', val: data.perspectiva_negocio },
            { label: 'Modelo Compra', val: data.modelo_compra },
            { label: 'Investimento em', val: data.trimestre_investimento },
            { label: 'Dificuldade Talentos', val: data.dificuldade_talentos },
            { label: 'Maturidade Inovação', val: data.maturidade_inovacao },
            { label: 'Temas sem Fornecedor', val: data.temas_sem_fornecedor },
            { label: 'Top 6 Desafios', val: data.desafios_top6.join(', ') }
        ];

        fields.forEach(f => {
            const item = document.createElement('div');
            item.className = 'study-item'; // Removed anim-fade-in to ensure visibility
            item.innerHTML = `
                <span class="study-label">${f.label}</span>
                <span class="study-value">${f.val || 'Não informado'}</span>
            `;
            grid.appendChild(item);
        });
    }

    function toggleStudyArea(forceState) {
        isStudyOpen = forceState !== undefined ? forceState : !isStudyOpen;
        if (isStudyOpen) {
            studyOverlay.classList.remove('hidden');
            studyOverlay.classList.add('active');
        } else {
            studyOverlay.classList.remove('active');
            setTimeout(() => {
                if (!isStudyOpen) studyOverlay.classList.add('hidden');
            }, 400);
        }
    }

    function updateDOM() {
        // 1. Update counter
        displayCurrent.textContent = String(currentSlideIndex + 1).padStart(2, '0');

        // 2. Update Progress Bar
        const progressPercentage = totalSlides > 1 ? (currentSlideIndex / (totalSlides - 1)) * 100 : 100;
        progressBar.style.width = `${progressPercentage}%`;

        // 3. Limpa todas as classes do DOM principal para segurança
        domSlides.forEach(s => s.classList.remove('slide-active', 'slide-prev', 'slide-next'));

        // 4. E aplica a logica de profundidade APENAS nos slides ativos do Array processado
        slides.forEach((slide, idx) => {
            if (idx === currentSlideIndex) {
                slide.classList.add('slide-active');

                // Trigger Slide 10 (Score) specific animation
                if (slide.id === 'slide-10') {
                    animateScoreCount();
                }
            } else if (idx < currentSlideIndex) {
                slide.classList.add('slide-prev');
            } else {
                slide.classList.add('slide-next');
            }
        });

        // 5. Update Map Highlights
        const mapCards = mapGrid.querySelectorAll('.map-card');
        mapCards.forEach((card, idx) => {
            if (idx === currentSlideIndex) card.classList.add('active-map');
            else card.classList.remove('active-map');
        });

        // 6. Hook pro olho acompanhar quando mudamos
        updateEyeButton();
    }

    function updateStorytellingTheme(progress) {
        // Queremos ir de Preto (L=4%) -> Cinza Metálico (L=45%, S=12%) -> Off-white/Cinza Claro (L=94%, S=10%)
        const h = 215; // Tom azulado muito leve para dar o aspecto "Metálico" ao invés de "Barro/Sujo"

        // Saturation fixa num tom elegante neutro
        const s = 12;

        // Aplica uma curva exponencial (Cúbica) no progresso para que ele demore a acelerar
        // Isso mantém a apresentação bem escura até os 70% finais da trajetória, onde a claridade explode
        const easedProgress = Math.pow(progress, 3);

        // Lightness sobe suavemente seguindo a curva
        const l = 4 + (easedProgress * 90);

        document.documentElement.style.setProperty('--bg-dynamic', `hsl(${h}, ${s}%, ${l}%)`);

        // Context Alpha (Para desvanecer hardcoded-bgs à medida que a luz acende)
        document.documentElement.style.setProperty('--context-dark-alpha', (1 - progress) * 0.95);

        // Limitador de Legibilidade (Swap Mode)
        // Se a cruzarmos ~65% de Lightness da cor do fundo, ativamos o tema Light (Texto escuro)
        if (l >= 65) {
            document.body.classList.add('theme-light');
        } else {
            document.body.classList.remove('theme-light');
        }
    }

    // --- Overlay Map Controller ---
    function toggleMap(forceState) {
        isMapOpen = forceState !== undefined ? forceState : !isMapOpen;

        if (isMapOpen) {
            mapOverlay.classList.add('active');
            uiHeader.style.opacity = '0';
        } else {
            mapOverlay.classList.remove('active');
            uiHeader.style.opacity = '';
        }
    }

    // --- Fullscreen Engine ---
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Erro ao tentar fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Listener Global de Tela Cheia (Muda o estado IS-PRESENTING puro)
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            document.body.classList.add('is-presenting');
        } else {
            document.body.classList.remove('is-presenting');
        }
        // Sempre que o modo mudar, recompilar tudo com o array novo/limpo
        compileSlides();
    });

    // --- Event Listeners ---

    // UI Buttons
    if (btnToggleEye) btnToggleEye.addEventListener('click', toggleSlideVisibility);
    btnMap.addEventListener('click', () => toggleMap());
    btnCloseMap.addEventListener('click', () => toggleMap(false));
    btnFullscreen.addEventListener('click', toggleFullscreen);
    if (btnExportPdf) btnExportPdf.addEventListener('click', exportToPDF);

    // Company UI Listeners
    if (companySelector) {
        companySelector.addEventListener('change', (e) => {
            updateCompanyContext(e.target.value);
        });
    }

    if (btnStudyArea) btnStudyArea.addEventListener('click', () => toggleStudyArea());
    if (btnCloseStudy) btnCloseStudy.addEventListener('click', () => toggleStudyArea(false));

    // Hitboxes
    prevHitbox.addEventListener('click', prevSlide);
    nextHitbox.addEventListener('click', nextSlide);

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                if (!isMapOpen) {
                    e.preventDefault();
                    nextSlide();
                }
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                if (!isMapOpen) {
                    e.preventDefault();
                    prevSlide();
                }
                break;
            case 'm':
            case 'M':
                toggleMap();
                break;
            case 'a':
            case 'A':
                toggleStudyArea();
                break;
            case 'o':
            case 'O':
                // Atalho pra habilitar "Oculto" via teclado
                if (!isMapOpen && !document.fullscreenElement) toggleSlideVisibility();
                break;
            case 'Escape':
                if (isMapOpen) toggleMap(false);
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
            case 'p':
            case 'P':
                exportToPDF();
                break;
        }
    });

    // --- PDF Export ---
    async function exportToPDF() {
        const activeSlides = domSlides.filter(s => !s.classList.contains('hidden-slide'));
        if (activeSlides.length === 0) {
            alert('Nenhum slide visível para exportar.');
            return;
        }

        // Feedback visual
        const originalHtml = btnExportPdf.innerHTML;
        btnExportPdf.innerHTML = '<i class="ph ph-circle-notch anim-spin"></i>';

        // Bloqueio de tela e indicador de progresso
        const loader = document.createElement('div');
        loader.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; font-family:sans-serif; backdrop-filter:blur(15px);";
        loader.innerHTML = `
            <div style="font-size:3.5rem; margin-bottom:1.5rem; color:#FFCA28;"><i class="ph ph-circle-notch anim-spin"></i></div>
            <div style="font-size:1.8rem; font-weight:bold; letter-spacing:2px; margin-bottom:0.5rem;">CONSOLIDANDO PDF</div>
            <div id="pdf-progress-text" style="font-size:1.2rem; color:#FFCA28; font-weight:bold; margin-bottom:1.5rem;">0%</div>
            
            <div style="width:300px; height:6px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden; margin-bottom:1.5rem;">
                <div id="pdf-progress-bar" style="width:0%; height:100%; background:#FFCA28; transition:width 0.3s ease;"></div>
            </div>

            <div id="pdf-status-detail" style="opacity:0.6; font-size:0.9rem;">Preparando slides...</div>
        `;
        document.body.appendChild(loader);

        const progressText = loader.querySelector('#pdf-progress-text');
        const progressBarEl = loader.querySelector('#pdf-progress-bar');
        const statusDetail = loader.querySelector('#pdf-status-detail');

        // Salva o estado atual para restaurar depois
        const savedIndex = currentSlideIndex;

        // Helper: aguarda 2 frames de animação + delay em ms
        // Garante que o browser pintou antes da captura
        function waitForPaint(ms = 400) {
            return new Promise(resolve => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setTimeout(resolve, ms);
                    });
                });
            });
        }

        // Inicializa o documento PDF (Landscape, px, 16:9)
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'px', [1280, 720]);

        try {
            for (let i = 0; i < activeSlides.length; i++) {
                const targetSlide = activeSlides[i];

                // Atualiza o progresso
                const percent = Math.round((i / activeSlides.length) * 100);
                progressText.textContent = `${percent}%`;
                progressBarEl.style.width = `${percent}%`;
                statusDetail.textContent = `Renderizando slide ${i + 1} de ${activeSlides.length}...`;

                // 1. Navega para o slide no DOM real para que o browser renderize
                //    com todas as classes CSS, unidades cqw/cqh e imagens corretas
                const compiledIdx = slides.indexOf(targetSlide);
                if (compiledIdx !== -1) {
                    goToSlide(compiledIdx);
                } else {
                    // Forçar ativação de slide oculto temporariamente
                    domSlides.forEach(s => s.classList.remove('slide-active', 'slide-prev', 'slide-next'));
                    targetSlide.classList.add('slide-active');
                    targetSlide.style.display = '';
                }

                // 2. Aguarda o browser pintar completamente:
                //    transitions CSS (~300ms) + imagens carregando + 2 frames extras
                await waitForPaint(500);

                // 3. Captura diretamente o elemento slide do DOM real
                try {
                    const rect = targetSlide.getBoundingClientRect();

                    const capturePromise = html2canvas(targetSlide, {
                        scale: 1.5,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#050505',
                        logging: false,
                        width: rect.width || 1280,
                        height: rect.height || 720,
                        scrollX: -window.scrollX,
                        scrollY: -window.scrollY,
                        windowWidth: document.documentElement.scrollWidth,
                        windowHeight: document.documentElement.scrollHeight,
                        ignoreElements: (el) => {
                            // Ignora elementos da UI que não fazem parte do slide
                            return el === loader ||
                                el.classList.contains('ui-header') ||
                                el.classList.contains('progress-bar-container') ||
                                el.id === 'slide-map' ||
                                el.id === 'study-area-overlay' ||
                                el.id === 'nav-area-prev' ||
                                el.id === 'nav-area-next';
                        }
                    });

                    // Timeout de 20 segundos por slide
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Tempo limite excedido')), 20000)
                    );

                    const canvas = await Promise.race([capturePromise, timeoutPromise]);
                    const imgData = canvas.toDataURL('image/jpeg', 0.92);

                    if (i > 0) pdf.addPage([1280, 720], 'l');
                    pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720, undefined, 'FAST');

                    console.log(`[PDF] Slide ${i + 1} capturado com sucesso.`);
                } catch (slideError) {
                    console.error(`[PDF] Erro no slide ${i + 1}:`, slideError);
                    if (i > 0) pdf.addPage([1280, 720], 'l');
                    pdf.setFillColor(10, 10, 15);
                    pdf.rect(0, 0, 1280, 720, 'F');
                    pdf.setTextColor(150, 150, 150);
                    pdf.setFontSize(20);
                    pdf.text(`Slide ${i + 1}: Erro de Renderização (${slideError.message})`, 100, 360);
                }
            }

            // Finaliza progresso
            progressText.textContent = '100%';
            progressBarEl.style.width = '100%';
            statusDetail.textContent = 'Gerando arquivo PDF...';
            await waitForPaint(200);

            // Salva o PDF
            pdf.save('Apresentacao_Thundera_IA.pdf');
        } catch (err) {
            console.error('Erro Fatal no PDF:', err);
            alert('Erro crítico ao gerar PDF: ' + err.message);
        } finally {
            // Restaura o slide que o usuário estava visualizando antes da exportação
            goToSlide(savedIndex);
            document.body.removeChild(loader);
            btnExportPdf.innerHTML = originalHtml;
        }
    }

    // Subida Tática
    init();
});
