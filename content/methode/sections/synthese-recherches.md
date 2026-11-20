---
# MÉTHODE — PAGE « SYNTHÈSE DES RECHERCHES »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/synthese-recherches/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - trier
  - synthétiser
  - données
  - référence
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\whithish_04.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/200
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 174.7, x: 0.0, y: -7.9 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: recherches UX
    couleur: blanc
    desktop: { x: 46.1, y: 22.6 }
    mobile: { x: 47.5, y: 22.2 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  La synthèse des recherches consiste à organiser, regrouper et interpréter les données issues des différentes méthodes, quantitatives et qualitatives. Elle les transforme en **[enseignements]{dark}** directement utilisables pour le design.
  Elle permet de passer d’observations brutes (notes, chiffres, citations d’utilisateurs) à une compréhension structurée des besoins, des frustrations et des opportunités de conception.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: graine
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/sections/recherches-quantitatives.md, plus :
#   ![description](fichier.webp){mobile en deux} → en mobile et tablette petite : moitié gauche puis moitié droite
#                              de l'image, l'une sous l'autre
#   @ adresse | titre        → page intégrée (livre Heyzine…) : 16:9, 4:5 en mobile ; le titre est lu par les
#                              lecteurs d'écran
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Le dossier

Lors du projet [graine](/projects/graine), j’ai réalisé le document de design demandé en fin de projet. Ce livrable unique réunit le **[dossier de recherche]{dark}**, de la recherche quantitative jusqu’au user journey, ainsi que toute la partie design.

---

*Cette page présente la partie recherche, sur laquelle s’est appuyé le design de l’application.*

## Le contenu

1. Des chiffres clés tirés d’études sourcées, qui justifient les enseignements associés.

||

2. La présentation du questionnaire et l’analyse des réponses.

---

3. La problématique, qui guide toute la phase de design.

||

4. Les personas : principal et secondaire.

---

5. Un user journey représentatif du problème identifié, auquel l’application devait répondre.

||

---

*Les personas, le user journey et la problématique sont détaillés dans les fiches suivantes.*

## Le support

La direction artistique devait rappeler le réel et le tangible. J’ai donc choisi le format du **[livre numérique]{dark}**, à l’horizontale, plus adapté à la lecture sur écran.

Le contenu et la mise en page ont été conçus sur Figma, puis exportés en PDF.

---

![Extraits du fichier Figma du dossier de recherche du projet graine](dossier-figma.webp){mobile en deux}

> Extraits du fichier Figma du dossier de recherche (documentation graine).

---

Le PDF a ensuite été transformé en livre numérique à feuilleter avec [Heyzine](https://heyzine.com).

---

@ https://heyzine.com/flip-book/c3e6f0745c.html | Dossier de recherche du projet graine, en livre numérique (Heyzine)

Voir la [documentation graine](https://heyzine.com/flip-book/c3e6f0745c.html)

## Ce que cela a apporté

Le dossier a servi de **[référence]{dark}** tout au long de la phase de design : chaque choix pouvait s’appuyer sur un enseignement, un chiffre ou le parcours du persona.

{petit} *En fin de projet, il a été présenté au jury comme le **[fil conducteur]{dark}** de la démarche, de la recherche jusqu’aux maquettes finales.*
