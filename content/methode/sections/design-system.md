---
# MÉTHODE — PAGE « DESIGN SYSTEM »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/design-system/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - mutualiser
  - maintenir
  - variables
  - composants
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\bright_01.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/300
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 107.0, x: 0.0, y: -4.8 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: design
    desktop: { x: 33.5, y: 86.4 }
    mobile: { x: 32.3, y: 87.5 }
  - texte: system
    desktop: { x: 65.0, y: 86.4 }
    mobile: { x: 66.2, y: 87.5 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Un design system est la référence commune d'un produit. Il réunit les variables (couleurs, typographies, espacements), les composants construits avec ces variables (boutons, champs, menus) et la documentation qui explique comment les utiliser.

  Son objectif est de faire **[gagner du temps]{dark}** aux équipes et d’assurer une expérience homogène sur les différents écrans et produits. Par exemple, un même bouton doit garder la même apparence et le même comportement sur tout un site ou une application.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: graine
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/sections/recherches-quantitatives.md, plus :
#   || légende en bas        → colonne de droite : son dernier élément (la légende) calé en bas en desktop,
#                              placé juste sous la colonne de gauche en mobile
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Le design system de graine

Lors du projet [graine](/projects/graine), je me suis occupé de la création et de la gestion du design system. Je présente ici ma méthode à travers un composant : le bouton.

*Le bouton est un bon exemple : il cumule les tailles, les états, les variantes de couleur et les icônes.*

## Ma façon de travailler

1. Lister tous les éléments à intégrer dans le composant.
2. Créer un composant de base dans mon UI kit (la bibliothèque de composants du projet), avec tous ces éléments.
3. Appliquer des **[variables]{dark}**, c’est-à-dire des valeurs nommées et partagées (couleurs, tailles, espacements) : aucune valeur n’est saisie à la main, sauf si c’est nécessaire ou demandé par les développeurs.

---

![Composant de base du bouton de graine : tailles, anatomie, espacements et typographies](bouton-composant-de-base.webp)

---

4. Intégrer ces composants de base dans un composant qui sera injecté dans un autre composant afin de le faire les modifications; une seule fois.

---

![Composant d’usage du bouton de graine : variantes, états et déclinaisons de couleur](bouton-composant-usage.webp)

---

5. Décliner chaque composant pour toutes les couleurs et tous les usages.
{petit} *L’autre designer de l’équipe n’avait plus qu’à changer le texte du bouton ou encore les icons, sans faire les modification à chaque fois, ce qui limite en plus les erreurs.*
6. Finaliser la documentation, pour qu’un développeur puisse reprendre le projet ensuite.

## Documentation

![Documentation du bouton dans le design system de graine : anatomie, tailles et typographies](bouton-documentation.webp)

|| légende en bas

Le projet a été pensé pour être repris par un développeur. Pour faciliter cette passation, chaque composant est documenté dans le design system : description, anatomie (les parties qui le composent), tailles, typographie et règles d’usage sur mobile et sur web.

*La documentation est rédigée en anglais, la langue de travail des développeurs.*

> Anatomie d’un composant : le bouton (documentation graine).

## Ce que cela a apporté

Grâce aux variables et aux composants d’usage, une modification faite dans le composant de base **[se répercute partout]{dark}**. Les écrans restent cohérents, et un futur développeur dispose d’une **[référence unique]{dark}** pour chaque composant.
