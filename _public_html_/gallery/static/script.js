/**
 * Art Lovers Hub - Interactive Functionality
 * ES6+ JavaScript for enhanced user experience
 */

class ArtLoversHub {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupLazyLoading();
        this.setupKeyboardNavigation();
        this.setupImageErrorHandling();
        this.setupPerformanceOptimizations();
        this.setupImageModal();
        this.setupShowMore();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Grid item click handlers
        document.querySelectorAll('.grid-item').forEach(item => {
            item.addEventListener('click', this.handleGridItemClick.bind(this));
            item.addEventListener('keydown', this.handleGridItemKeydown.bind(this));
        });

        // Pagination smooth scroll
        document.querySelectorAll('.pagination .page-link').forEach(link => {
            link.addEventListener('click', this.handlePaginationClick.bind(this));
        });

        // Window resize handler for responsive adjustments
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));

        // Touch/swipe support for mobile
        if ('ontouchstart' in window) {
            this.setupTouchSupport();
        }
    }

    /**
     * Handle grid item clicks - open image modal
     */
    handleGridItemClick(event) {
        const item = event.currentTarget;
        const imageElement = item.querySelector('.grid-item__image');
        
        if (imageElement) {
            // Add click animation
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = '';
            }, 150);

            // Open image in modal
            const caption = item.dataset.caption || '';
            this.openImageModal(imageElement.src, imageElement.alt, caption);
        }
    }

    /**
     * Handle keyboard navigation on grid items
     */
    handleGridItemKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleGridItemClick(event);
        }
    }

    /**
     * Handle pagination clicks with smooth scroll
     */
    handlePaginationClick(event) {
        // Smooth scroll to top when pagination is clicked
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Add loading state
        const link = event.currentTarget;
        const originalText = link.textContent;
        
        if (!link.getAttribute('aria-label')) {
            link.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
            
            // Remove loading state after a short delay (page will reload anyway)
            setTimeout(() => {
                link.textContent = originalText;
            }, 500);
        }
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            document.querySelectorAll('.grid-item__image').forEach(img => {
                if (img.dataset.src) {
                    imageObserver.observe(img);
                }
            });
        }
    }

    /**
     * Load image with error handling
     */
    loadImage(img) {
        const src = img.dataset.src || img.src;
        
        return new Promise((resolve, reject) => {
            const tempImg = new Image();
            
            tempImg.onload = () => {
                img.src = src;
                img.classList.add('loaded');
                resolve(img);
            };
            
            tempImg.onerror = () => {
                this.handleImageError(img);
                reject(new Error(`Failed to load image: ${src}`));
            };
            
            tempImg.src = src;
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            // Arrow key navigation
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                this.handleArrowKeyNavigation(event);
            }
            
            // Page navigation shortcuts
            if (event.key === 'Home') {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (event.key === 'End') {
                event.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        });
    }

    /**
     * Handle arrow key navigation between grid items
     */
    handleArrowKeyNavigation(event) {
        const focusedElement = document.activeElement;
        const gridItems = Array.from(document.querySelectorAll('.grid-item'));
        
        if (!gridItems.includes(focusedElement)) return;
        
        event.preventDefault();
        
        const currentIndex = gridItems.indexOf(focusedElement);
        let targetIndex;
        
        switch (event.key) {
            case 'ArrowLeft':
                targetIndex = currentIndex > 0 ? currentIndex - 1 : gridItems.length - 1;
                break;
            case 'ArrowRight':
                targetIndex = currentIndex < gridItems.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
                targetIndex = currentIndex >= 3 ? currentIndex - 3 : currentIndex;
                break;
            case 'ArrowDown':
                targetIndex = currentIndex < gridItems.length - 3 ? currentIndex + 3 : currentIndex;
                break;
        }
        
        if (targetIndex !== undefined && gridItems[targetIndex]) {
            gridItems[targetIndex].focus();
        }
    }

    /**
     * Setup image error handling
     */
    setupImageErrorHandling() {
        document.querySelectorAll('.grid-item__image').forEach(img => {
            img.addEventListener('error', () => this.handleImageError(img));
        });
    }

    /**
     * Handle image loading errors
     */
    handleImageError(img) {
        const wrapper = img.closest('.grid-item__wrapper');
        
        if (wrapper && !wrapper.querySelector('.error-placeholder')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-placeholder d-flex align-items-center justify-content-center h-100';
            errorDiv.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <div>Image unavailable</div>
                </div>
            `;
            
            wrapper.appendChild(errorDiv);
            img.style.display = 'none';
        }
    }

    /**
     * Setup touch/swipe support for mobile
     */
    setupTouchSupport() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (event) => {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (event) => {
            if (!startX || !startY) return;
            
            const endX = event.changedTouches[0].clientX;
            const endY = event.changedTouches[0].clientY;
            
            const deltaX = startX - endX;
            const deltaY = startY - endY;
            
            // Horizontal swipe detection
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Swipe left - next page
                    this.navigateToNextPage();
                } else {
                    // Swipe right - previous page
                    this.navigateToPreviousPage();
                }
            }
            
            startX = 0;
            startY = 0;
        }, { passive: true });
    }

    /**
     * Navigate to next page
     */
    navigateToNextPage() {
        const nextButton = document.querySelector('.pagination .page-item:last-child .page-link[aria-label="Next"]');
        if (nextButton) {
            nextButton.click();
        }
    }

    /**
     * Navigate to previous page
     */
    navigateToPreviousPage() {
        const prevButton = document.querySelector('.pagination .page-item:first-child .page-link[aria-label="Previous"]');
        if (prevButton) {
            prevButton.click();
        }
    }

    /**
     * Setup image modal functionality
     */
    setupImageModal() {
        this.modal = document.getElementById('imageModal');
        this.modalImage = this.modal.querySelector('.image-modal__image');
        this.modalCaption = this.modal.querySelector('.image-modal__caption');
        this.modalClose = this.modal.querySelector('.image-modal__close');
        this.modalBackdrop = this.modal.querySelector('.image-modal__backdrop');
        this.fullscreenBtn = this.modal.querySelector('.image-modal__fullscreen');
        
        // Initialize fullscreen state
        this.isFullscreen = false;

        // Close modal events
        this.modalClose.addEventListener('click', () => this.closeImageModal());
        this.modalBackdrop.addEventListener('click', () => this.closeImageModal());
        
        // Fullscreen toggle
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Keyboard navigation (Escape to close, F for fullscreen)
        document.addEventListener('keydown', (event) => {
            if (this.modal.classList.contains('show')) {
                if (event.key === 'Escape') {
                    if (this.isFullscreen) {
                        this.exitFullscreen();
                    } else {
                        this.closeImageModal();
                    }
                } else if (event.key === 'f' || event.key === 'F') {
                    this.toggleFullscreen();
                }
            }
        });
        
        // Listen for fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    /**
     * Enter fullscreen mode
     */
    enterFullscreen() {
        const elem = this.modal;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        
        this.isFullscreen = true;
        this.modal.classList.add('fullscreen');
        this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    }
    
    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        this.isFullscreen = false;
        this.modal.classList.remove('fullscreen');
        this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
    
    /**
     * Handle fullscreen change events
     */
    handleFullscreenChange() {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && 
            !document.msFullscreenElement) {
            // Not in fullscreen
            this.isFullscreen = false;
            this.modal.classList.remove('fullscreen');
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }


    /**
     * Open image modal (legacy method for compatibility)
     */
    openImageModal(imageSrc, imageAlt, caption) {
        // Reset fullscreen state
        this.isFullscreen = false;
        this.modal.classList.remove('fullscreen');
        this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        
        this.modalImage.src = imageSrc;
        this.modalImage.alt = imageAlt;
        
        // Only show caption if there's actual content
        if (caption && caption.trim()) {
            this.modalCaption.textContent = caption;
            this.modalCaption.style.display = 'block';
        } else {
            this.modalCaption.style.display = 'none';
        }
        
        // Show modal
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Trigger animation
        setTimeout(() => {
            this.modal.classList.add('show');
        }, 10);
    }

    /**
     * Close image modal
     */
    closeImageModal() {
        // Exit fullscreen if active
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Hide modal after animation
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.modalImage.src = '';
        }, 300);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Recalculate any dynamic layouts if needed
        console.log('Window resized');
    }

    /**
     * Setup performance optimizations
     */
    setupPerformanceOptimizations() {
        // Preload next page if available
        const nextPageLink = document.querySelector('.pagination .page-link[aria-label="Next"]');
        if (nextPageLink) {
            const nextPageUrl = nextPageLink.href;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = nextPageUrl;
            document.head.appendChild(link);
        }
    }

    /**
     * Setup Show More functionality
     */
    setupShowMore() {
        const showMoreBtn = document.getElementById('showMoreBtn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', this.handleShowMore.bind(this));
        }
    }

    /**
     * Handle Show More button click
     */
    handleShowMore(event) {
        const btn = event.target;
        const nextPage = parseInt(btn.dataset.nextPage);
        const group = btn.dataset.group;

        const url = new URL(window.location);
        url.searchParams.set('page', nextPage);

        if (group) {
            url.searchParams.set('g', group);
        } else {
            url.searchParams.delete('g');
        }
        
        window.location.href = url.toString();
    }


    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ArtLoversHub();
});

// Add some global utilities
window.ArtLoversHub = {
    // Utility to scroll to top
    scrollToTop: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // Utility to go to specific page
    goToPage: (pageNumber) => {
        const url = new URL(window.location);
        url.searchParams.set('page', pageNumber);
        window.location.href = url.toString();
    }
}; 