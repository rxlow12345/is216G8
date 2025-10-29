// ======================== About Section ========================
document.addEventListener("scroll", () => {
  const fadeEls = document.querySelectorAll(".fade-in-left, .fade-in-right");
  fadeEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.classList.add("visible");
        }
  });
});