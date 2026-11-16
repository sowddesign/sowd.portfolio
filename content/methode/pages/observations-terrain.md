---
# MÉTHODE — PAGE « OBSERVATIONS TERRAIN »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/observations-terrain/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - observer
  - s’immerger
  - usages
  - contexte
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\brand_04.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/400
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 135.9, x: -6.5, y: -32.1 }
image_mobile: { taille: 90.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: observations
    desktop: { x: 21.9, y: 33.3 }
    mobile: { x: 34.9, y: 20.0 }
  - texte: terrain
    desktop: { x: 72.9, y: 33.3 }
    mobile: { x: 60.2, y: 20.0 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace)
definition: |
  Les observations terrain (shadowing, études in situ, etc.) consistent à suivre les utilisateurs dans leur environnement réel pour comprendre leurs pratiques, leurs routines et leurs contraintes.

  Elles révèlent aussi, en direct, les émotions, les interactions et les points de contact liés au contexte d’usage, souvent invisibles dans les données chiffrées.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: flashinvaders
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Objectifs

Lors du projet [Flash Invaders](/projects/flashinvaders), afin de bien comprendre comment les joueurs utilisent l’application, j’ai organisé une balade dans Paris avec des joueurs de niveaux différents.

---

*L’application étant gamifiée, je parle de joueurs plutôt que d’utilisateurs.*

---

**Intuitions avant le rendez-vous :**

<<

1. Les joueurs expérimentés utilisent plusieurs applications pour chasser les invaders.

||

2. Pour aller d’un point A à un point B, les joueurs préfèrent passer par un maximum d’invaders plutôt que prendre le chemin le plus court.

>>

<<

3. La communauté enrichit l’expérience, que les joueurs se connaissent ou non.

||

4. Certaines fonctionnalités sont difficiles à utiliser ou délaissées.

## Organisation

Grâce au questionnaire et aux entretiens utilisateurs, j’ai recruté des joueurs pour une balade dans Paris.

---

*Trois personnes ont répondu présent.*

||

---

**Des profils différents :**

1. L’expérimenté : il a déjà flashé des invaders et utilise souvent l’application.

2. L’occasionnel : il ouvre l’application quand il croise un invader.

3. Le novice : c’est sa première expérience avec l’application.

*Croiser les profils était essentiel : un joueur expérimenté peut s’être habitué à une fonctionnalité qui freine le novice.*

||

## Déroulé

#### Rendez-vous et départ :

<<

Brève explication du déroulé aux joueurs.

||

*Aucune restriction : ils pouvaient utiliser n’importe quelle application, se parler et interagir entre eux.*

---

#### Phase 1 : Observation

<<

Aucune interaction de ma part, pour ne pas influencer les joueurs : je me suis contenté de suivre, d’observer et de prendre des notes.

||

*Objectif : vérifier mes intuitions et repérer des comportements inattendus.*

---

#### Phase 2 : Questions

<<

À mi-parcours, j’ai interrogé chaque joueur individuellement, à l’écart du groupe, pour que les réponses ne s’influencent pas.

||

*Les questions portaient sur la manière d’enrichir l’expérience.*

---

#### Arrivée et remerciements :

<<

À l’arrivée, nous avons fait un bilan collectif : les points forts et les points faibles de l’application et ce que eux aimeraient voir arriver dans l’application.

Pour finir, j’ai remercié les participants pour leur temps.

||

*Avoir des avis de différents profils était un vrai plus, car un joueur expérimenté peut s’être habitué à une fonctionnalité qui sera un frein pour le novice.*

---

#### Carte de la balade :

<<

![Carte de la balade du 8 mars 2025 dans Paris, du point A au point B](carte-balade.webp)

|| bas

> Parcours du 8 mars 2025 (documentation Flash Invaders)

## De l’observation à la refonte

1. **Une carte externe**
L’expérimenté passait sans cesse de Flash Invaders à une carte Google Maps personnalisée.
*→ Refonte : des marqueurs personnels directement dans l’application.*

||

2. **Des détours pour flasher plus**
Les joueurs ont choisi un itinéraire qui passait par un maximum d’invaders.
*→ Refonte : des balades guidées par des indices, qui font passer par les invaders sans les révéler, pour garder le plaisir de tomber dessus.*

---

3. **L’entraide**
L’expérimenté a guidé les autres ; sans lui, le novice aurait peut-être abandonné.
*→ Refonte : des fonctionnalités communautaires pour faire des balades à plusieurs, organiser des rendez-vous et partager ses parcours.*

||

4. **Des fonctionnalités délaissées**
Certaines n’ont pas été utilisées du tout, d’autres ont été mal comprises.
*→ Refonte : ces écrans ont été repensés côté interface.*
