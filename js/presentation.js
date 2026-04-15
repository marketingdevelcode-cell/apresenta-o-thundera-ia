document.addEventListener('DOMContentLoaded', () => {
    
    // --- State ---
    let currentSlideIndex = 0;
    const slides = Array.from(document.querySelectorAll('.slide'));
    const totalSlides = slides.length;
    
    // --- DOM Elements ---
    const progressBar = document.getElementById('progress-bar');
    const displayCurrent = document.getElementById('current-slide');
    const displayTotal = document.getElementById('total-slides');
    
    const uiHeader = document.querySelector('.ui-header');
    
    // Map Overlay
    const mapOverlay = document.getElementById('slide-map');
    const mapGrid = document.getElementById('slide-map-grid');
    const btnMap = document.getElementById('btn-map');
    const btnCloseMap = document.getElementById('btn-close-map');
    
    // Fullscreen
    const btnFullscreen = document.getElementById('btn-fullscreen');
    
    // Navigation Hitboxes
    const prevHitbox = document.getElementById('nav-area-prev');
    const nextHitbox = document.getElementById('nav-area-next');
    
    let isMapOpen = false;

    // --- Init ---
    function init() {
        // Set total counter
        displayTotal.textContent = String(totalSlides).padStart(2, '0');
        
        // Build Map Grid iteratively
        slides.forEach((slide, idx) => {
            const title = slide.getAttribute('data-title') || `Slide ${idx + 1}`;
            
            const card = document.createElement('div');
            card.className = 'map-card';
            card.innerHTML = `
                <span class="map-num">${String(idx + 1).padStart(2, '0')}</span>
                <span class="map-title">${title}</span>
            `;
            
            card.addEventListener('click', () => {
                goToSlide(idx);
                toggleMap(false);
            });
            
            mapGrid.appendChild(card);
        });

        // Show first slide
        updateDOM();
    }

    // --- Core Navigation Logic ---
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        
        const previousIndex = currentSlideIndex;
        currentSlideIndex = index;
        
        updateDOM(previousIndex);
    }
    
    function nextSlide() {
        if (currentSlideIndex < totalSlides - 1) {
            goToSlide(currentSlideIndex + 1);
        }
    }
    
    function prevSlide() {
        if (currentSlideIndex > 0) {
            goToSlide(currentSlideIndex - 1);
        }
    }

    function updateDOM(previousIndex) {
        // 1. Update counter
        displayCurrent.textContent = String(currentSlideIndex + 1).padStart(2, '0');
        
        // 2. Update Progress Bar
        const progressPercentage = ((currentSlideIndex) / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // 3. Clear and Set Slide Classes for Animation Trigger
        slides.forEach((slide, idx) => {
            // Reset base classes
            slide.classList.remove('slide-active', 'slide-prev', 'slide-next');
            
            if (idx === currentSlideIndex) {
                slide.classList.add('slide-active');
            } else if (idx < currentSlideIndex) {
                slide.classList.add('slide-prev');
            } else {
                slide.classList.add('slide-next');
            }
        });
        
        // 4. Update Map Highlights
        const mapCards = mapGrid.querySelectorAll('.map-card');
        mapCards.forEach((card, idx) => {
            if (idx === currentSlideIndex) card.classList.add('active-map');
            else card.classList.remove('active-map');
        });
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

    // --- Fullscreen Controller ---
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Erro ao tentar fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // --- Event Listeners ---
    
    // UI Buttons
    btnMap.addEventListener('click', () => toggleMap());
    btnCloseMap.addEventListener('click', () => toggleMap(false));
    btnFullscreen.addEventListener('click', toggleFullscreen);
    
    // Hitboxes
    prevHitbox.addEventListener('click', prevSlide);
    nextHitbox.addEventListener('click', nextSlide);
    
    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        // Ignorar atalhos se estiver num input (embora n tenha)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                if(!isMapOpen) {
                    e.preventDefault();
                    nextSlide();
                }
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                if(!isMapOpen) {
                    e.preventDefault();
                    prevSlide();
                }
                break;
            case 'm':
            case 'M':
                toggleMap();
                break;
            case 'Escape':
                if(isMapOpen) toggleMap(false);
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
        }
    });

    // Run Engine
    init();
});
