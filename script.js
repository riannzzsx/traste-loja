// Traste — vitrine headless: o JS só monta a UI, o catálogo vive em products.json
let allProducts = [];
let activeCategory = 'Todas';
let searchTerm = '';

const grid = document.getElementById('product-grid');
const emptyState = document.getElementById('empty-state');
const resultCount = document.getElementById('result-count');
const searchInput = document.getElementById('search-input');
const categoryFiltersEl = document.getElementById('category-filters');

const formatPrice = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function renderCategoryButtons(products) {
  const categories = ['Todas', ...new Set(products.map((p) => p.categoria))];

  categoryFiltersEl.innerHTML = categories
    .map((cat) => {
      const isActive = cat === activeCategory ? 'active' : '';
      return `<button class="category-btn ${isActive}" data-cat="${cat}">${cat}</button>`;
    })
    .join('');

  categoryFiltersEl.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderCategoryButtons(allProducts);
      applyFilters();
    });
  });
}

function renderProducts(products) {
  if (products.length === 0) {
    grid.innerHTML = '';
    emptyState.hidden = false;
    resultCount.textContent = '0 produtos encontrados';
    return;
  }

  emptyState.hidden = true;
  resultCount.textContent = `${products.length} produto${products.length > 1 ? 's' : ''} encontrado${products.length > 1 ? 's' : ''}`;

  grid.innerHTML = products
    .map(
      (p) => `
    <article class="product-card">
      <div class="product-card__emoji" aria-hidden="true">${p.emoji}</div>
      <p class="product-card__category">${p.categoria}</p>
      <h2 class="product-card__name">${p.nome}</h2>
      <p class="product-card__desc">${p.descricao}</p>
      <div class="product-card__footer">
        <span class="product-card__price">${formatPrice(p.preco)}</span>
        <span class="product-card__stock">${p.estoque} em estoque</span>
      </div>
    </article>
  `
    )
    .join('');
}

function applyFilters() {
  let filtered = allProducts;

  if (activeCategory !== 'Todas') {
    filtered = filtered.filter((p) => p.categoria === activeCategory);
  }

  if (searchTerm.trim() !== '') {
    const term = searchTerm.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        p.descricao.toLowerCase().includes(term)
    );
  }

  renderProducts(filtered);
}

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  applyFilters();
});

// headless commerce: o catálogo é um recurso externo, buscado via fetch,
// não hardcodado no HTML/JS.
fetch('products.json')
  .then((res) => {
    if (!res.ok) throw new Error(`Erro ao carregar catálogo: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    allProducts = data;
    renderCategoryButtons(allProducts);
    applyFilters();
  })
  .catch((err) => {
    grid.innerHTML = `<p class="empty-state">Não foi possível carregar o catálogo agora. (${err.message})</p>`;
    console.error(err);
  });
