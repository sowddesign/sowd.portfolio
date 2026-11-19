---
# MÉTHODE — PAGE « DESIGN D'INTERACTION »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/design-interaction/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\bright_02.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/300
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 139.2, x: 5.3, y: -17.0 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: design
    desktop: { x: 33.1, y: 31.2 }
    mobile: { x: 32.3, y: 28.8 }
  - texte: "d’interaction"
    desktop: { x: 61.2, y: 22.5 }
    mobile: { x: 65.0, y: 21.0 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Le design d’interaction est une pratique consistant à concevoir les comportements des interfaces. Il définit comment elles réagissent aux actions des utilisateurs et comment elles les guident dans leur parcours.

  Il s’appuie sur des micro-interactions, des feedbacks, des transitions, du son, des mouvements et d’autres signaux. Ces éléments rendent l’interface plus lisible, plus prévisible et plus agréable à utiliser.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: portfolio
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md (images PNG, JPEG, WebP ou GIF).
#
# Mobile (pas de maquette Figma, choix de l'utilisateur) : captures du survol et écrans de l'appui long
# empilés ; bandeau animé en pleine largeur.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Un portfolio qui se découvre

Pour créer ce [Portfolio](/projects/portfolio), j’ai conçu un système d’interactions qui fait participer le visiteur au lieu de le laisser seulement lire, dans le but de stimuler sa curiosité.

*Pour chaque page, je testais au moins deux versions, parfois trois, avant de retenir la plus efficace.*

## Un système récurrent

Certains éléments sont masqués au premier abord, mais se révèlent facilement : au survol sur ordinateur, par un appui long sur mobile.

### Sur ordinateur : le survol

![Page d’accueil du portfolio : le double diamant en noir et blanc, deux tournesols](survol-accueil.webp)

---

![Survol du titre « double diamant » : le curseur s’approche du schéma](survol-titre.webp)

||

![Survol de « problème » : le premier tournesol retrouve ses couleurs et son explication s’affiche](survol-probleme.webp)

---

Le double diamant est placé sur le chemin du défilement : le passage de la souris est presque inévitable.

*En survolant, le visiteur révèle les couleurs, le schéma et les explications, et comprend que d’autres éléments du site réagissent de la même façon.*

### Sur mobile : l’appui long

![Page Recherches quantitatives sur mobile : la loupe en noir et blanc et l’indication « Reste appuyé »](appui-long-avant.webp)

||

![Page Recherches quantitatives sur mobile après l’appui long : la loupe en couleurs et ses mots-clés](appui-long-apres.webp)

---

Sans survol possible, l’appui long prend le relais. L’élément, d’abord en noir et blanc, retrouve ses couleurs et révèle des mots-clés.

*Une indication incite au premier appui. Une fois le geste compris, il se réutilise partout sur le site.*

## Guider le comportement

Certains éléments sont conçus pour inciter à une action : de petites animations jouent le rôle d’appels à l’action (CTA).

---

![Feuilles de tournesol animées qui invitent au survol ou à l’appui long](feuilles-animees.gif)

---

*Ici, les feuilles s’animent pour inviter à survoler, ou à maintenir l’appui et révéler des informations cachées.*

## Ce que cela a apporté

Un même geste, appris une fois, se réutilise sur tout le site : la découverte devient un réflexe plutôt qu’un effort. Le visiteur s’implique davantage dans la lecture, sans que l’information essentielle ne soit jamais cachée.
