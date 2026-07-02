/* ============ DONNÉES MAGASINS ============ */
/* Sources : fiches officielles / annuaires pros (adresses & fixes vérifiés).
   mobile : vide, à compléter dans l'espace pro.
   email  : format standard ville@cash-boissons.com (modifiable dans l'espace pro). */
const DEFAULT_STORES = [
  {
    id: "bruay",
    lat: 50.4836,
    lng: 2.5372,
    city: "Bruay-la-Buissière",
    dept: "62 — Pas-de-Calais",
    address: "45 Avenue de la Libération, 62700 Bruay-la-Buissière",
    phone: "03 21 68 57 28",
    mobile: "",
    email: "bruay@cash-boissons.com",
    hours: "Du mardi au samedi : 9h30-12h30 et 14h-19h",
    status: "open"
  },
  {
    id: "loos",
    lat: 50.4394,
    lng: 2.7719,
    city: "Loos-en-Gohelle",
    dept: "62 — Pas-de-Calais",
    address: "1 Route de Béthune, 62750 Loos-en-Gohelle",
    phone: "09 66 93 43 77",
    mobile: "",
    email: "loos@cash-boissons.com",
    hours: "Du mardi au samedi : 9h30-12h30 et 14h-19h",
    status: "open"
  },
  {
    id: "auchy",
    lat: 50.5333,
    lng: 2.7833,
    city: "Auchy-les-Mines",
    dept: "62 — Pas-de-Calais",
    address: "150 Route Nationale, 62138 Auchy-les-Mines",
    phone: "09 67 49 56 17",
    mobile: "",
    email: "auchy@cash-boissons.com",
    hours: "Du mardi au samedi : 9h30-12h30 et 14h-19h",
    status: "open"
  },
  {
    id: "lambres",
    lat: 50.3922,
    lng: 3.0519,
    city: "Lambres-lez-Douai",
    dept: "59 — Nord",
    address: "279 Rue Jacqueline Auriol, 59552 Lambres-lez-Douai",
    phone: "09 67 40 20 39",
    mobile: "",
    email: "lambres@cash-boissons.com",
    hours: "Du mardi au samedi : 9h30-12h30 et 14h-19h",
    status: "open"
  },
  {
    id: "cambrai",
    lat: 50.1765,
    lng: 3.2345,
    city: "Cambrai",
    dept: "59 — Nord",
    address: "2095 Avenue de Paris, 59400 Cambrai",
    phone: "03 27 72 15 21",
    mobile: "",
    email: "cambrai@cash-boissons.com",
    hours: "Du mardi au samedi : 9h30-12h30 et 14h-19h",
    status: "open"
  },
  {
    id: "avranches",
    lat: 48.6975,
    lng: -1.3308,
    city: "Avranches",
    dept: "50 — Manche",
    address: "Rue Victor Lemarchand, 50300 Saint-Senier-sous-Avranches",
    phone: "",
    mobile: "",
    email: "avranches@cash-boissons.com",
    hours: "",
    status: "open"
  },
  {
    id: "noyellesgodault",
    lat: 50.4167,
    lng: 2.9833,
    city: "Noyelles-Godault",
    dept: "62 — Pas-de-Calais",
    address: "Adresse à venir",
    phone: "",
    mobile: "",
    email: "noyellesgodault@cash-boissons.com",
    hours: "",
    status: "soon"
  }
];

const DEFAULT_CATEGORIES = ["Bières", "Vins", "Spiritueux", "Softs / Eaux", "Paniers garnis"];

const ADMIN_PASSWORD = "cashboissons62"; // à personnaliser

/* ============ FIREBASE ============ */
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storesCol = db.collection("stores");
const productsCol = db.collection("products");
const categoriesCol = db.collection("categories");
const reviewsCol = db.collection("reviews");

let stores = structuredClone(DEFAULT_STORES);
let products = [];
let categories = [];
let reviews = [];
let editingProductId = null;

/* Premier lancement : on sème les magasins par défaut si la base est vide */
async function seedStoresIfEmpty(){
  const snap = await storesCol.get();
  if(snap.empty){
    const batch = db.batch();
    DEFAULT_STORES.forEach(s => batch.set(storesCol.doc(s.id), s));
    await batch.commit();
  }
}
async function seedCategoriesIfEmpty(){
  const snap = await categoriesCol.get();
  if(snap.empty){
    const batch = db.batch();
    DEFAULT_CATEGORIES.forEach(name => batch.set(categoriesCol.doc(), {name}));
    await batch.commit();
  }
}

