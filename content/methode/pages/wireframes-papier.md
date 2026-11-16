---
# MÉTHODE — PAGE « WIREFRAMES PAPIER »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/wireframes-papier/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\darker_04.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/500
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 147.1, x: 0.0, y: -7.5 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: wireframes
    desktop: { x: 40.3, y: 11.1, rotation: -3.1 }
    mobile: { x: 40.8, y: 8.9, rotation: -3.1 }
  - texte: papier
    desktop: { x: 62.8, y: 46.8 }
    mobile: { x: 63.1, y: 80.7 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Le wireframe papier représente une interface en très basse fidélité, dessinée ou assemblée à la main à partir de découpes, sans passer par un logiciel.

  Il se concentre sur le « quoi » et le « où » (éléments, navigation, fonctionnalités) plutôt que sur le « look & feel ». On explore ainsi rapidement la structure, la hiérarchie des contenus et les parcours, et on itère très tôt à partir des besoins identifiés pendant la recherche.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: scholar
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Première version papier

Lors du projet [Scholar](/projects/scholar), j’ai préféré itérer sur papier avant d’ouvrir Figma. Grâce au benchmark mené en amont, j’avais déjà beaucoup de matière : des écrans, un parcours, mais aussi des idées d’interactions et d’animations.

> Dessiner à la main m’a permis de poser tout le parcours d’un coup, sans me laisser freiner par l’outil.

## D’une interface au parcours complet

En une seule planche, j’ai dessiné l’ensemble de l’onboarding, du premier écran jusqu’au test de niveau.

---

![Planche de wireframes papier de Scholar dessinée au stylo : écrans d’onboarding, de test de niveau et d’accueil](planche-scholar.webp)

> Planche de wireframes papier de Scholar : l’onboarding (ligne du haut), le test de niveau (lignes du milieu) et l’écran d’accueil (en bas à gauche).

---

#### L’onboarding

Accueil, consentement, puis une série de questions pour connaître l’utilisateur : qui il est, ce qu’il veut apprendre, son niveau estimé et le temps qu’il souhaite consacrer à chaque session.

---

#### Le test de niveau

Des questions à choix multiple ou à saisie libre. Après chaque réponse, un écran d’explication indique si elle est juste et pourquoi.

---

#### Les premières idées graphiques

Sur l’écran d’accueil, j’ai noté des pistes pour la direction artistique : une illustration à l’encre, la mise en avant de la typographie étudiée, un chargement animé autour des lettres.

La barre de navigation y est aussi dessinée : cours, suivi de progression, collection, communauté et profil.

## Ce que cela a apporté

Le papier m’a permis de valider l’enchaînement des écrans avant de passer sur Figma. Les maquettes ont ensuite repris cette structure, en se concentrant sur l’interface et la direction artistique.
