---
# MÉTHODE — PAGE « ALIGNER LES OBJECTIFS »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/aligner-objectifs/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\whithish_06.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/200
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 212.6, x: 0.0, y: -56.3, rotation: 13.0 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: aligner
    desktop: { x: 41.2, y: 73.5, rotation: -13.0 }
    mobile: { x: 42.9, y: 85.1 }
  - texte: les
    desktop: { x: 63.1, y: 52.9, rotation: -13.0 }
    mobile: { x: 62.4, y: 64.5 }
  - texte: objectifs
    desktop: { x: 86.2, y: 28.5, rotation: -13.0 }
    mobile: { x: 88.3, y: 36.9 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Aligner les objectifs consiste à s’assurer que les objectifs utilisateurs (tâches, besoins, émotions) et les objectifs business (conversion, rétention, coût, image) sont pris en compte de façon cohérente dans la conception.

  Cela permet de clarifier le « pourquoi » côté entreprise et côté utilisateur, puis de vérifier que les solutions proposées servent les deux.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: c-media
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md, plus :
#   ![description](fichier.webp){sans cadre} → image sans bordure ni coins
#   || inverse               → colonne de droite au-dessus en mobile
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Évolution demandée par la direction

Lors de mon alternance chez [C-Media](/projects/c-media), j’ai travaillé sur une fonctionnalité demandée par la direction.

---

En binôme avec le lead UX, nous l’avons confrontée aux besoins des promoteurs (les équipes terrain qui utilisent l’application mobile), pour concevoir une solution utile à l’entreprise comme à eux, plutôt qu’une contrainte imposée.

## Problème

L’idée initiale répondait à un objectif de productivité, mais elle risquait de surcharger les promoteurs et de transformer un outil utile en outil contraignant.

Or, leurs besoins portaient sur la rapidité d’exécution, l’adaptation permanente au contexte et la capacité à ne pas perdre d’informations importantes.

||

![Une promotrice consulte une liste de tâches sur son téléphone en magasin](probleme.webp){sans cadre}

## Méthode d’alignement

![Trois personnes organisent des idées sur un tableau pendant un atelier](methode-alignement.webp){sans cadre}

|| inverse

**Trois méthodes ont été mobilisées :**

1. Un atelier d’idéation
2. Une présentation orientée utilisateurs auprès de la direction
3. Un prototype testé

*Elles ont rendu visibles les usages, les frictions et les arbitrages nécessaires.*

## Arbitrage

La solution conserve l’intention de la direction, mais repense la façon dont les informations sont collectées et restituées.

Elle fournit à l’entreprise les données dont elle a besoin, tout en apportant une fonctionnalité réellement utile au quotidien des promoteurs.

*Les détails du projet restent confidentiels.*

||

![Trois personnes comparent un parcours et des données sur un tableau](arbitrage.webp){sans cadre}

## Résultats

Les tests utilisateurs ont validé l’approche, et la direction a retenu plusieurs fonctionnalités issues de cette phase d’alignement.

*Le recadrage a été accepté grâce à des preuves d’usage plutôt qu’à un débat d’opinions.*

---

![Deux designers présentent un prototype à des utilisateurs qui le testent sur leur téléphone](resultats.webp){sans cadre}
