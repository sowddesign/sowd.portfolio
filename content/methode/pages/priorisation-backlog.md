---
# MÉTHODE — PAGE « PRIORISATION & BACKLOG »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/priorisation-backlog/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\whithish_05.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/200
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 212.6, x: 0.0, y: -56.3 }
image_mobile: { taille: 120.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: priorisation
    desktop: { x: 50.5, y: 34.9 }
    mobile: { x: 51.0, y: 29.6 }
  - texte: "&"
    desktop: { x: 27.7, y: 45.0 }
    mobile: { x: 23.6, y: 41.3 }
  - texte: backlog
    desktop: { x: 72.8, y: 50.0 }
    mobile: { x: 75.8, y: 46.3 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  La priorisation consiste à classer les besoins des utilisateurs et les enjeux de l’entreprise selon des critères comme la valeur apportée, l’ampleur du problème et la faisabilité.

  Elle oriente chaque nouvelle version de la conception et du développement vers les besoins les plus importants.
  Ses résultats alimentent directement le **[backlog]{dark}** produit : la liste ordonnée de tout ce qu’il reste à faire, qui devient une feuille de route partagée par l’équipe.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: graine
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md, plus :
#   ##### Titre              → titre en captionText/accentuation, suivi de son texte sur les lignes en dessous
#                              (sans ligne vide)
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Prioriser les besoins

Lors du projet graine, **[deux besoins]{dark}** revenaient dans toute notre recherche.

*On les retrouve dans le persona de Sara : utiliser un scanner, et partager ce qu’elle apprend.*

---

Nous avons construit la première version de graine autour d’eux :

---

##### Comprendre ses plantes
Le **[scan]{dark}** des plantes est la fonctionnalité principale de l’application.
{petit} *→ Les autres fonctionnalités ont été priorisées autour de celle-ci.*

||

##### Partager avec la communauté
L’aspect **[communautaire]{dark}** traverse toute l’application.
{petit} *→ Chaque fonctionnalité a été pensée pour y répondre.*

## Prioriser le travail de l’équipe

Pour suivre l’avancement et tenir les échéances, j’ai organisé le projet sur [Monday](https://monday.com/lang/fr), un outil de gestion de projet, en plusieurs phases :

- Gestion de projet
- UX Research
- UX Design
- UI Design
- Brand design & partenariats

---

Chaque phase était découpée en tâches et sous-tâches, pour voir clairement ce qui restait à faire.

---

![Backlog du projet graine sur Monday, découpé en phases, tâches et sous-tâches](backlog-monday.webp)

> Backlog du projet sur Monday (documentation graine).

---

Avec des échéances serrées, il est rarement possible de mener toutes les méthodes prévues : **[il faut choisir]{dark}**.

*Nous avons par exemple dû renoncer aux entretiens guérilla (des échanges courts avec des passants, dans la rue) : nous avons jugé disposer d'assez d'informations pour passer à l'UX, puis à l'UI design.*

## Ce que cela a apporté

Les deux besoins ont servi de **[boussole]{dark}** pour prioriser les fonctionnalités, et le backlog pour organiser le travail. 

*L’équipe savait à tout moment ce qui comptait le plus et ce qui pouvait attendre.*
