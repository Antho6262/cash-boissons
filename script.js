/* ============ DONNÉES MAGASINS ============ */
/* Sources : fiches officielles / annuaires pros (adresses & fixes vérifiés).
   mobile : vide, à compléter dans l'espace pro.
   email  : format standard ville@cash-boissons.com (modifiable dans l'espace pro). */
const DEFAULT_STORES = [
  {
    id: "bruay",
    city: "Bruay-la-Buissière",
    dept: "62 — Pas-de-Calais",
    address: "45 Avenue de la Libération, 62700 Bruay-la-Buissière",
    phone: "03 21 68 57 28",
    mobile: "",
    email: "bruay@cash-boissons.com",
    status: "open"
  },
  {
    id: "loos",
    city: "Loos-en-Gohelle",
    dept: "62 — Pas-de-Calais",
    address: "1 Route de Béthune, 62750 Loos-en-Gohelle",
    phone: "09 66 93 43 77",
    mobile: "",
    email: "loos@cash-boissons.com",
    status: "open"
  },
  {
    id: "auchy",
    city: "Auchy-les-Mines",
    dept: "62 — Pas-de-Calais",
    address: "150 Route Nationale, 62138 Auchy-les-Mines",
    phone: "09 67 49 56 17",
    mobile: "",
    email: "auchy@cash-boissons.com",
    status: "open"
  },
  {
    id: "lambres",
    city: "Lambres-lez-Douai",
    dept: "59 — Nord",
    address: "279 Rue Jacqueline Auriol, 59552 Lambres-lez-Douai",
    phone: "09 67 40 20 39",
    mobile: "",
    email: "lambres@cash-boissons.com",
    status: "open"
  },
  {
    id: "cambrai",
    city: "Cambrai",
    dept: "59 — Nord",
    address: "2095 Avenue de Paris, 59400 Cambrai",
    phone: "03 27 72 15 21",
    mobile: "",
    email: "cambrai@cash-boissons.com",
    status: "open"
  },
  {
    id: "avranches",
    city: "Avranches",
    dept: "50 — Manche",
    address: "Rue Victor Lemarchand, 50300 Saint-Senier-sous-Avranches",
    phone: "",
    mobile: "",
    email: "avranches@cash-boissons.com",
    status: "open"
  },
  {
    id: "noyellesgodault",
    city: "Noyelles-Godault",
    dept: "62 — Pas-de-Calais",
    address: "Adresse à venir",
    phone: "",
    mobile: "",
    email: "noyellesgodault@cash-boissons.com",
    status: "soon"
  }
];

const ADMIN_PASSWORD = "cashboissons62"; // à personnaliser

/* ============ FIREBASE ============ */
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storesCol = db.collection("stores");
const productsCol = db.collection("products");

let stores = structuredClone(DEFAULT_STORES);
let products = [];
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
      <span class="store-badge ${s.status === 'soon' ? 'badge-soon' : ''}">${s.status === 'soon' ? 'Ouverture prochaine' : 'Ouvert'}</span>
      <h3 class="store-city">${s.city}</h3>
      <p class="store-dept">${s.dept}</p>
      <div class="store-row"><span class="ic">📍</span><span>${s.address}</span></div>
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
  const pStore = document.getElementById("pStore");
  const opts = stores.map(s => `<option value="${s.id}">${s.city}</option>`).join("");
  filterStore.innerHTML = `<option value="all">Tous les magasins</option>` + opts;
  pStore.innerHTML = opts;
}

function renderProducts(){
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("catalogueEmpty");
  const fStore = document.getElementById("filterStore").value;
  const fCat = document.getElementById("filterCat").value;

  const filtered = products.filter(p =>
    (fStore === "all" || p.store === fStore) &&
    (fCat === "all" || p.cat === fCat)
  );

  if(filtered.length === 0){
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  grid.innerHTML = filtered.map(p => {
    const storeName = stores.find(s => s.id === p.store)?.city || "";
    return `
      <article class="product-card">
        <img class="product-img" src="${p.image || placeholderImg()}" alt="${p.name}">
        <div class="product-body">
          <span class="product-cat">${p.cat}</span>
          <p class="product-name">${p.name}</p>
          <p class="product-store">${storeName}</p>
          <p class="product-price">${Number(p.price).toFixed(2)} €</p>
        </div>
      </article>
    `;
  }).join("");
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
    const storeName = stores.find(s => s.id === p.store)?.city || "";
    return `
      <div class="admin-list-item">
        <img src="${p.image || placeholderImg()}" alt="">
        <div class="admin-list-info">
          <strong>${p.name} — ${Number(p.price).toFixed(2)} €</strong>
          <span>${p.cat} · ${storeName}</span>
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

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("pName").value.trim();
    const price = document.getElementById("pPrice").value;
    const cat = document.getElementById("pCat").value;
    const store = document.getElementById("pStore").value;
    const fileInput = document.getElementById("pImage");

    const commit = async (imageData) => {
      const data = { name, price, cat, store };
      if(imageData) data.image = imageData;

      if(editingProductId){
        await updateProduct(editingProductId, data);
      } else {
        await addProduct({...data, image: imageData || ""});
      }
      form.reset();
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
  document.getElementById("pStore").value = p.store;
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
  list.innerHTML = stores.map(s => `
    <div class="admin-store-item">
      <div class="aname">${s.city}<small>${s.address}</small></div>
      <input type="tel" placeholder="Téléphone portable" value="${s.mobile}" data-id="${s.id}" data-field="mobile">
      <input type="email" placeholder="E-mail" value="${s.email}" data-id="${s.id}" data-field="email">
      <span class="save-tick" id="tick-${s.id}">Enregistré ✓</span>
    </div>
  `).join("");

  list.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", async () => {
      await updateStoreField(input.dataset.id, input.dataset.field, input.value.trim());
      const tick = document.getElementById("tick-" + input.dataset.id);
      tick.classList.add("show");
      setTimeout(() => tick.classList.remove("show"), 1500);
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

  listenStores(() => {
    renderStores();
    renderMapLinks();
    fillStoreFilters();
    renderProducts();
    if(document.getElementById("adminPanel").classList.contains("hidden") === false){
      renderAdminStores();
    }
  });

  listenProducts(() => {
    renderProducts();
    if(document.getElementById("adminPanel").classList.contains("hidden") === false){
      renderAdminProducts();
    }
  });

  initAdminAuth();
  initTabs();
  initProductForm();
  initNav();

  document.getElementById("filterStore").addEventListener("change", renderProducts);
  document.getElementById("filterCat").addEventListener("change", renderProducts);
});
