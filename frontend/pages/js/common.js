// ======================== Navigation Bar ========================
document.addEventListener("DOMContentLoaded", () => {
  const navbarBurger = document.getElementById("navbarToggleBurger");
  const navbarClose = document.getElementById("navbarNav");

    navbarClose.addEventListener("shown.bs.collapse", () => {
        navbarBurger.classList.add("navFadeOut");
        setTimeout(() => {
            navbarBurger.src = "../../../src/public/assets/navClose.svg";
            navbarBurger.classList.remove("navFadeOut");
            navbarBurger.classList.add("navFadeIn");
        }, 100);
    });

    navbarClose.addEventListener("hidden.bs.collapse", () => {
        navbarBurger.classList.add("navFadeOut");
        setTimeout(() => {
            navbarBurger.src = "../../../src/public/assets/navBurger.svg";
            navbarBurger.classList.remove("navFadeOut");
            navbarBurger.classList.add("navFadeIn");
        }, 100);
    });
});

// ======================== Scroll to Top  ========================
document.addEventListener("DOMContentLoaded", () => {
    const scrollTopBtn = document.getElementById("scrollTopBtn");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 200) {
            scrollTopBtn.style.display = "flex"; // use flex to center icon
        }
        else {
            scrollTopBtn.style.display = "none";
        }
    });

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});