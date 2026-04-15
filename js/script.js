document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Color Cards: Copy to Clipboard Functionality
    const colorCards = document.querySelectorAll('.color-card');
    
    colorCards.forEach(card => {
        card.addEventListener('click', () => {
            const hex = card.getAttribute('data-hex');
            
            navigator.clipboard.writeText(hex).then(() => {
                // Feedback visual de sucesso
                const info = card.querySelector('.color-info');
                const origHtml = info.innerHTML;
                
                info.innerHTML = `
                    <span class="color-name" style="color: var(--color-primary);">Copiado!</span> 
                    <span class="color-hex">${hex}</span>
                `;
                
                setTimeout(() => {
                    info.innerHTML = origHtml;
                }, 1500);
            }).catch(err => {
                console.error('Falha ao copiar cor: ', err);
            });
        });
    });

    // 2. Glass Cards: Dynamic Mouse Tracking Glow
    const glassCards = document.querySelectorAll('.glass-card');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Passa as coordenadas X e Y como variáveis CSS
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 3. Assets/Icon Cards: Copy to Clipboard Functionality
    const assetItems = document.querySelectorAll('.asset-item');

    assetItems.forEach(item => {
        item.addEventListener('click', () => {
            // we will copy the class logic
            const iconElement = item.querySelector('i');
            const classList = iconElement.className;
            
            // Ex: "ph ph-radar"
            const iconName = classList.split(' ').find(cls => cls.startsWith('ph-') && cls !== 'ph');

            if(iconName) {
                const markup = `<i class="ph ${iconName}"></i>`;
                
                navigator.clipboard.writeText(markup).then(() => {
                    const span = item.querySelector('span');
                    const origText = span.textContent;
                    
                    span.style.color = 'var(--color-primary)';
                    span.textContent = 'Copiado!';
                    
                    setTimeout(() => {
                        span.style.color = '';
                        span.textContent = origText;
                    }, 1500);
                });
            }
        });
    });

    // 4. Smooth Scrolling for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
