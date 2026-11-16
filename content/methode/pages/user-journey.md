---
# MÉTHODE — PAGE « USER JOURNEY »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/user-journey/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\whithish_03.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/200
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 186.7, x: -12.6, y: -29.4 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: user
    desktop: { x: 36.9, y: 32.2 }
    mobile: { x: 30.3, y: 32.2 }
  - texte: journey
    desktop: { x: 67.6, y: 32.2 }
    mobile: { x: 66.1, y: 32.2 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Le user journey (ou parcours utilisateur) est une visualisation de l’ensemble des étapes qu’une personne traverse pour atteindre un objectif avec un produit ou un service.

  Il réunit généralement les actions, les pensées, les émotions, les points de contact et les points de friction.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: flashinvaders
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md, plus :
#   ![description](fichier.webp){sans cadre} → image sans bordure ni coins
#   « << … || … >> » répété dans un même bloc → rangées de deux colonnes rapprochées
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Parcours du persona

Lors du projet [Flash Invaders](/projects/flashinvaders), pour visualiser le parcours d’Élodie, le persona principal, sur l’application actuelle, j’ai construit un user journey.

---

Ce parcours de l’existant m’a permis de repérer les frictions auxquelles la refonte devait répondre.

---

**Structure**

<<

1. Les étapes du parcours

||

2. Le contexte

>>

<<

3. Les pensées et les motivations

||

4. Les émotions

>>

<<

5. Les apprentissages et points de friction

||

6. Les opportunités

>>

---

**Différentes sources**

<<

- Des chiffres clés tirés d’études sourcées.

||

- Les entretiens et l’observation terrain.

>>

<<

- Les réponses au questionnaire et leur analyse.

||

- Les personas principal et secondaire.

>>

## La forme

Le user journey se construit souvent en atelier, avec des post-it. J’ai reproduit ce format sur FigJam.

---

![Extrait du user journey de Flash Invaders, construit sur FigJam avec des post-it](user-journey-extrait.webp)

|| bas

> Extrait du user journey (documentation Flash Invaders).

---

*La version complète est disponible sur la page du projet.*

## Ce que cela a apporté

Le parcours d’Élodie montre que presque tout se passe hors de l’application : Instagram pour enquêter, Maps pour placer ses points et tracer son itinéraire, WhatsApp ou Discord pour retrouver ses amis.

---

L’application Flash Invaders n’est ouverte que le temps de flasher. La refonte vise donc à ramener ces usages dans l’application.

---

1. Enquêter sur Instagram pour localiser un invader manquant.
> → Refonte : des indices pour le trouver directement dans l’application.

||

2. Placer des points un par un sur Maps, une tâche jugée très fastidieuse.
> → Refonte : des marqueurs personnels sur la carte de l’application.

---

3. Relier ces points à la main pour créer un itinéraire.
> → Refonte : des itinéraires de balade proposés par l’application.

||

4. S’organiser via des groupes WhatsApp ou Discord.
> → Refonte : des balades à plusieurs et des rendez-vous dans l’application.
