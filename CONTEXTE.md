# CONTEXTE PROJET — Site Cash Boissons

Dernière mise à jour : espace pro totalement invisible pour un visiteur normal — la section est en display:none par défaut et ne se révèle que si l'URL contient le hash secret #gestion-cb2026. Plus aucun lien ni point cliquable dans le site n'y mène.

## Accès admin
- URL secrète : https://antho6262.github.io/cash-boissons/#gestion-cb2026
- Hash modifiable dans script.js, variable ADMIN_SECRET_HASH (début du DOMContentLoaded)
- Mot de passe une fois la section visible : cashboissons62 (variable ADMIN_PASSWORD)
- Si tu partages le lien du site normalement (sans le hash), personne ne voit ni ne peut deviner que l'espace pro existe

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
- Collections : "stores", "products", "categories", "reviews", "orders"

## Magasins en base (7)
1. Bruay-la-Buissière — 45 Avenue de la Libération, 62700 — 03 21 68 57 28 — bruay@cash-boissons.com — ouvert
2. Loos-en-Gohelle — 1 Route de Béthune, 62750 — 09 66 93 43 77 — loos@cash-boissons.com — ouvert
3. Auchy-les-Mines — 150 Route Nationale, 62138 — 09 67 49 56 17 — auchy@cash-boissons.com — ouvert
4. Lambres-lez-Douai — 279 Rue Jacqueline Auriol, 59552 — 09 67 40 20 39 — lambres@cash-boissons.com — ouvert
5. Cambrai — 2095 Avenue de Paris, 59400 — 03 27 72 15 21 — cambrai@cash-boissons.com — ouvert
6. Avranches — Rue Victor Lemarchand, 50300 Saint-Senier-sous-Avranches — fixe non trouvé — avranches@cash-boissons.com — ouvert
7. Noyelles-Godault — adresse à venir — noyellesgodault@cash-boissons.com — bientôt (statut modifiable dans l'espace pro)

Tous les champs (adresse, fixe, horaires, mobile, email, statut, photo) éditables librement dans l'espace pro, onglet "Coordonnées magasins".

## Horaires
Bruay, Loos-en-Gohelle, Auchy, Lambres-lez-Douai, Cambrai : du mardi au samedi, 9h30-12h30 et 14h-19h
Avranches et Noyelles-Godault : pas d'horaires renseignés

## Catégories par défaut (modifiables/supprimables dans l'espace pro)
Bières, Vins, Spiritueux, Softs / Eaux, Paniers garnis

## Fonctionnalités en place
- Hero (logo à la place du texte eyebrow) + stats + grille des 7 magasins avec photo/fixe/mobile/email/horaires/itinéraire
- Monogramme C en puce devant les petits labels de section
- Section "Carte" interactive (Leaflet + CartoDB, marqueurs = logo C, clustering des pins proches) + liste de liens
- Section "Services" : location pompe à bière, location bar, livraison offerte dès 250€ (rayon 20km)
- Simulateur "combien de bouteilles/fûts pour X invités" (nombre d'invités/2 = buveurs de bière, pas de champ durée)
- Devis instantané location pompe/bar : choix magasin + fûts de bière (conditionnement contenant "fût") + n'importe quel produit du catalogue ajouté manuellement (select + quantité) + case bar optionnelle, pompe toujours offerte, total, téléchargement PDF (logo + infos magasin + produits/prix)
- Catalogue public filtrable par magasin/catégorie + barre de recherche produit (consultation seule, pas de commande en ligne)
- Produits avec conditionnements multiples (Unité, Fardeau de 24...)
- Système de promotions : prix promo et/ou offre texte libre (ex "3+1"), badge + section "Promotions" dédiée
- Avis clients : formulaire public (étoiles + commentaire) + gestion/suppression dans l'espace pro
- Réseaux sociaux dans le footer (liens # à remplacer par les vraies URLs)
- Import Excel/CSV des exports Prismasoft dans l'onglet Catalogue produits (colonnes : nom, prix, catégorie, conditionnement) — produits assignés au premier magasin par défaut
- Espace pro (4 onglets, accès invisible sauf URL secrète) : Catalogue produits, Catégories, Avis clients, Coordonnées magasins
- Données synchronisées en temps réel via Firestore (visible sur tous les appareils)
- Logos jaunes intégrés partout — jamais sur fond blanc/noir

## Fonctionnalités retirées
- Panier + commande en ligne (retrait en magasin) : entièrement supprimé (bouton panier, drawer, formulaire checkout, collection Firestore "orders", onglet admin "Commandes"). La collection "orders" reste en base Firestore mais n'est plus utilisée par le site.

## Dépendances externes
- Leaflet.js + Leaflet.markercluster (via unpkg.com, CDN gratuit, pas de clé API)
- Fond de carte CartoDB "dark_all" (gratuit, sans clé) — OSM standard et OSM France testés mais renvoyaient des tuiles grises une fois déployés
- SheetJS/xlsx (via unpkg.com) pour l'import Excel/CSV
- Coordonnées lat/lng des magasins : approximatives au niveau ville

### Simulateur boissons
- Champ "Durée (heures)" supprimé
- Calcul basé sur nombre d'invités / 2 = buveurs de bière (1.5 L/buveur estimé)

### Devis location pompe / bar (refonte)
- Cartes services "Pompe" et "Bar" cliquables → scroll vers l'outil de devis
- Sélection d'un magasin
- Liste des fûts de bière disponibles (produits catégorie "Bières", conditionnement contenant "fût") filtrés par magasin, avec quantité à choisir
- Case à cocher optionnelle "bar complet"
- Devis affiché : détail produits/prix, "Pompe à bière : offerte", "Bar complet : offert, inclus" ou "non sélectionné", total
- Bouton "Télécharger le devis" → PDF (logo Cash Boissons + infos magasin + produits/prix + total), via jsPDF (CDN unpkg, ajouté dans index.html)
- IMPORTANT : un fût n'apparaît dans le devis que si son libellé de conditionnement contient "fût" (ex: "Fût 30L")

cd "C:\Users\amalh\Desktop\Cash Boissons"
git add .
git commit -m "maj site"
git push
