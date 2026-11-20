---
# MÉTHODE — PAGE « TESTS UTILISATEURS »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/tests-utilisateurs/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - observer
  - corriger
  - tâches
  - frictions
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\darker_06.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/500
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 193.3, x: 0.0, y: -6.0 }
image_mobile: { taille: 120.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: tests utilisateurs
    desktop: { x: 50.3, y: 22.4, rotation: -4.3 }
    mobile: { x: 51.3, y: 21.5, rotation: -4.1 }
  - texte: "✓"
    desktop: { x: 37.4, y: 23.0, rotation: -5.1 }
    mobile: { x: 37.5, y: 23.6, rotation: -5.1 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Les tests utilisateurs consistent à confier des tâches réalistes à des utilisateurs, si possible représentatifs de la cible. Pendant qu’ils les réalisent, l’équipe observe leurs comportements et leurs difficultés, et recueille leurs commentaires.

  L’objectif n’est pas d’évaluer l’utilisateur, mais de **[tester l’interface]{dark}** et le concept. Cette démarche permet de découvrir des problèmes concrets et d’identifier des améliorations possibles, avant ou pendant le développement.

  *Ils font le lien entre la phase Développer, où l’on imagine des solutions, et la phase Livrer, où l’on finalise la solution.*

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: c-media
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/sections/recherches-quantitatives.md, plus :
#   ![description](fichier.webp){sans cadre} → image sans bordure ni coins
#   || inverse               → colonne de droite au-dessus en mobile
#
# Mobile (pas de maquette Figma, choix de l'utilisateur) : texte avant l'image (« || inverse »).
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Tester avec les promoteurs

Lors de mon alternance chez [C-Media](/projects/c-media), j’ai organisé à plusieurs reprises des tests utilisateurs auprès des **[promoteurs]{dark}**, les équipes terrain qui utilisent l’application mobile. Les tests portaient principalement sur des prototypes Figma.

{petit} *Les détails du projet restent confidentiels : cette fiche présente uniquement la démarche.*

## Préparation

1. Définir les objectifs : pourquoi faire ce test ?

||

2. Définir ce qui est testé : des fonctionnalités, des écrans ou un parcours.

---

3. Identifier des profils représentatifs et les recruter.

||

4. Préparer les tâches que l’utilisateur devra réaliser.

---

5. Définir des **[critères de réussite]{dark}** : parcours réussi ou non, erreurs, temps, difficulté ressentie.
6. Préparer le support de test : wireframe ou prototype selon l’avancement du projet (ici, des prototypes Figma).

||

![Un designer prépare un test : post-it, wireframes, parcours et liste de tâches sur son bureau](preparation.webp){sans cadre}

## Pendant le test

Pendant le test, j’invite toujours les participants à penser à voix haute : expliquer leurs actions et leurs impressions.

J’observe **[sans guider]{dark}** : une fois l’application en ligne, personne ne sera à côté d’eux pour leur expliquer.

*L’objectif est de prendre un maximum de notes, sur les comportements observés comme sur les phrases prononcées.*

||

![Une utilisatrice teste un prototype sur son téléphone pendant qu’un designer prend des notes](pendant-le-test.webp){sans cadre}

## Après le test

![Deux personnes analysent les résultats des tests sur un tableau : graphiques et niveaux de satisfaction](apres-le-test.webp){sans cadre}

|| inverse

Une fois les tests terminés, je rédige un compte rendu. Il structure un argumentaire qui oriente et **[priorise les corrections]{dark}**.

## Ce que cela a apporté

Les tests ont permis de corriger les prototypes avant le développement, et d’appuyer les choix de design sur des **[observations concrètes]{dark}** plutôt que sur des opinions, notamment face à la direction.
