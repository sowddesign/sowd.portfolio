---
# MÉTHODE — PAGE « ENTRETIEN UTILISATEUR »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/entretien-utilisateur/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - écouter
  - interpréter
  - verbatims
  - ressenti
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\brand_03.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/400
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 157.1, x: 0.0, y: -38.5 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: "entretien utilisateur"
    desktop: { x: 49.5, y: 30.2 }
    mobile: { x: 49.2, y: 27.5 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace)
definition: |
  L’entretien utilisateur s’ancre dans une démarche de recherche qualitative.

  L’analyse porte sur ce qui est dit, mais aussi sur la manière dont c’est dit : le ton, les hésitations, les émotions, le langage non verbal, ainsi que le contexte dans lequel l’expérience se déroule (moment, lieu, outils utilisés, contraintes, etc.).

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: scholar
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md, plus :
#   ~ fichier.mp3 | légende  → extrait audio (fichier dans public/methode/entretien-utilisateur/), légende dessous
#   ##### Titre              → titre en captionText/accentuation, suivi de son texte sur les lignes en dessous
#                              (sans ligne vide) ; plus d’espace au-dessus
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Démarche

Lors du projet [Scholar](/projects/scholar), j’ai mené un entretien avec Margaux, 21 ans, utilisatrice quotidienne de Duolingo, pour comprendre ses habitudes et ses attentes envers une application d’apprentissage.

---

*L’entretien a duré une vingtaine de minutes. Les extraits ci-dessous ont été sélectionnés pour ce qu’ils ont révélé.*

## Pourquoi revenir chaque jour ?

~ 01-serie-avant-minuit.mp3 | Margaux, à 08:58 de l’entretien – 13 s

||

*« Ça m’arrive de le faire dix minutes avant minuit. Quand tu as un quotidien à toi, tu oublies facilement. Ce qui est bien dans Duolingo, c’est que t’as beaucoup de rappels. »*

##### Ce qu’on en retient :
L’apprentissage passe rarement en priorité dans un quotidien chargé. Les rappels sont essentiels pour qu’il ne soit pas oublié.

## Dans quelles conditions ?

~ 02-contexte-transports.mp3 | Margaux, à 07:04 de l’entretien – 12 s

||

*« Le petit hic, c’est que tu le fais souvent dans les transports… sans ton casque, tu ne peux pas écouter. »*

##### Ce qu’on en retient :
Le lieu et le moment d’utilisation limitent certaines fonctionnalités. L’application doit s’adapter au contexte, avec par exemple des exercices sans son ou plus de temps quand l’attention est réduite.

## Qu’est-ce qui manque ?

~ 03-attente-explications-erreurs.mp3 | Margaux, à 19:07 de l’entretien – 11 s

||

*« Pourquoi pas des fiches de cours, des explications plus précises sur où était ton erreur et pourquoi ça s’écrit comme ça ? »*

##### Ce qu’on en retient :
Être corrigé ne suffit pas. L’utilisateur a besoin d’un cours avant d’être testé, puis après le test ; des nouveaux exercices adaptés à ses erreurs.

## Ce que l’entretien a apporté

*« On a envie que ça soit rapide, mais il faut que ce soit efficace dans l’apprentissage. »*

> Citation : Margaux, à 20:59 de l’entretien

||

Ces constats ont confirmé notre format de sessions courtes, pensées pour s’intégrer au quotidien, et ont servi de base au persona.