/* Écoute en temps réel : toute modif (mobile, PC...) se répercute partout */
function listenStores(cb){
  storesCol.onSnapshot(snap => {
    const fromDb = {};
    snap.forEach(doc => fromDb[doc.id] = doc.data());
    stores = DEFAULT_STORES.map(def => fromDb[def.id] ? {...def, ...fromDb[def.id]} : def);
    cb();
  });
}
function listenProducts(cb){
  productsCol.orderBy("createdAt", "desc").onSnapshot(snap => {
    products = snap.docs.map(doc => ({id: doc.id, ...doc.data()}));
    cb();
  });
}
function listenCategories(cb){
  categoriesCol.onSnapshot(snap => {
    categories = snap.docs.map(doc => ({id: doc.id, ...doc.data()})).sort((a,b) => a.name.localeCompare(b.name));
    cb();
  });
}
async function addCategory(name){
  await categoriesCol.add({name});
}
async function removeCategory(id){
  await categoriesCol.doc(id).delete();
}
function listenReviews(cb){
  reviewsCol.orderBy("createdAt", "desc").onSnapshot(snap => {
    reviews = snap.docs.map(doc => ({id: doc.id, ...doc.data()}));
    cb();
  });
}
async function addReview(data){
  await reviewsCol.add({...data, createdAt: Date.now()});
}
async function removeReview(id){
  await reviewsCol.doc(id).delete();
}
async function updateStoreField(id, field, value){
  await storesCol.doc(id).set({[field]: value}, {merge:true});
}
async function addProduct(data){
  await productsCol.add({...data, createdAt: Date.now()});
}
async function updateProduct(id, data){
  await productsCol.doc(id).update(data);
}
async function removeProduct(id){
  await productsCol.doc(id).delete();
}

/* ============ RENDU MAGASINS ============ */
function mapsLink(store){
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Cash Boissons " + store.address);
}

function renderStores(){
  const grid = document.getElementById("storeGrid");
  grid.innerHTML = stores.map(s => `
    <article class="store-card ${s.status === 'soon' ? 'soon' : ''}">
      ${s.photo ? `<img class="store-photo" src="${s.photo}" alt="Magasin ${s.city}">` : ''}
      <span class="store-badge ${s.status === 'soon' ? 'badge-soon' : ''}">${s.status === 'soon' ? 'Ouverture prochaine' : 'Ouvert'}</span>
      <h3 class="store-city">${s.city}</h3>
      <p class="store-dept">${s.dept}</p>
      <div class="store-row"><span class="ic">📍</span><span>${s.address}</span></div>
      ${s.hours ? `<div class="store-row"><span class="ic">🕐</span><span>${s.hours}</span></div>` : ''}
      ${s.phone ? `<div class="store-row"><span class="ic">☎</span><a href="tel:${s.phone.replace(/\s/g,'')}">${s.phone}</a></div>` : `<div class="store-row store-empty"><span class="ic">☎</span><span>Fixe à venir</span></div>`}
      ${s.mobile ? `<div class="store-row"><span class="ic">📱</span><a href="tel:${s.mobile.replace(/\s/g,'')}">${s.mobile}</a></div>` : `<div class="store-row store-empty"><span class="ic">📱</span><span>Mobile à venir</span></div>`}
      <div class="store-row"><span class="ic">✉</span><a href="mailto:${s.email}">${s.email}</a></div>
      ${s.status !== 'soon' ? `<div class="store-actions"><a class="btn btn-outline-sm" target="_blank" rel="noopener" href="${mapsLink(s)}">Itinéraire →</a></div>` : ''}
    </article>
  `).join("");
}

