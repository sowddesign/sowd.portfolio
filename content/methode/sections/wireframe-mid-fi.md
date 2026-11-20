---
# MÉTHODE — PAGE « WIREFRAME MID-FI »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/wireframe-mid-fi/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - afiner
  - tester
  - structure
  - piste
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\darker_05.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/500
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 122.0, x: 0.0, y: -9.3 }
image_mobile: { taille: 125.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: mid-fi
    desktop: { x: 81.3, y: 40.8 }
    mobile: { x: 79.5, y: 41.3 }
  - texte: wireframes
    desktop: { x: 39.7, y: 22.0 }
    mobile: { x: 36.8, y: 22.8 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Un wireframe mid-fi, ou de **[moyenne fidélité]{dark}**, ajoute de la structure et du détail au croquis : des libellés réalistes, une hiérarchie affinée et des composants identifiés (les éléments réutilisables comme les boutons ou les menus). Il reste neutre graphiquement, sans couleurs ni visuels riches.

  Il fait le lien entre l’exploration en basse fidélité, comme le wireframe papier, et les maquettes haute fidélité (proches du rendu final) ou les prototypes interactifs.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: graine
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/sections/recherches-quantitatives.md, plus :
#   || inverse               → colonne de droite au-dessus en mobile
#
# Mobile (pas de maquette Figma, choix de l'utilisateur) : texte avant l'écran (« || inverse »),
# deux pistes empilées.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Un écran comme terrain d’essai

Lors du projet [graine](/projects/graine), j’ai conçu sur Figma un wireframe de moyenne fidélité de la **[fiche plante]{dark}**. Il a ensuite servi de base pour tester plusieurs directions artistiques.

*La fiche plante a été choisie parce qu’elle concentre l’essentiel de l’application : la photo, le niveau de la plante, sa progression et ses besoins d’entretien.*

## Niveaux de gris

![Wireframe mid-fi en niveaux de gris de la fiche plante de graine](fiche-plante-gris.webp)

|| inverse

Cet écran central m’a permis de tester les typographies, les icônes et la hiérarchie des informations.

**[Sans couleur]{dark}**, l’attention se porte sur le placement des éléments et sur des détails que la couleur aurait pu masquer.

## Plusieurs pistes de direction artistique

La direction artistique n’était pas encore définie. La **[même structure]{dark}** m’a permis d’essayer plusieurs pistes, posées par-dessus le wireframe, sans redessiner l’écran.

---

<<

![Fiche plante de graine dans une piste photographique : capucine, photo de fleur en en-tête](fiche-plante-photo.webp)

> Une piste photographique brute, peu concluante : nos concurrents montrent déjà tous la plante en photo, telle qu’elle est.

||

![Fiche plante de graine dans une piste illustrée : capucine, en-tête orange découpé en formes](fiche-plante-illustree.webp)

> Une piste « stickers », plus convaincante : des photos découpées comme des autocollants, pour une direction artistique forte qui nous démarque.

>>

## Ce que cela a apporté

En figeant la structure en niveaux de gris, j’ai pu comparer les directions artistiques sur une **[base commune]{dark}** et choisir en connaissance de cause. La piste stickers a ensuite été déclinée sur toute l’application.
