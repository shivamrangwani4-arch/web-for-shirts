// State
let allProducts = [];
let metadata = {};
let activeBrand = 'all';
let activeMaxPrice = 'all';
let onlySale = false;
let currentSort = 'price-asc';
let searchQuery = '';
let visibleCount = 48;
const PAGE_SIZE = 48;

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const emptyState = document.getElementById('empty-state');
const resultsCountText = document.getElementById('results-count-text');
const resetFiltersBtn = document.getElementById('reset-filters');
const emptyResetBtn = document.getElementById('empty-reset-btn');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const brandPillsContainer = document.getElementById('brand-pills');
const pricePills = document.querySelectorAll('.price-pill');
const saleToggle = document.getElementById('sale-toggle');
const sortSelect = document.getElementById('sort-select');
const statTotalProducts = document.getElementById('stat-total-products');
const statLastUpdated = document.getElementById('stat-last-updated');

// Initialize app
async function init() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    const data = await response.json();
    metadata = data;
    allProducts = data.products || [];

    // Render stats
    if (statTotalProducts) {
      statTotalProducts.textContent = `${allProducts.length.toLocaleString()} T-Shirts Live (Starting Rs. ${data.min_price || 399})`;
    }
    if (statLastUpdated && data.last_updated) {
      statLastUpdated.textContent = `Updated: ${data.last_updated}`;
    }

    renderBrandPills();
    attachEventListeners();
    applyFilters();
  } catch (error) {
    console.error('Initialization error:', error);
    productsGrid.innerHTML = `
      <div class="col-span-full py-12 text-center bg-red-50 rounded-2xl border border-red-200 p-6 text-red-700">
        <p class="font-bold text-base">Data load karne mein masla aya!</p>
        <p class="text-xs text-red-600 mt-1">Products file nahi mil saki ya load nahi hui. Scraper ko run karein.</p>
      </div>
    `;
  }
}

// Generate brand pill buttons dynamically based on scraped data
function renderBrandPills() {
  const brandCounts = {};
  allProducts.forEach(p => {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  });

  const brands = Object.keys(brandCounts).sort();

  brandPillsContainer.innerHTML = `
    <button data-brand="all" class="brand-pill active text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all bg-emerald-600 text-white border-emerald-600 shadow-sm">
      All Brands (${allProducts.length})
    </button>
  `;

  brands.forEach(brand => {
    const btn = document.createElement('button');
    btn.dataset.brand = brand;
    btn.className = 'brand-pill text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all';
    btn.textContent = `${brand} (${brandCounts[brand]})`;
    brandPillsContainer.appendChild(btn);
  });
}

function attachEventListeners() {
  // Brand Pills click
  brandPillsContainer.addEventListener('click', (e) => {
    const target = e.target.closest('.brand-pill');
    if (!target) return;
    
    document.querySelectorAll('.brand-pill').forEach(btn => {
      btn.classList.remove('active', 'bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');
      btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
    });

    target.classList.add('active', 'bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');
    target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');

    activeBrand = target.dataset.brand;
    visibleCount = PAGE_SIZE;
    applyFilters();
  });

  // Price Pills click
  pricePills.forEach(pill => {
    pill.addEventListener('click', () => {
      pricePills.forEach(p => {
        p.classList.remove('active', 'bg-slate-900', 'text-white', 'border-slate-900');
        p.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
      });

      pill.classList.add('active', 'bg-slate-900', 'text-white', 'border-slate-900');
      pill.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');

      activeMaxPrice = pill.dataset.maxPrice;
      visibleCount = PAGE_SIZE;
      applyFilters();
    });
  });

  // Search input
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value.trim().toLowerCase();
      clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
      visibleCount = PAGE_SIZE;
      applyFilters();
    }, 200);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    visibleCount = PAGE_SIZE;
    applyFilters();
  });

  // Sale toggle
  saleToggle.addEventListener('change', (e) => {
    onlySale = e.target.checked;
    visibleCount = PAGE_SIZE;
    applyFilters();
  });

  // Sort dropdown
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFilters();
  });

  // Reset filters
  const resetHandler = () => {
    activeBrand = 'all';
    activeMaxPrice = 'all';
    onlySale = false;
    searchQuery = '';
    currentSort = 'price-asc';
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    saleToggle.checked = false;
    sortSelect.value = 'price-asc';

    // Reset Brand Pills
    document.querySelectorAll('.brand-pill').forEach(btn => {
      if (btn.dataset.brand === 'all') {
        btn.classList.add('active', 'bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');
        btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
      } else {
        btn.classList.remove('active', 'bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');
        btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
      }
    });

    // Reset Price Pills
    pricePills.forEach(pill => {
      if (pill.dataset.maxPrice === 'all') {
        pill.classList.add('active', 'bg-slate-900', 'text-white', 'border-slate-900');
        pill.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
      } else {
        pill.classList.remove('active', 'bg-slate-900', 'text-white', 'border-slate-900');
        pill.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
      }
    });

    visibleCount = PAGE_SIZE;
    applyFilters();
  };

  resetFiltersBtn.addEventListener('click', resetHandler);
  emptyResetBtn.addEventListener('click', resetHandler);
}

