/* ============================================
   FITNIX BUNDLE PAGE JAVASCRIPT
   Handles step navigation, card selection, cart operations
   ============================================ */

(function() {
  'use strict';

  // State management
  const state = {
    currentStep: 'step-1',
    selectedBundle: null,
    selectedPath: null,
    selectedAccessories: [],
    currentKitVariantId: null
  };

  // DOM Elements
  let elements = {};

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheElements();
    setupBundleSelection();
    setupPathSelection();
    setupAccessoryCards();
    setupKitButtons();
    setupKitModal();
    setupBackLinks();
    setupAddToCartButtons();
    showStep('step-1');
    console.log('Bundle page initialized');
  }

  function cacheElements() {
    elements = {
      steps: document.querySelectorAll('.bundle-step'),
      bundleCards: document.querySelectorAll('.bundle-grip-card'),
      pathCards: document.querySelectorAll('.bundle-path-card'),
      productCards: document.querySelectorAll('.bundle-product-card'),
      accessoryCheckboxes: document.querySelectorAll('.bundle-accessory-checkbox'),
      kitCards: document.querySelectorAll('.bundle-kit-card[data-bundle-type]'),
      kitSlides: document.querySelectorAll('.bundle-kits-grid .swiper-slide'),
      accessorySlides: document.querySelectorAll('.bundle-accessories-grid .swiper-slide'),
      backLinks: document.querySelectorAll('.bundle-back-link'),
      skipToStep2Link: document.querySelector('[data-action="skip-to-step2"]'),
      // Selection UI elements
      selectionBadge: document.getElementById('selection-badge'),
      badgeCount: document.getElementById('badge-count'),
      stickyFooter: document.getElementById('sticky-footer'),
      footerCount: document.getElementById('footer-count'),
      footerTotal: document.getElementById('footer-total'),
      addSelectedBtn: document.getElementById('add-selected-btn'),
      // Kit modal elements
      kitModal: document.getElementById('kit-modal'),
      modalMainImage: document.getElementById('modal-main-image'),
      modalThumbnails: document.getElementById('modal-thumbnails'),
      modalTitle: document.getElementById('modal-title'),
      modalPrice: document.getElementById('modal-price'),
      modalComparePrice: document.getElementById('modal-compare-price'),
      modalSavings: document.getElementById('modal-savings'),
      modalDescription: document.getElementById('modal-description'),
      modalAddBtn: document.getElementById('modal-add-btn')
    };
    
    console.log('Cached elements:', {
      productCards: elements.productCards.length,
      accessoryCheckboxes: elements.accessoryCheckboxes.length,
      kitCards: elements.kitCards.length
    });
  }

  // ============================================
  // STEP NAVIGATION
  // ============================================

  function showStep(stepId) {
    state.currentStep = stepId;
    
    elements.steps.forEach(step => {
      if (step.dataset.step === stepId) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
    
    // Show/hide sticky footer on step 2a
    if (elements.stickyFooter) {
      if (stepId === 'step-2a') {
        elements.stickyFooter.classList.add('visible');
      } else {
        elements.stickyFooter.classList.remove('visible');
      }
    }
    
    // Update Swipers when showing steps
    if (stepId === 'step-2a' || stepId === 'step-2b') {
      setTimeout(() => {
        const accessoriesSwiper = document.querySelector('#accessories-swiper')?.swiper;
        if (accessoriesSwiper) {
          accessoriesSwiper.update();
          accessoriesSwiper.slideTo(0);
        }
        
        const kitsSwiper = document.querySelector('#kits-swiper')?.swiper;
        if (kitsSwiper) {
          kitsSwiper.update();
          kitsSwiper.slideTo(0);
        }
      }, 100);
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============================================
  // STEP 1: BUNDLE SELECTION (Classic or Smart)
  // ============================================

  function setupBundleSelection() {
    document.querySelectorAll('[data-action="select-bundle"]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const bundleType = this.dataset.bundle;
        const card = this.closest('.bundle-grip-card');
        const variantId = card ? card.dataset.variantId : null;
        
        console.log('Bundle selected:', bundleType, 'Variant ID:', variantId);
        
        state.selectedBundle = bundleType;
        
        // Add grip to cart if variant ID exists
        if (variantId) {
          this.disabled = true;
          this.textContent = 'Adding...';
          
          addToCart(variantId, 1).then(() => {
            showCartNotification('Grip added to cart!');
            filterByBundleType(bundleType);
            showStep('step-2');
          }).catch(err => {
            console.error('Error adding to cart:', err);
            filterByBundleType(bundleType);
            showStep('step-2');
          });
        } else {
          filterByBundleType(bundleType);
          showStep('step-2');
        }
      });
    });
    
    // "Already have" link - skip to step 2, show ALL
    if (elements.skipToStep2Link) {
      elements.skipToStep2Link.addEventListener('click', function(e) {
        e.preventDefault();
        state.selectedBundle = 'both';
        filterByBundleType('both');
        showStep('step-2');
      });
    }
  }

  // ============================================
  // FILTER BY BUNDLE TYPE (Classic / Smart)
  // ============================================

  function filterByBundleType(bundleType) {
    console.log('Filtering by bundle type:', bundleType);
    
    // Filter product cards
    elements.productCards.forEach(card => {
      const cardBundleType = card.dataset.bundleType;
      if (bundleType === 'both' || cardBundleType === bundleType) {
        card.classList.remove('hidden-bundle');
      } else {
        card.classList.add('hidden-bundle');
      }
    });
    
    // Filter accessory swiper slides
    elements.accessorySlides.forEach(slide => {
      const slideBundleType = slide.dataset.bundleType;
      if (bundleType === 'both' || slideBundleType === bundleType) {
        slide.classList.remove('hidden-bundle');
        slide.style.display = '';
      } else {
        slide.classList.add('hidden-bundle');
        slide.style.display = 'none';
      }
    });
    
    // Filter kit cards
    elements.kitCards.forEach(card => {
      const cardBundleType = card.dataset.bundleType;
      if (bundleType === 'both' || cardBundleType === bundleType) {
        card.classList.remove('hidden-bundle');
      } else {
        card.classList.add('hidden-bundle');
      }
    });
    
    // Filter kit swiper slides
    elements.kitSlides.forEach(slide => {
      const slideBundleType = slide.dataset.bundleType;
      if (bundleType === 'both' || slideBundleType === bundleType) {
        slide.classList.remove('hidden-bundle');
        slide.style.display = '';
      } else {
        slide.classList.add('hidden-bundle');
        slide.style.display = 'none';
      }
    });
    
    // Reset checkboxes
    elements.accessoryCheckboxes.forEach(cb => cb.checked = false);
    updateSelectedAccessories();
    
    // Update Swipers after filtering
    setTimeout(() => {
      const accessoriesSwiper = document.querySelector('#accessories-swiper')?.swiper;
      if (accessoriesSwiper) {
        accessoriesSwiper.update();
        accessoriesSwiper.slideTo(0);
      }
      
      const kitsSwiper = document.querySelector('#kits-swiper')?.swiper;
      if (kitsSwiper) {
        kitsSwiper.update();
        kitsSwiper.slideTo(0);
      }
    }, 100);
  }

  // ============================================
  // STEP 2: PATH SELECTION
  // ============================================

  function setupPathSelection() {
    elements.pathCards.forEach(card => {
      card.addEventListener('click', function(e) {
        e.preventDefault();
        
        const path = this.dataset.path;
        state.selectedPath = path;
        
        console.log('Path selected:', path);
        
        // Highlight selected
        elements.pathCards.forEach(c => c.classList.remove('bundle-path-card--active'));
        this.classList.add('bundle-path-card--active');
        
        // Navigate
        if (path === 'build-your-own') {
          showStep('step-2a');
        } else if (path === 'ready-made-kits') {
          showStep('step-2b');
        }
      });
    });
  }

  // ============================================
  // STEP 2A: ACCESSORY CARD SELECTION
  // ============================================

  function setupAccessoryCards() {
    // Listen for checkbox changes
    elements.accessoryCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        console.log('Card selected:', this.checked);
        updateSelectedAccessories();
      });
    });
  }

  function updateSelectedAccessories() {
    state.selectedAccessories = [];
    let totalCents = 0;
    let count = 0;
    
    elements.accessoryCheckboxes.forEach(checkbox => {
      const card = checkbox.closest('.bundle-product-card');
      
      // Skip if card is hidden by bundle filter
      if (card && card.classList.contains('hidden-bundle')) {
        checkbox.checked = false;
        return;
      }
      
      if (checkbox.checked && card) {
        const variantId = card.dataset.variantId;
        const priceCents = parseInt(card.dataset.price, 10) || 0;
        
        state.selectedAccessories.push({
          variantId: variantId,
          price: priceCents
        });
        
        totalCents += priceCents;
        count++;
      }
    });
    
    console.log('Total selected:', count, 'Total price (cents):', totalCents);
    
    // Update selection badge
    if (elements.badgeCount) {
      elements.badgeCount.textContent = count;
    }
    if (elements.selectionBadge) {
      if (count > 0) {
        elements.selectionBadge.classList.add('has-selection');
      } else {
        elements.selectionBadge.classList.remove('has-selection');
      }
    }
    
    // Update sticky footer
    if (elements.footerCount) {
      elements.footerCount.textContent = count;
    }
    if (elements.footerTotal) {
      elements.footerTotal.textContent = formatMoney(totalCents);
    }
    if (elements.addSelectedBtn) {
      elements.addSelectedBtn.disabled = count === 0;
    }
  }

  // ============================================
  // STEP 2B: KIT BUTTONS (Open Modal)
  // ============================================

  function setupKitButtons() {
    document.querySelectorAll('[data-action="open-kit-modal"]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const card = this.closest('.bundle-kit-card');
        if (!card) return;
        
        // Get kit data from card attributes
        const kitData = {
          variantId: card.dataset.variantId,
          name: card.dataset.kitName,
          price: card.dataset.kitPrice,
          comparePrice: card.dataset.kitComparePrice,
          savings: card.dataset.kitSavings,
          description: card.dataset.kitDescription,
          mainImage: card.dataset.kitImage,
          images: card.dataset.kitImages ? card.dataset.kitImages.split(',').filter(Boolean) : []
        };
        
        console.log('Opening kit modal:', kitData);
        openKitModal(kitData);
      });
    });
  }

  // ============================================
  // KIT MODAL FUNCTIONALITY
  // ============================================

  function setupKitModal() {
    if (!elements.kitModal) return;
    
    // Close modal on overlay click
    document.querySelectorAll('[data-action="close-modal"]').forEach(el => {
      el.addEventListener('click', closeKitModal);
    });
    
    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && elements.kitModal.classList.contains('open')) {
        closeKitModal();
      }
    });
    
    // Add to cart from modal
    if (elements.modalAddBtn) {
      elements.modalAddBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!state.currentKitVariantId) return;
        
        this.classList.add('loading');
        const originalText = this.innerHTML;
        this.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 3H4.5L5.5 13H14.5L16 5H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="16" r="1.5" fill="currentColor"/><circle cx="13" cy="16" r="1.5" fill="currentColor"/></svg> Adding...';
        
        addToCart(state.currentKitVariantId, 1).then(() => {
          showCartNotification('Kit added to cart!');
          this.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10L8.5 13.5L15 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Added!';
          this.classList.remove('loading');
          
          setTimeout(() => {
            closeKitModal();
            this.innerHTML = originalText;
          }, 1500);
        }).catch(err => {
          console.error('Error adding kit to cart:', err);
          this.innerHTML = 'Error - Retry';
          this.classList.remove('loading');
          setTimeout(() => {
            this.innerHTML = originalText;
          }, 2000);
        });
      });
    }
  }

  function openKitModal(kitData) {
    if (!elements.kitModal) return;
    
    // Store variant ID for cart button
    state.currentKitVariantId = kitData.variantId;
    
    // Populate modal content
    if (elements.modalTitle) {
      elements.modalTitle.textContent = kitData.name || '';
    }
    
    if (elements.modalPrice) {
      elements.modalPrice.textContent = kitData.price || '';
    }
    
    if (elements.modalComparePrice) {
      if (kitData.comparePrice) {
        elements.modalComparePrice.textContent = kitData.comparePrice;
        elements.modalComparePrice.style.display = '';
      } else {
        elements.modalComparePrice.style.display = 'none';
      }
    }
    
    if (elements.modalSavings) {
      if (kitData.savings) {
        elements.modalSavings.textContent = 'Save ' + kitData.savings + '%';
        elements.modalSavings.style.display = '';
      } else {
        elements.modalSavings.style.display = 'none';
      }
    }
    
    if (elements.modalDescription) {
      elements.modalDescription.innerHTML = kitData.description || '';
    }
    
    // Set main image
    if (elements.modalMainImage) {
      elements.modalMainImage.src = kitData.mainImage || '';
      elements.modalMainImage.alt = kitData.name || '';
    }
    
    // Build thumbnails
    if (elements.modalThumbnails) {
      elements.modalThumbnails.innerHTML = '';
      
      const allImages = kitData.images.length > 0 ? kitData.images : (kitData.mainImage ? [kitData.mainImage] : []);
      
      allImages.forEach((imgUrl, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'bundle-kit-modal__thumbnail' + (index === 0 ? ' active' : '');
        thumb.innerHTML = '<img src="' + imgUrl + '" alt="' + (kitData.name || '') + ' image ' + (index + 1) + '">';
        
        thumb.addEventListener('click', function() {
          // Update main image
          if (elements.modalMainImage) {
            elements.modalMainImage.src = imgUrl;
          }
          // Update active thumbnail
          elements.modalThumbnails.querySelectorAll('.bundle-kit-modal__thumbnail').forEach(t => {
            t.classList.remove('active');
          });
          this.classList.add('active');
        });
        
        elements.modalThumbnails.appendChild(thumb);
      });
    }
    
    // Show modal
    elements.kitModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeKitModal() {
    if (!elements.kitModal) return;
    
    elements.kitModal.classList.remove('open');
    document.body.style.overflow = '';
    state.currentKitVariantId = null;
  }

  // ============================================
  // BACK LINKS
  // ============================================

  function setupBackLinks() {
    elements.backLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetStep = this.dataset.targetStep;
        if (targetStep) {
          showStep(targetStep);
        }
      });
    });
  }

  // ============================================
  // ADD TO CART
  // ============================================

  function setupAddToCartButtons() {
    if (elements.addSelectedBtn) {
      console.log('Setting up Add Selected button');
      
      elements.addSelectedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        console.log('Add Selected clicked, accessories:', state.selectedAccessories.length);
        
        if (state.selectedAccessories.length === 0) {
          console.log('No accessories selected');
          return;
        }
        
        // Disable button while processing
        this.disabled = true;
        const btnText = this.querySelector('.bundle-sticky-footer__btn-text');
        const originalText = btnText ? btnText.textContent : this.textContent;
        if (btnText) {
          btnText.textContent = 'Adding...';
        } else {
          this.textContent = 'Adding...';
        }
        
        const items = state.selectedAccessories.map(acc => ({
          id: parseInt(acc.variantId, 10),
          quantity: 1
        }));
        
        console.log('Adding items to cart:', items);
        
        addMultipleToCart(items).then((response) => {
          console.log('Cart response:', response);
          showCartNotification(items.length + ' items added to cart!');
          
          // Reset checkboxes
          elements.accessoryCheckboxes.forEach(cb => cb.checked = false);
          updateSelectedAccessories();
          
          if (btnText) {
            btnText.textContent = 'Added!';
          } else {
            this.textContent = 'Added!';
          }
          
          setTimeout(() => {
            if (btnText) {
              btnText.textContent = originalText;
            } else {
              this.textContent = originalText;
            }
            this.disabled = false;
          }, 2500);
        }).catch(err => {
          console.error('Error adding to cart:', err);
          if (btnText) {
            btnText.textContent = 'Error - Retry';
          } else {
            this.textContent = 'Error - Retry';
          }
          setTimeout(() => {
            if (btnText) {
              btnText.textContent = originalText;
            } else {
              this.textContent = originalText;
            }
            this.disabled = false;
          }, 2000);
        });
      });
    }
  }

  function addToCart(variantId, quantity) {
    quantity = quantity || 1;
    console.log('addToCart called:', variantId, quantity);
    
    const cartDrawer = document.querySelector('cart-drawer');
    const sectionId = cartDrawer?.dataset?.sectionId || 'cart-drawer';
    
    const formData = new FormData();
    formData.append('id', variantId);
    formData.append('quantity', quantity);
    formData.append('sections', sectionId);
    formData.append('sections_url', window.location.pathname);
    
    return fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(text => {
      const data = JSON.parse(text);
      console.log('Cart response:', data);
      
      if (data.description) {
        throw new Error(data.description);
      }
      
      const cartHtml = data.sections?.[sectionId];
      if (cartHtml) {
        console.log('Using HTML from add response');
        updateCartDrawerAndOpen(cartHtml, sectionId);
      } else {
        console.log('No section HTML in response, fetching separately');
        return fetchAndOpenCartDrawer();
      }
      
      return data;
    });
  }

  function addMultipleToCart(items) {
    console.log('addMultipleToCart called:', items);
    
    const cartDrawer = document.querySelector('cart-drawer');
    const sectionId = cartDrawer?.dataset?.sectionId || 'cart-drawer';
    
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        items: items,
        sections: sectionId,
        sections_url: window.location.pathname
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Cart response:', data);
      
      const cartHtml = data.sections?.[sectionId];
      if (cartHtml) {
        updateCartDrawerAndOpen(cartHtml, sectionId);
      } else {
        return fetchAndOpenCartDrawer();
      }
      
      return data;
    });
  }

  function updateCartDrawerAndOpen(html, sectionId) {
    const cartDrawer = document.querySelector('cart-drawer');
    if (!cartDrawer) {
      console.log('No cart-drawer element found');
      return;
    }
    
    // Parse HTML and update cart drawer content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newContent = doc.querySelector('cart-drawer');
    
    if (newContent) {
      cartDrawer.innerHTML = newContent.innerHTML;
    }
    
    // Open cart drawer
    openCartDrawer();
  }

  function fetchAndOpenCartDrawer() {
    const cartDrawer = document.querySelector('cart-drawer');
    const sectionId = cartDrawer?.dataset?.sectionId || 'cart-drawer';
    
    return fetch('/?sections=' + sectionId)
      .then(response => response.json())
      .then(sections => {
        const html = sections[sectionId];
        if (html) {
          updateCartDrawerAndOpen(html, sectionId);
        }
      });
  }

  function openCartDrawer() {
    const cartDrawer = document.querySelector('cart-drawer');
    
    if (cartDrawer) {
      // Try using built-in method
      if (typeof cartDrawer.open === 'function') {
        cartDrawer.open();
        return;
      }
      
      // Try using purchaseHandler
      if (typeof cartDrawer.purchaseHandler === 'function') {
        cartDrawer.purchaseHandler();
        return;
      }
    }
    
    // Try clicking the cart button
    const cartButton = document.querySelector('[data-sidebar-button="cart"]');
    if (cartButton) {
      cartButton.click();
      return;
    }
    
    // Try other common cart triggers
    const cartTriggers = [
      '.cart-icon-bubble',
      '.header__cart-link',
      'a[href="/cart"]',
      '[data-cart-trigger]'
    ];
    
    for (const selector of cartTriggers) {
      const trigger = document.querySelector(selector);
      if (trigger) {
        trigger.click();
        return;
      }
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  function formatMoney(cents) {
    const dollars = (cents / 100).toFixed(2);
    return '$' + dollars;
  }

  function showCartNotification(message) {
    console.log('Showing notification:', message);
    
    // Remove existing notification
    const existing = document.querySelector('.bundle-cart-notification');
    if (existing) {
      existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'bundle-cart-notification';
    notification.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

})();
