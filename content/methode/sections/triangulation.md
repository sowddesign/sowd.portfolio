---
# MÉTHODE — PAGE « TRIANGULATION »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/triangulation/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - croiser
  - vérifier
  - méthodes
  - synthèse
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\brand_05.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/400
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 113.7, x: 0.0, y: -8.2 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: "triangulation"
    desktop: { x: 68.6, y: 84.6, rotation: -22.6 }
    mobile: { x: 68.6, y: 84.6, rotation: -22.6 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace)
definition: |
  La triangulation consiste à **[croiser]{dark}** plusieurs méthodes de recherche pour répondre à une même question. Chaque méthode compense les angles morts des autres : ce qu’un utilisateur dit en entretien, on le vérifie en l’observant agir.

  Elle peut aussi croiser plusieurs sources, ou le regard de plusieurs chercheurs. Le but : fonder les décisions sur des résultats qui se **[recoupent]{dark}**.

  *Elle fait le lien entre la phase Découvrir, où l’on explore les besoins, et la phase Définir, où l’on précise le problème à résoudre.*

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: c-media
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires
#
#   ## Titre                 → nouvelle partie (titre en body/accentuation)
#   ---                      → nouvelle rangée
#   ||                       → passe à la colonne de droite (sans « || » : pleine largeur)
#   || bas                   → idem, colonne de droite calée en bas
#   ligne vide               → nouvel élément dans la colonne
#   ### Texte                → sous-titre (caption/accentuation)
#   1. texte                 → liste numérotée (une ligne par élément)
#   - texte                  → liste à puces (une ligne par élément)
#   || inverse               → idem, colonne de droite au-dessus en mobile (se combine : « || bas inverse »)
#   ![description](fichier.png) → image (dans le dossier des images de la page)
#   ![description](desktop.webp | mobile.webp) → image recadrée autrement en mobile
#   ![description](fichier.webp){sans cadre} → image sans bordure ni coins
#   > texte                  → légende (petite, en italique)
#   = 47 | texte             → gros chiffre et son libellé
#   [texte](lien) [texte]{brand} *italique* **gras** → comme dans les autres textes du site
#   Lien vers un projet (/projects/…) : « Voir le projet » s'affiche au curseur.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Objectifs

Lors de mon alternance chez [C-Media](/projects/c-media), j’ai travaillé sur une fonctionnalité existante, mais **[délaissée]{dark}** par les utilisateurs.

---

<<

**Trois méthodes ont été mobilisées :**

1. Entretiens individuels
2. Tests utilisateurs
3. Focus group

||

**Le paradoxe :**

Les utilisateurs la citaient pourtant comme un besoin.

>>

## Entretiens individuels

J’ai mené **[trois entretiens]{dark}** individuels à partir d’un guide préparé en amont (la liste des thèmes et des questions à aborder).

---

Ils ont permis de recueillir le contexte, les habitudes et les difficultés de chaque utilisateur.

---

![Entretien en visioconférence entre une utilisatrice et un designer](entretiens-individuels.webp | entretiens-individuels-mobile.webp){sans cadre}

## Tests utilisateurs

J’ai ensuite organisé **[trois tests]{dark}** sur la fonctionnalité : chaque utilisateur réalisait des tâches concrètes pendant que je l’observais.

Ces tests ont révélé des points de friction (les moments où l’utilisateur hésite ou bloque) que les entretiens ne faisaient pas apparaître.

||

![Une utilisatrice teste une maquette pendant qu’un designer prend des notes](tests-utilisateurs.webp){sans cadre}

## Focus group

![Groupe d’utilisateurs en discussion autour d’une table](focus-group.webp){sans cadre}

|| inverse

Enfin, j’ai animé un focus group, une discussion de groupe autour du produit, avec une **[dizaine d’utilisateurs]{dark}**.

Cette session collective a fait émerger des perceptions partagées, des attentes et des désaccords sur le produit.

## Croiser les résultats

J’ai rassemblé les enseignements des trois méthodes pour repérer ce qui se recoupait et ce qui se contredisait.

{petit} *Les analyses ont été relues avec le lead designer, pour limiter les biais d’un seul regard.*

---

**Ce que le croisement a révélé :**

Un **[autre outil]{dark}** répondait déjà au besoin, et plusieurs fonctionnalités concernées ne fonctionnaient pas correctement. Les utilisateurs n’avaient donc aucune raison de changer leurs habitudes.

L’équipe produit s’appuyait sur un recueil des besoins ancien, et d’autres fonctionnalités passaient en priorité. Celle-ci n’avait donc pas évolué avec les usages.

{petit} *Les détails du projet restent confidentiels.*

## Ce que cela a apporté

Ces enseignements ont été traduits en maquettes puis en prototypes sur Figma (des versions dessinées puis cliquables de l’interface), et **[validés par les utilisateurs]{dark}**.

||

![Des retours utilisateurs aux maquettes et aux prototypes](maquettes-prototypes.webp){sans cadre}

---

{petit} *La solution a été mise en ligne après mon départ : je n’ai donc pas pu en mesurer l’impact.*