function applyFilters() {
  let filtered = [...allProducts];

  // Brand filter
  if (activeBrand !== 'all') {
    filtered = filtered.filter(p => p.brand === activeBrand);
  }

  // Price max filter
  if (activeMaxPrice !== 'all') {
    const max = parseInt(activeMaxPrice, 10);
    filtered = filtered.filter(p => p.price <= max);
  }

  // On sale only filter
  if (onlySale) {
    filtered = filtered.filter(p => p.discount_percent > 0);
  }

  // Search keyword filter
  if (searchQuery) {
    filtered = filtered.filter(p => {
      const titleMatch = p.title.toLowerCase().includes(searchQuery);
      const brandMatch = p.brand.toLowerCase().includes(searchQuery);
      const catMatch = (p.category || '').toLowerCase().includes(searchQuery);
      return titleMatch || brandMatch || catMatch;
    });
  }

  // Sorting
  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'discount-desc') {
    filtered.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
  } else if (currentSort === 'brand') {
    filtered.sort((a, b) => a.brand.localeCompare(b.brand));
  }

  // Update Result text & Reset visibility
  const isFiltered = activeBrand !== 'all' || activeMaxPrice !== 'all' || onlySale || searchQuery !== '';
  resetFiltersBtn.classList.toggle('hidden', !isFiltered);
  resultsCountText.textContent = `Found ${filtered.length.toLocaleString()} T-Shirts ${isFiltered ? '(Filtered)' : ''}`;

  renderProducts(filtered);
}

function renderProducts(products) {
  if (products.length === 0) {
    productsGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  const visible = products.slice(0, visibleCount);

  const cardsHtml = visible.map(product => {
    const fallbackImg = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60';
    const hasDiscount = product.discount_percent > 0 && product.original_price > product.price;

    return `
      <div class="product-card bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col group relative">
        
        <!-- Image & Badges Container -->
        <div class="relative bg-slate-100 aspect-square overflow-hidden">
          <img 
            src="${product.image || fallbackImg}" 
            alt="${product.title}" 
            loading="lazy"
            onerror="this.onerror=null;this.src='${fallbackImg}';"
            class="product-image w-full h-full object-cover object-top"
          >

          <!-- Brand Badge (Top Left) -->
          <div class="absolute top-2.5 left-2.5">
            <span class="inline-flex items-center text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md text-white shadow-sm" style="background-color: ${product.brand_color || '#16a34a'}">
              ${product.brand.split(' ')[0]}
            </span>
          </div>

          <!-- Discount Badge (Top Right) -->
          ${hasDiscount ? `
            <div class="absolute top-2.5 right-2.5">
              <span class="inline-flex items-center text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-sm">
                -${product.discount_percent}% OFF
              </span>
            </div>
          ` : ''}

          <!-- Category pill (Bottom Left) -->
          <div class="absolute bottom-2 left-2">
            <span class="text-[9px] font-semibold text-slate-700 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded border border-slate-200">
              ${product.category || 'T-Shirt'}
            </span>
          </div>
        </div>

        <!-- Details -->
        <div class="p-3 sm:p-4 flex flex-col flex-1 justify-between">
          <div>
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ${product.brand}
            </div>
            <h3 class="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 mt-0.5" title="${product.title}">
              ${product.title}
            </h3>
          </div>

          <!-- Price & CTA -->
          <div class="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-2">
            <div class="flex items-baseline gap-2">
              <span class="text-base sm:text-lg font-extrabold text-slate-900">
                Rs. ${product.price.toLocaleString()}
              </span>
              ${hasDiscount ? `
                <span class="text-xs text-slate-400 line-through">
                  Rs. ${product.original_price.toLocaleString()}
                </span>
              ` : ''}
            </div>

            <!-- Direct Buy Link Button -->
            <div class="flex items-center gap-1.5 w-full">
              <a 
                href="${product.url}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <span>Buy from Brand</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>

              <!-- Quick Share to WhatsApp -->
              <a 
                href="https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this deal for Rs. ${product.price} at ${product.brand}: ${product.title} -> ${product.url}`)}" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Share on WhatsApp"
                class="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
              >
                <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
              </a>
            </div>

          </div>

        </div>

      </div>
    `;
  }).join('');

  // Append Load More button if there are more products to show
  let loadMoreHtml = '';
  if (visibleCount < products.length) {
    loadMoreHtml = `
      <div class="col-span-full text-center py-6">
        <button id="load-more-btn" class="px-6 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all">
          Load More T-Shirts (${products.length - visibleCount} baki hain)
        </button>
      </div>
    `;
  }

  productsGrid.innerHTML = cardsHtml + loadMoreHtml;

  // Re-run Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Load More click listener
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      renderProducts(products);
    });
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