/* ============ CATALOGUE (public) ============ */
function fillStoreFilters(){
  const filterStore = document.getElementById("filterStore");
  const checksBox = document.getElementById("pStoreChecks");
  const opts = stores.map(s => `<option value="${s.id}">${s.city}</option>`).join("");
  filterStore.innerHTML = `<option value="all">Tous les magasins</option>` + opts;

  checksBox.innerHTML = `
    <label class="store-check all">
      <input type="checkbox" id="pStoreAll"> Tous les magasins
    </label>
    ${stores.map(s => `
      <label class="store-check">
        <input type="checkbox" class="pStoreOne" value="${s.id}"> ${s.city}
      </label>
    `).join("")}
  `;

  document.getElementById("pStoreAll").addEventListener("change", e => {
    document.querySelectorAll(".pStoreOne").forEach(cb => cb.checked = e.target.checked);
  });
  document.querySelectorAll(".pStoreOne").forEach(cb => {
    cb.addEventListener("change", () => {
      const all = document.querySelectorAll(".pStoreOne");
      document.getElementById("pStoreAll").checked = Array.from(all).every(c => c.checked);
    });
  });
}

function getSelectedStores(){
  return Array.from(document.querySelectorAll(".pStoreOne:checked")).map(cb => cb.value);
}
function setSelectedStores(ids){
  document.querySelectorAll(".pStoreOne").forEach(cb => cb.checked = ids.includes(cb.value));
  document.getElementById("pStoreAll").checked = ids.length === stores.length;
}

