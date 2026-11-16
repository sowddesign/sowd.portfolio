---
# MÉTHODE — PAGE « WIREFRAME MID-FI »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/wireframe-mid-fi/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
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
    desktop: { x: 80.4, y: 40.8 }
    mobile: { x: 79.5, y: 41.3 }
  - texte: wireframes
    desktop: { x: 35.8, y: 22.0 }
    mobile: { x: 36.8, y: 22.8 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Un wireframe mid-fi (moyenne fidélité) ajoute de la structure et du détail au croquis : des libellés réalistes, une hiérarchie affinée et des composants identifiés. Il reste neutre graphiquement, sans couleurs ni visuels riches.

  Il fait le pont entre l’exploration low-fi, comme le wireframe papier, et les maquettes haute fidélité ou les prototypes interactifs.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: graine
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md, plus :
#   || inverse               → colonne de droite au-dessus en mobile
#
# Mobile (pas de maquette Figma, choix de l'utilisateur) : texte avant l'écran (« || inverse »),
# deux pistes empilées.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Un écran comme terrain d’essai

Lors du projet [graine](/projects/graine), j’ai conçu sur Figma un wireframe de moyenne fidélité de la fiche plante. Il a ensuite servi de base pour tester plusieurs directions artistiques.

> La fiche plante a été choisie parce qu’elle concentre l’essentiel de l’application : la photo, le niveau de la plante, sa progression et ses besoins d’entretien.

## Niveaux de gris

![Wireframe mid-fi en niveaux de gris de la fiche plante de graine](fiche-plante-gris.webp)

|| inverse

Cet écran central de l’application m’a permis de tester les typographies, les icônes et la hiérarchie des informations.

Sans couleur, l’attention se porte sur le placement des éléments et sur des détails que la couleur aurait pu masquer.

## Plusieurs pistes de direction artistique

La direction artistique n’était pas encore définie. La même structure m’a permis d’essayer plusieurs pistes sans redessiner l’écran.

---

<<

![Fiche plante de graine dans une piste photographique : capucine, photo de fleur en en-tête](fiche-plante-photo.webp)

Une piste photographique, peu concluante.

||

![Fiche plante de graine dans une piste illustrée : capucine, en-tête orange découpé en formes](fiche-plante-illustree.webp)

Une piste illustrée, plus convaincante.

*Cette version a été déclinée sur le reste de l’application.*

>>

## Ce que cela a apporté

En figeant la structure en niveaux de gris, j’ai pu comparer les directions artistiques sur une base commune et choisir en connaissance de cause. La piste retenue a ensuite été déclinée sur toute l’application.
