---
# MÉTHODE — PAGE « ARBORESCENCE »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/arborescence/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\darker_03.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/500
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 124.9, x: 0.0, y: 0.0 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: arborescence
    desktop: { x: 69.8, y: 58.4 }
    mobile: { x: 69.3, y: 60.0 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  L’arborescence correspond à la structure hiérarchique des contenus et fonctionnalités (information architecture) qui organise la navigation et les chemins d’accès dans une interface.

  Cette structure peut ensuite être validée par un tree testing : on demande à des utilisateurs de retrouver un contenu dans l’arborescence, sans interface, pour vérifier qu’elle est intuitive.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: graine
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md, plus :
#   a. texte                 → élément numéroté par une lettre
#   ![description](desktop.webp | extrait-1.webp + extrait-2.webp) → en mobile et tablette petite : extraits
#                              empilés à la place de l'image
#   ![description](fichier.webp){sans cadre} → image sans bordure ni coins
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Objectif

Lors du projet [graine](/projects/graine), nous devions concevoir une application complète. Avant de maquetter, nous avons dessiné son arborescence générale.

*L’objectif : mettre à plat toutes les fonctionnalités et voir comment elles s’articulent entre elles.*

## Différencier les pages

Nous avons classé les pages selon deux critères :

---

**Le point d’accès**

1. Accessibles depuis l’en-tête (header)
2. Accessibles depuis la barre de navigation (nav bar)

---

**Le niveau**

a. Accessible directement (niveau 1)
b. Accessible depuis au moins une page parente (niveau 2)

---

*Ce double classement nous a permis de réserver la barre de navigation aux pages les plus utilisées, et de savoir combien de clics séparaient l’utilisateur de chaque fonctionnalité.*

## Décortiquer une page

Pour chaque page, nous avons d’abord listé ses fonctionnalités. Les liens avec les autres pages en découlaient, parfois de façon évidente, parfois moins.

---

*Prenons l’exemple de la page de niveau 1 – Photo.*

---

**Fonctionnalités :**

- Tout ce qui sert à la prise de vue (zoom, flash, mode paysage, déclencheur). *Ces éléments doivent déjà être prévus à l’écran.*
- Accès à la pellicule. *Identifié plus tard : il faudra une pop-up qui demande cet accès.*
- Historique des scans précédents.
- Aide pour prendre une bonne photo.

---

**Liens vers les pages identifiés :**

- La photo, une fois prise.
- La page d’historiques.
- La pop-up de demande d’accès.
- La pop-up d’aide à la prise de photo.

---

*Ce premier bloc sert de modèle : on répète l’exercice pour chaque page de l’application.*

---

![Extrait de l’arborescence de graine : la page Photo, ses fonctionnalités et ses liens vers d’autres pages](page-photo.webp | page-photo-mobile-1.webp + page-photo-mobile-2.webp){sans cadre}

> Extrait de l’arborescence : page « Photo » (documentation graine).

## Ce que l’arborescence a apporté

Pour chaque page, nous avons d’abord listé ses fonctionnalités. Les liens avec les autres pages en découlaient, parfois de façon évidente, parfois moins.

---

*Ce double classement nous a permis de réserver la barre de navigation aux pages les plus utilisées, et de savoir combien de clics séparaient l’utilisateur de chaque fonctionnalité.*
