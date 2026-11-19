---
# MÉTHODE — PAGE « TESTING »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/testing/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\bright_04.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/300
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 141.4, x: 0.0, y: -27.0 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: testing
    desktop: { x: 56.3, y: 78.3 }
    mobile: { x: 57.4, y: 82.4 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  L’A/B testing compare deux versions d’une interface ou d’un parcours auprès d’utilisateurs réels, répartis aléatoirement entre une version A et une version B. Le but est de mesurer laquelle atteint le mieux un objectif donné.

  Sans trafic suffisant pour mesurer, on peut en appliquer le principe de façon qualitative : c’est le test de préférence, où l’on présente plusieurs versions à des participants pour recueillir leur choix et leurs raisons.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: portfolio
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md.
#
# Mobile (pas de maquette Figma, choix de l'utilisateur) : image A/B coupée en deux (A puis B, « {mobile en deux} »),
# protocole sur une colonne.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Un portfolio pour tous

Ce [Portfolio](/projects/portfolio) doit parler à tous : recruteurs, designers, futurs clients et personnes extérieures au métier. Pour le vérifier, je le teste en deux temps : d’abord auprès de participants, puis en ligne, auprès de vrais visiteurs.

## Étape 1 : comparer avec des participants

Pour la page projet de Flash Invaders, j’ai présenté deux dispositions à des participants.

---

![Page projet Flash Invaders en deux dispositions : A, les exemples de questions sous la photo ; B, dans la colonne de droite](flash-invaders-a-b.webp){mobile en deux}

> Page projet Flash Invaders (Portfolio sowd)

---

En B, les exemples de questions passent dans la colonne de droite, à côté de la photo. Les participants ont préféré cette disposition, que j’ai retenue.

## Étape 2 : l’A/B test en ligne

Une préférence déclarée ne dit pas comment les visiteurs se comportent réellement. J’ai donc confronté les deux dispositions sur Maze, en test non modéré.

### Le protocole

<<

1. Hypothèse :
{petit} *→ la disposition B permet de trouver l’information plus vite et plus facilement.*

||

2. Tâche :
{petit} *→ retrouver les questions posées lors des entretiens exploratoires.*

>>

<<

3. Indicateurs :
{petit} *→ taux de réussite, temps pour accomplir la tâche, clics à côté.*

||

4. Répartition :
{petit} *→ chaque testeur voit aléatoirement la version A ou la version B.*

>>

<<

5. Retours :
{petit} *→ une question ouverte en fin de test, pour comprendre les résultats.*

||

>>

## Résultats

Test en cours. Les résultats seront publiés ici.
