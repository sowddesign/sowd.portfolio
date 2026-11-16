---
# MÉTHODE — PAGE « PROTOTYPE HI-FI »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/prototype-hi-fi/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\bright_03.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/300
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 148.0, x: 15.7, y: -2.5 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: prototype
    desktop: { x: 33.6, y: 38.2, rotation: -12.7 }
    mobile: { x: 34.1, y: 37.3, rotation: -15.8 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Un prototype haute fidélité est une version détaillée et interactive d’une interface, très proche du produit final. Il reprend tous les styles prévus : couleurs, typographies, images, boutons et interactions.

  Il permet de simuler le parcours d’un utilisateur et de tester la navigation avant le développement. Par exemple, on peut cliquer d’un écran à l’autre pour vérifier qu’un parcours d’achat est clair et facile à suivre.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: souffle
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md.
#   Prototype Figma intégré : « @ adresse | titre » (16:9 en desktop, 4:5 en mobile).
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Rendre le MVP tangible

Lors du projet [Souffle](/projects/souffle), j’ai réalisé un prototype haute fidélité du MVP, pour se rendre compte concrètement de ce que serait l’application.

*Seul l’onboarding est présenté ici. Le prototype complet est disponible sur la page projet.*

## Onboarding

Le prototype démarre depuis l’écran d’accueil d’un téléphone, comme si l’application était réellement installée. L’utilisateur vit ainsi l’ouverture de Souffle dans les mêmes conditions qu’en vrai.

---

@ https://embed.figma.com/proto/JpFthiLvuO1uOo8icm8cBx/%F0%9F%A9%B9-Care---Cure--Copy-?node-id=4016-13426&p=f&viewport=662%2C513%2C0.12&scaling=scale-down&content-scaling=fixed&starting-point-node-id=4016%3A13426&show-proto-sidebar=1&page-id=4016%3A12710&embed-host=share | Prototype de l’onboarding de Souffle

Cliquez pour parcourir l’onboarding : [présentation de l’application, choix des objectifs, premier exercice…].

## Ce que cela a apporté

Le prototype a servi de support de présentation au jury et de base pour les tests utilisateurs.
