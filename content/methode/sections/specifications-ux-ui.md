---
# MÉTHODE — PAGE « SPÉCIFICATIONS UX/UI »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/specifications-ux-ui/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - détailler
  - valider
  - passation
  - référence
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\bright_05.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/300
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 136.1, x: -6.7, y: -18.0 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: "spécifications  UX/UI"
    desktop: { x: 55.5, y: 43.5, rotation: 27.5 }
    mobile: { x: 54.6, y: 41.4, rotation: 27.5 }


# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Les spécifications UX/UI décrivent précisément comment une solution doit être comprise et développée. Elles détaillent la structure, les composants et leurs comportements, les états (survol, erreur, chargement…), l'adaptation aux tailles d'écran et l'accessibilité.

  Elles transmettent aux développeurs l’apparence des écrans, mais aussi l’intention d’usage et la logique du parcours. Elles assurent ainsi une **[compréhension commune]{dark}** de la solution et limitent les erreurs d’interprétation au moment du développement.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: c-media
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/sections/recherches-quantitatives.md.
#
# Mobile (pas de maquette Figma, choix de l'utilisateur) : texte puis illustration.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Plusieurs équipes, une même méthode

Lors de mon alternance chez C-Media, j’ai travaillé sur plusieurs interfaces, avec plusieurs équipes de développement. Une **[méthode commune]{dark}** rendait la transmission très simple, en trois étapes.

{petit} *Les détails du projet restent confidentiels : cette fiche présente uniquement la démarche.*

## 1. Les tickets de cas d’usage

Les cas d’usage (aussi appelés use cases) étaient rédigés principalement par les PO, et parfois par les designers, sous forme de tickets : des fiches de tâche dans l’outil de suivi utilisé par l’équipe (JIRA).

---

Chaque ticket décrivait précisément ce qu’il fallait pour répondre au besoin, les interactions existantes, ainsi que les données d’entrée et de sortie d’un parcours ou d’une fonctionnalité.

## 2. Les maquettes en dev mode

Une fois le besoin analysé et le ticket écrit, nous réalisions les maquettes, et les prototypes quand un test était nécessaire.

---

Chaque fonctionnalité avait sa page Figma et sa section en dev mode, sans aucun écran superflu : le développeur savait **[immédiatement]{dark}** ce qu’il devait développer.

---

*Le dev mode est une fonctionnalité de Figma qui permet d’inspecter les maquettes et d’accéder aux spécifications et aux ressources nécessaires à leur intégration.*

---

![Page Figma du portfolio ouverte en dev mode : maquette de la page Démarche UX et panneau des spécifications](dev-mode-portfolio.webp)

*Par souci de confidentialité, j’illustre avec mon portfolio, conçu selon la même méthode.*

## 3. La passation (handoff)

Dernière étape : ajouter le lien du dev mode au ticket, pour que le développeur le retrouve facilement.

Une validation avec le développeur et le PO confirmait ensuite que la solution était **[techniquement faisable]{dark}**.

||

![Illustration : un designer présente la maquette Figma à une développeuse, qui valide d’un pouce levé](passation.webp){sans cadre}

## Ce que cela a apporté

Un ticket, une page Figma, un lien : chaque développeur trouvait au **[même endroit]{dark}** le besoin, les maquettes et les spécifications, quelle que soit son équipe. La passation était plus rapide et laissait moins de place aux interprétations.
