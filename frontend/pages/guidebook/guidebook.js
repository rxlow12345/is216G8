// Load all animals on page load
document.addEventListener("DOMContentLoaded", () => {
  getAllAnimals();

  // Handle category tab clicks
  document.querySelectorAll("#categoryTabs .nav-link").forEach(tab => {
    tab.addEventListener("click", e => {
      e.preventDefault();
      document.querySelectorAll("#categoryTabs .nav-link").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const category = tab.dataset.category;
      document.getElementById("searchInput").value = "";
      filterByCategory(category);
    });
  });

  // Handle search
  document.getElementById("searchBtn").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    filterBySearch(query);
  });
});

// Fetch and display all animals
function getAllAnimals() {
  axios.get("guidebook.json")
    .then(response => {
      displayAnimals(response.data);
    })
    .catch(error => {
      console.error(error.message);
      document.getElementById("cardsContainer").innerHTML =
        `<div class="alert alert-danger text-center">Failed to load animals data.</div>`;
    });
}

// Filter animals by category
function filterByCategory(category) {
  axios.get("guidebook.json")
    .then(response => {
      const animals = response.data;
      let filtered = category === "all"
        ? animals
        : animals.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
      displayAnimals(filtered);
    });
}

// Filter animals by name
function filterBySearch(query) {
  axios.get("guidebook.json")
    .then(response => {
      const animals = response.data;
      const filtered = animals.filter(a =>
        a.common_name.toLowerCase().includes(query) ||
        a.scientific_name.toLowerCase().includes(query)
      );
      displayAnimals(filtered);
    });
}

// Render animal cards
function displayAnimals(animals) {
  const container = document.getElementById("cardsContainer");
  if (!animals.length) {
    container.innerHTML = `<p class="text-center text-muted">No animals found.</p>`;
    return;
  }

  const cards = animals.map(animal => `
    <div class="col-md-4 col-lg-3 mb-4 d-flex">
      <div class="card flex-fill shadow-sm">
        <img src="${animal.image_url}" class="card-img-top" alt="${animal.common_name}">
        <div class="card-body">
          <h5 class="card-title">${animal.common_name}</h5>
          <p class="text-muted fst-italic small">${animal.scientific_name}</p>
          <p class="card-text">${animal.description}</p>
          <a href="${animal.learn_more_url}" target="_blank" class="btn btn-success btn-sm mt-2">Learn More</a>
        </div>
      </div>
    </div>
  `).join("");

  container.innerHTML = `<div class="row">${cards}</div>`;
}
