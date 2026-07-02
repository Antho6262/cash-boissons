# CONTEXTE PROJET — Site Cash Boissons

Dernière mise à jour : réseaux sociaux dans le footer (liens # à remplacer par les vraies URLs), barre de recherche produit dans le catalogue, photos réelles des magasins (upload dans l'espace pro, onglet Coordonnées magasins, affichées sur les cartes magasins). Reste à faire plus tard : commande en ligne avec retrait en magasin.

## Fichiers du site (tous à la racine du repo, PAS de sous-dossier images)
- index.html
- style.css
- script.js
- firebase-config.js
- logo-full.png
- logo-mark.png

## Hébergement
- GitHub Pages
- Repo : Antho6262/cash-boissons — branche main
- Settings > Pages > Source : main / (root)
- URL : https://antho6262.github.io/cash-boissons/

## Base de données
- Firebase Firestore, projet "cash-boissons"
- Config déjà collée dans firebase-config.js
- Règles Firestore ouvertes jusqu'au 31/12/2026 (à renouveler après)
- Collections : "stores" (magasins), "products" (catalogue), "categories" (catégories produits)

## Accès admin
- Bouton "Espace pro" sur le site
- Mot de passe : cashboissons62 (modifiable dans script.js, variable ADMIN_PASSWORD)

## Magasins en base (7)
1. Bruay-la-Buissière — 45 Avenue de la Libération, 62700 — 03 21 68 57 28 — bruay@cash-boissons.com — ouvert
2. Loos-en-Gohelle — 1 Route de Béthune, 62750 — 09 66 93 43 77 — loos@cash-boissons.com — ouvert
3. Auchy-les-Mines — 150 Route Nationale, 62138 — 09 67 49 56 17 — auchy@cash-boissons.com — ouvert
4. Lambres-lez-Douai — 279 Rue Jacqueline Auriol, 59552 — 09 67 40 20 39 — lambres@cash-boissons.com — ouvert
5. Cambrai — 2095 Avenue de Paris, 59400 — 03 27 72 15 21 — cambrai@cash-boissons.com — ouvert
6. Avranches — Rue Victor Lemarchand, 50300 Saint-Senier-sous-Avranches — fixe non trouvé — avranches@cash-boissons.com — ouvert
7. Noyelles-Godault — adresse à venir — noyellesgodault@cash-boissons.com — bientôt

Tous les champs (adresse, fixe, horaires, mobile, email) éditables librement dans l'espace pro (onglet "Coordonnées magasins").

## Horaires (affichés sur les cartes magasins)
Bruay, Loos-en-Gohelle, Auchy, Lambres-lez-Douai, Cambrai : du mardi au samedi, 9h30-12h30 et 14h-19h
Avranches et Noyelles-Godault : pas d'horaires renseignés

## Catégories par défaut (modifiables/supprimables dans l'espace pro)
Bières, Vins, Spiritueux, Softs / Eaux, Paniers garnis

## Fonctionnalités en place
- Hero (logo agrandi en header) + stats + grille des 7 magasins avec fixe/mobile/email/itinéraire Google Maps
- Section "Carte" : liens itinéraire par magasin
- Catalogue public filtrable par magasin et catégorie
- Espace pro (protégé par mot de passe), 3 onglets :
  - Catalogue produits : ajout/édition/suppression (nom, prix, catégorie, magasins concernés en multi-sélection avec "Tous les magasins", photo)
  - Catégories : ajout/suppression libre de catégories, utilisées dans le formulaire produit et le filtre catalogue
  - Coordonnées magasins : édition mobile + email par magasin
- Section "Services" (statique) : location pompe à bière, location bar, livraison offerte dès 250€ (rayon 20km)
- Système de promotions : case "En promotion" → deux champs facultatifs : prix promo (affiche prix barré) et/ou offre spéciale en texte libre type "3+1" (affichée en badge) ; visible dans le catalogue et dans une section "Promotions" dédiée en haut de page (masquée s'il n'y a aucune promo)
- Données synchronisées en temps réel via Firestore (visible sur tous les appareils)
- Logos jaunes intégrés (header agrandi, footer, watermark hero) — jamais sur fond blanc/noir

## Dépendances externes
- Leaflet.js (via unpkg.com, CDN gratuit, pas de clé API) pour la carte interactive
- Fond de carte CartoDB "dark_all" (gratuit, sans clé)
- Coordonnées lat/lng des magasins : approximatives au niveau ville (pas l'adresse exacte)

## Git pour déployer une modif
cd "C:\Users\amalh\Desktop\Cash Boissons"
git add .
git commit -m "maj site"
git push