function renderProducts(){
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("catalogueEmpty");
  const fStore = document.getElementById("filterStore").value;
  const fCat = document.getElementById("filterCat").value;
  const q = document.getElementById("searchProduct").value.trim().toLowerCase();

  const filtered = products.filter(p =>
    (fStore === "all" || (p.stores || []).includes(fStore)) &&
    (fCat === "all" || p.cat === fCat) &&
    (q === "" || p.name.toLowerCase().includes(q))
  );

  if(filtered.length === 0){
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  grid.innerHTML = filtered.map(buildProductCard).join("");
}

function buildProductCard(p){
  const storeNames = (p.stores || []).map(id => stores.find(s => s.id === id)?.city).filter(Boolean).join(", ");
  const hasPromoPrice = p.promo && p.promoPrice;
  const hasPromoLabel = p.promo && p.promoLabel;
  const priceHtml = hasPromoPrice
    ? `<span class="product-price-old">${Number(p.price).toFixed(2)} €</span><span class="product-price">${Number(p.promoPrice).toFixed(2)} €</span>`
    : `<span class="product-price">${Number(p.price).toFixed(2)} €</span>`;
  return `
    <article class="product-card">
      ${p.promo ? `<span class="promo-badge">${hasPromoLabel ? p.promoLabel : 'Promo'}</span>` : ''}
      <img class="product-img" src="${p.image || placeholderImg()}" alt="${p.name}">
      <div class="product-body">
        <span class="product-cat">${p.cat}</span>
        <p class="product-name">${p.name}</p>
        <p class="product-store">${storeNames}</p>
        <p class="product-price-line">${priceHtml}</p>
      </div>
    </article>
  `;
}

function renderPromotions(){
  const section = document.getElementById("promotions");
  const grid = document.getElementById("promoGrid");
  const promoProducts = products.filter(p => p.promo);
  if(promoProducts.length === 0){
    section.classList.add("hidden");
    grid.innerHTML = "";
    return;
  }
  section.classList.remove("hidden");
  grid.innerHTML = promoProducts.map(buildProductCard).join("");
}

function placeholderImg(){
  return "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="#173064"/>
      <text x="50%" y="50%" fill="#FFC400" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Cash Boissons</text>
    </svg>`);
}

/* ============ ADMIN — AUTH ============ */
function initAdminAuth(){
  const loginForm = document.getElementById("loginForm");
  const loginBox = document.getElementById("adminLogin");
  const panel = document.getElementById("adminPanel");
  const logoutBtn = document.getElementById("logoutBtn");

  if(sessionStorage.getItem("cb_admin_ok") === "1"){
    loginBox.classList.add("hidden");
    panel.classList.remove("hidden");
  }

  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const val = document.getElementById("adminPass").value;
    if(val === ADMIN_PASSWORD){
      sessionStorage.setItem("cb_admin_ok", "1");
      loginBox.classList.add("hidden");
      panel.classList.remove("hidden");
      renderAdminProducts();
      renderAdminStores();
      renderAdminCategories();
      renderAdminReviews();
    } else {
      alert("Mot de passe incorrect.");
    }
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("cb_admin_ok");
    panel.classList.add("hidden");
    loginBox.classList.remove("hidden");
    document.getElementById("adminPass").value = "";
  });
}

/* ============ ADMIN — TABS ============ */
function initTabs(){
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

/* ============ ADMIN — PRODUITS ============ */
function renderAdminProducts(){
  const list = document.getElementById("adminProductList");
  if(products.length === 0){
    list.innerHTML = `<p class="empty-state">Aucun produit pour le moment.</p>`;
    return;
  }
  list.innerHTML = products.map(p => {
    const storeNames = (p.stores || []).map(id => stores.find(s => s.id === id)?.city).filter(Boolean).join(", ");
    return `
      <div class="admin-list-item">
        <img src="${p.image || placeholderImg()}" alt="">
        <div class="admin-list-info">
          <strong>${p.name} — ${Number(p.price).toFixed(2)} €</strong>
          <span>${p.cat} · ${storeNames}</span>
        </div>
        <div class="admin-list-actions">
          <button class="icon-btn" title="Modifier" onclick="editProduct('${p.id}')">✎</button>
          <button class="icon-btn danger" title="Supprimer" onclick="deleteProduct('${p.id}')">✕</button>
        </div>
      </div>
    `;
  }).join("");
}

function initProductForm(){
  const form = document.getElementById("productForm");
  const cancelBtn = document.getElementById("cancelEdit");

  document.getElementById("pPromo").addEventListener("change", e => {
    document.getElementById("pPromoFields").classList.toggle("hidden", !e.target.checked);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("pName").value.trim();
    const price = document.getElementById("pPrice").value;
    const cat = document.getElementById("pCat").value;
    const storesSelected = getSelectedStores();
    const fileInput = document.getElementById("pImage");
    const promo = document.getElementById("pPromo").checked;
    const promoPrice = document.getElementById("pPromoPrice").value;
    const promoLabel = document.getElementById("pPromoLabel").value.trim();

    if(storesSelected.length === 0){
      alert("Sélectionne au moins un magasin.");
      return;
    }
    if(promo && !promoPrice && !promoLabel){
      alert("Indique un prix promo et/ou une offre spéciale (ex : 3+1).");
      return;
    }

    const commit = async (imageData) => {
      const data = {
        name, price, cat, stores: storesSelected,
        promo,
        promoPrice: promo ? promoPrice : "",
        promoLabel: promo ? promoLabel : ""
      };
      if(imageData) data.image = imageData;

      if(editingProductId){
        await updateProduct(editingProductId, data);
      } else {
        await addProduct({...data, image: imageData || ""});
      }
      form.reset();
      document.getElementById("pPromoFields").classList.add("hidden");
      editingProductId = null;
      cancelBtn.classList.add("hidden");
    };

    if(fileInput.files && fileInput.files[0]){
      const reader = new FileReader();
      reader.onload = () => commit(reader.result);
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      commit(null);
    }
  });

  cancelBtn.addEventListener("click", () => {
    form.reset();
    editingProductId = null;
    cancelBtn.classList.add("hidden");
  });
}

function editProduct(id){
  const p = products.find(x => x.id === id);
  if(!p) return;
  document.getElementById("pName").value = p.name;
  document.getElementById("pPrice").value = p.price;
  document.getElementById("pCat").value = p.cat;
  setSelectedStores(p.stores || []);
  document.getElementById("pPromo").checked = !!p.promo;
  document.getElementById("pPromoPrice").value = p.promoPrice || "";
  document.getElementById("pPromoLabel").value = p.promoLabel || "";
  document.getElementById("pPromoFields").classList.toggle("hidden", !p.promo);
  editingProductId = id;
  document.getElementById("cancelEdit").classList.remove("hidden");
  document.getElementById("tab-produits").scrollIntoView({behavior:"smooth", block:"start"});
}

function deleteProduct(id){
  if(!confirm("Supprimer ce produit du catalogue ?")) return;
  removeProduct(id);
}

/* ============ ADMIN — MAGASINS (mobile / email) ============ */
function renderAdminStores(){
  const list = document.getElementById("adminStoreList");
  const fields = [
    { key: "address", label: "Adresse", type: "text" },
    { key: "phone", label: "Téléphone fixe", type: "tel" },
    { key: "hours", label: "Horaires", type: "text" },
    { key: "mobile", label: "Téléphone portable", type: "tel" },
    { key: "email", label: "E-mail", type: "email" }
  ];

  list.innerHTML = stores.map(s => `
    <div class="admin-store-item">
      <div class="aname">${s.city}<small>${s.dept}</small><span class="save-tick" id="tick-${s.id}">Enregistré ✓</span></div>
      <div class="astore-fields">
        ${fields.map(f => `
          <label class="astore-field">${f.label}
            <input type="${f.type}" value="${s[f.key] || ''}" data-id="${s.id}" data-field="${f.key}" placeholder="${f.label}">
          </label>
        `).join("")}
        <label class="astore-field">Photo du magasin
          <input type="file" accept="image/*" class="astore-photo" data-id="${s.id}">
        </label>
        ${s.photo ? `<img src="${s.photo}" class="astore-photo-preview" alt="">` : ''}
      </div>
    </div>
  `).join("");

  list.querySelectorAll("input:not(.astore-photo)").forEach(input => {
    input.addEventListener("change", async () => {
      await updateStoreField(input.dataset.id, input.dataset.field, input.value.trim());
      const tick = document.getElementById("tick-" + input.dataset.id);
      tick.classList.add("show");
      setTimeout(() => tick.classList.remove("show"), 1500);
    });
  });

  list.querySelectorAll(".astore-photo").forEach(input => {
    input.addEventListener("change", () => {
      if(!input.files || !input.files[0]) return;
      const reader = new FileReader();
      reader.onload = async () => {
        await updateStoreField(input.dataset.id, "photo", reader.result);
        const tick = document.getElementById("tick-" + input.dataset.id);
        tick.classList.add("show");
        setTimeout(() => tick.classList.remove("show"), 1500);
      };
      reader.readAsDataURL(input.files[0]);
    });
  });
}

function renderMapLinks(){
  const box = document.getElementById("mapLinks");
  box.innerHTML = stores.filter(s => s.status !== "soon").map(s => `
    <a class="map-link-card" href="${mapsLink(s)}" target="_blank" rel="noopener">
      <span><span class="mcity">${s.city}</span><span class="mdept">${s.dept}</span></span>
      <span class="arrow">→</span>
    </a>
  `).join("");
}

let leafletMap = null;
function renderStoreMap(){
  if(typeof L === "undefined") return;
  const withCoords = stores.filter(s => s.lat && s.lng);
  if(withCoords.length === 0) return;

  const cbIcon = L.icon({
    iconUrl: "logo-mark.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
    className: "cb-marker"
  });

  if(!leafletMap){
    leafletMap = L.map("storeMap", { scrollWheelZoom: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap, © CARTO",
      maxZoom: 19
    }).addTo(leafletMap);
    leafletMap.markersLayer = L.layerGroup().addTo(leafletMap);
  }

  leafletMap.markersLayer.clearLayers();
  const bounds = [];
  withCoords.forEach(s => {
    bounds.push([s.lat, s.lng]);
    L.marker([s.lat, s.lng], { icon: cbIcon })
      .addTo(leafletMap.markersLayer)
      .bindPopup(`
        <div class="map-popup">
          <strong>${s.city}${s.status === 'soon' ? ' (bientôt)' : ''}</strong>
          <span>${s.address}</span>
          <a href="${mapsLink(s)}" target="_blank" rel="noopener">Itinéraire →</a>
        </div>
      `);
  });
  leafletMap.fitBounds(bounds, { padding: [30, 30] });
}

function fillCategorySelects(){
  const filterCat = document.getElementById("filterCat");
  const pCat = document.getElementById("pCat");
  const prevFilter = filterCat.value;
  const prevP = pCat.value;
  const opts = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
  filterCat.innerHTML = `<option value="all">Toutes les catégories</option>` + opts;
  pCat.innerHTML = opts;
  if(categories.some(c => c.name === prevFilter)) filterCat.value = prevFilter;
  if(categories.some(c => c.name === prevP)) pCat.value = prevP;
}

function renderAdminCategories(){
  const list = document.getElementById("adminCategoryList");
  if(categories.length === 0){
    list.innerHTML = `<p class="empty-state">Aucune catégorie pour le moment.</p>`;
    return;
  }
  list.innerHTML = categories.map(c => `
    <div class="admin-list-item">
      <div class="admin-list-info"><strong>${c.name}</strong></div>
      <div class="admin-list-actions">
        <button class="icon-btn danger" title="Supprimer" onclick="onDeleteCategory('${c.id}')">✕</button>
      </div>
    </div>
  `).join("");
}

function onDeleteCategory(id){
  if(!confirm("Supprimer cette catégorie ? Les produits déjà classés dedans garderont son nom.")) return;
  removeCategory(id);
}

function initCategoryForm(){
  const form = document.getElementById("categoryForm");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const input = document.getElementById("catName");
    const name = input.value.trim();
    if(!name) return;
    if(categories.some(c => c.name.toLowerCase() === name.toLowerCase())){
      alert("Cette catégorie existe déjà.");
      return;
    }
    await addCategory(name);
    form.reset();
  });
}

/* ============ AVIS CLIENTS ============ */
function renderReviews(){
  const grid = document.getElementById("reviewGrid");
  const empty = document.getElementById("reviewsEmpty");
  if(reviews.length === 0){
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  grid.innerHTML = reviews.map(r => `
    <article class="review-card">
      <div class="review-stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
      <p class="review-comment">${r.comment}</p>
      <p class="review-name">— ${r.name}</p>
    </article>
  `).join("");
}

function renderAdminReviews(){
  const list = document.getElementById("adminReviewList");
  if(reviews.length === 0){
    list.innerHTML = `<p class="empty-state">Aucun avis pour le moment.</p>`;
    return;
  }
  list.innerHTML = reviews.map(r => `
    <div class="admin-list-item">
      <div class="admin-list-info">
        <strong>${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)} — ${r.name}</strong>
        <span>${r.comment}</span>
      </div>
      <div class="admin-list-actions">
        <button class="icon-btn danger" title="Supprimer" onclick="onDeleteReview('${r.id}')">✕</button>
      </div>
    </div>
  `).join("");
}

function onDeleteReview(id){
  if(!confirm("Supprimer cet avis ?")) return;
  removeReview(id);
}

function initReviewForm(){
  const form = document.getElementById("reviewForm");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("rName").value.trim();
    const stars = Number(document.getElementById("rStars").value);
    const comment = document.getElementById("rComment").value.trim();
    await addReview({name, stars, comment});
    form.reset();
  });

  const publicForm = document.getElementById("publicReviewForm");
  publicForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("prName").value.trim();
    const stars = Number(document.getElementById("prStars").value);
    const comment = document.getElementById("prComment").value.trim();
    await addReview({name, stars, comment});
    publicForm.reset();
  });
}

/* ============ NAV MOBILE ============ */
function initNav(){
  const burger = document.getElementById("burgerBtn");
  const nav = document.getElementById("mainNav");
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}

/* ============ INIT ============ */
document.addEventListener("DOMContentLoaded", async () => {
  await seedStoresIfEmpty();
  await seedCategoriesIfEmpty();

  listenStores(() => {
    renderStores();
    renderMapLinks();
    renderStoreMap();
    fillStoreFilters();
    renderProducts();
    renderPromotions();
    if(document.getElementById("adminPanel").classList.contains("hidden") === false){
      renderAdminStores();
    }
  });

  listenProducts(() => {
    renderProducts();
    renderPromotions();
    if(document.getElementById("adminPanel").classList.contains("hidden") === false){
      renderAdminProducts();
    }
  });

  listenCategories(() => {
    fillCategorySelects();
    renderProducts();
    renderPromotions();
    if(document.getElementById("adminPanel").classList.contains("hidden") === false){
      renderAdminCategories();
    }
  });

  listenReviews(() => {
    renderReviews();
    if(document.getElementById("adminPanel").classList.contains("hidden") === false){
      renderAdminReviews();
    }
  });

  initAdminAuth();
  initTabs();
  initProductForm();
  initCategoryForm();
  initReviewForm();
  initNav();

  document.getElementById("filterStore").addEventListener("change", renderProducts);
  document.getElementById("filterCat").addEventListener("change", renderProducts);
  document.getElementById("searchProduct").addEventListener("input", renderProducts);
});
