<template>
  <div id="app">
    <header>
      <NavBar></NavBar>
    </header>

    <!-- This is the magic placeholder! -->
    <!-- Your HomeView, MyNewView, etc., will be rendered right here -->
    <main>
      <div :style="{ paddingTop: navbarHeight + 'px' }" class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
export default {
  name: 'App',
  components: { NavBar },
  data() {
    return {
      navbarHeight: 0,
    }
  },
  mounted() {
    const navbar = document.querySelector('.customNavbar');
    this.updateNavbarHeight();

    window.addEventListener('resize', this.updateNavbarHeight);
    if (navbar) {
      // navbar.addEventListener('shown.bs.collapse', this.updateNavbarHeight);
      navbar.addEventListener('hidden.bs.collapse', this.updateNavbarHeight);
    }
    // Remove all footer elements from the entire app
    this.removeAllFooters();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateNavbarHeight);
  },
  methods: {
    updateNavbarHeight() {
      const navbar = document.querySelector('.customNavbar');
      if (!navbar) return;

      // Find only the immediate first row (brand + toggler)
      const bar = navbar.querySelector('.container-fluid');
      let height = 0;

      if (bar) {
        // Only this top section — ignore collapse content
        const rect = bar.getBoundingClientRect();
        height = rect.height;
      } else {
        // fallback to navbar height if query fails
        height = navbar.offsetHeight;
      }

      this.navbarHeight = height;
    },
    removeAllFooters() {
      // Remove all footer-related elements from the entire application
      const selectors = [
        'footer',
        '.emergency-strip',
        '.footer-body',
        '[class*="footer"]',
        '[class*="emergency"]',
        '#footer',
        '[id*="footer"]',
        '[id="footer"]',
        'div#footer'
      ];

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el && el.parentNode) {
              // Completely remove and clear
              el.innerHTML = '';
              el.remove();
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });

      // Specifically target the #footer div
      const footerDiv = document.getElementById('footer');
      if (footerDiv) {
        footerDiv.innerHTML = '';
        footerDiv.remove();
      }

      // Remove any colored strips/bars above navbar
      const bodyChildren = Array.from(document.body.children);
      bodyChildren.forEach(child => {
        if (child.id !== 'app' &&
          child.tagName !== 'SCRIPT' &&
          child.tagName !== 'HEADER' &&
          child.tagName !== 'MAIN' &&
          child.tagName !== 'STYLE') {
          const bgColor = window.getComputedStyle(child).backgroundColor;
          const computedStyle = window.getComputedStyle(child);
          const height = parseInt(computedStyle.height);

          // Remove if it's a thin colored bar (height < 10px) or has red/orange background
          if ((height > 0 && height < 10) ||
            bgColor.includes('255, 0, 0') || // red
            bgColor.includes('255, 69, 0') || // red-orange
            bgColor.includes('255, 99, 71') || // tomato
            bgColor.includes('220, 20, 60')) { // crimson
            child.remove();
          } else if (bgColor &&
            bgColor !== 'rgba(0, 0, 0, 0)' &&
            bgColor !== 'transparent' &&
            !bgColor.includes('255, 255, 255') &&
            !bgColor.includes('250, 248, 243')) {
            child.remove();
          }
        }
      });

      // Remove pseudo-elements that might create colored strips
      const style = document.createElement('style');
      style.textContent = `
        body::before, body::after,
        html::before, html::after,
        header::before, header::after,
        .customNavbar::before, .customNavbar::after {
          display: none !important;
          content: none !important;
        }
      `;
      document.head.appendChild(style);

      // Set up observer to catch dynamically added footers
      const footerObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.tagName === 'FOOTER' ||
                node.classList?.contains('emergency-strip') ||
                node.classList?.contains('footer-body') ||
                node.id === 'footer' ||
                node.className?.includes('footer') ||
                node.className?.includes('emergency')) {
                node.remove();
              }
              const footerChildren = node.querySelectorAll?.('footer, .emergency-strip, .footer-body, [class*="footer"], [id*="footer"]');
              footerChildren?.forEach(el => el.remove());
            }
          });
        });
      });

      footerObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
}
</script>

<style>
.page-content {
  transition: padding-top 0.1s;
}
</style>