---
# MÉTHODE — PAGE « RECHERCHES QUANTITATIVES »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/recherches-quantitatives/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - questionner
  - comparer
  - tendances
  - hypothèses
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\brand_01.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/400
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 233.5, x: -2.2, y: -30.0, rotation: -8.3 }
image_mobile: { taille: 220.3, x: 4.6, y: -21.4, rotation: -8.3 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: "recherche  quantitative"
    desktop: { x: 49.7, y: 33.0, rotation: 8.3 }
    mobile: { x: 49.4, y: 32.8, rotation: 8.3 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  La recherche quantitative mesure des comportements, des usages et des opinions à grande échelle, à partir de données chiffrées. Elle répond à « combien ? » et « à quelle fréquence ? ».
  *On l’oppose à la recherche qualitative, qui explique le « pourquoi ». En réalité, les deux se complètent : les combiner est un vrai atout en recherche UX.*

  Elle s’appuie sur des questionnaires, des sondages ou l’analyse d’études existantes. Ses résultats permettent de valider ou d’invalider des hypothèses et de prioriser les décisions de conception.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: graine
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   ## Titre                 → nouvelle partie (titre subheading), séparée de la précédente par un trait
#   ### Sous-titre           → nouvelle sous-partie avec sous-titre (body/accentuation)
#   ###                      → nouvelle sous-partie sans sous-titre
#   ---                      → nouveau bloc dans la sous-partie
#   ligne vide               → nouvel élément dans le bloc (ou dans la colonne)
#   <<                       → début de deux colonnes : ce qui suit va à gauche
#   ||                       → passe à la colonne de droite
#   || bas                   → idem, colonne de droite calée en bas
#   >>                       → fin des colonnes : la suite reprend en pleine largeur
#                              (sans « << », « || » met à gauche tout ce qui le précède dans le bloc ;
#                               sans « >> », les colonnes vont jusqu'à la fin du bloc)
#   #### Texte               → titre dans un bloc (body/accentuation)
#   1. texte                 → élément numéroté ; les lignes suivantes sans numéro sont ses paragraphes suivants
#   1. ![description](fichier.png) → élément numéroté avec une image (sans bordure, fichier à 2× la taille affichée),
#                              les lignes suivantes vont dessous
#   - texte                  → liste à puces (une ligne par élément)
#   ![description](fichier.png) → image (dans le dossier des images de la page)
#   > texte                  → légende (petite, en italique)
#   = 47 | texte             → gros chiffre et son libellé
#   [texte](lien) [texte]{brand} *italique* **gras** → comme dans les autres textes du site
#   Lien vers un projet (/projects/…) : « Voir le projet » s'affiche au curseur.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Objectifs de la recherche

Cette phase de recherche a été articulée autour de deux questions :

<<

1. Quelles sont les habitudes des Français avec leurs plantes ?

||

2. Comment la gamification peut-elle motiver sans tomber dans ses dérives (manipulation, pression, etc.) ?

---

Deux méthodes ont été mobilisées pour y répondre :

<<

- La récolte et l’analyse d’études existantes

||

- L’élaboration et l’envoi d’un questionnaire

## Analyse d’études

### Quatre études :

Deux sur les habitudes des Français :

<<

- [« les Français et leur jardin »](https://documents.lesentreprisesdupaysage.fr/pub/documents/DP-Unep-x-Ifop-2025.pdf)

||

- [« Les Français et le jeu vidéo »](https://www.sell.fr/sites/default/files/essentiel-jeu-video/ejv_octobre_2024_0.pdf)

---

Et deux sur la gamification :

<<

- [« Work gamification: Effects on enjoyment, productivity and the role of leadership »](https://www.sciencedirect.com/science/article/abs/pii/S1567422320300715?via%3Dihub)

||

- [« EFL learners’ motivation in a gamified formative assessment: The case of Quizizz »](https://link.springer.com/article/10.1007/s10639-023-12034-7#Sec1)

---

![Graphique adapté de l’étude SELL 2024 : part de joueurs par tranche d’âge](etudes.png)

|| bas

> Adaptation d’un graphique de l’étude SELL 2024 : part de joueurs par tranche d’âge (documentation graine)

### Ce que les études ont révélé :

1. L’entretien des plantes est perçu comme une contrainte pour les 18 à 34 ans. L’application doit donc le rendre plus simple et plus engageant.

||

2. Près de 9 Français de 18 à 34 ans sur 10 jouent aux jeux vidéo (SELL, 2024). La gamification parle donc naturellement à cette cible.

---

3. Les classements et les badges motivent, mais peuvent aussi créer de la pression. Pour durer, la motivation doit s’appuyer sur des retours immédiats valorisant les progrès personnels, avec une compétition optionnelle.
*L’étude Quizizz porte sur des enfants de 8 à 10 ans ; on en retient le mécanisme (compétition contre progression), à vérifier auprès de notre cible.*

###

Ces données ont fixé notre cible principale, les 18 à 34 ans, et orienté le questionnaire : à qui l’envoyer, quelles questions poser et sur quel ton.

## Questionnaire

###

*18 questions (dont 3 facultatives), mêlant échelles de notation et questions ouvertes.*

---

Ce questionnaire a été distribué de deux façons :

<<

- Sur Reddit et Instagram

||

- Auprès de notre entourage, dans la tranche d’âge visée (18 à 34 ans)

---

<<

![Extrait du questionnaire du projet graine : réponses](questionnaire-reponses.png)

||

![Extrait du questionnaire du projet graine : infographie](questionnaire-infographie-1.png)

![Extrait du questionnaire du projet graine : infographie](questionnaire-infographie-2.png)

>>

> Extraits du questionnaire (documentation graine)

### Résultats :

= 47 | répondants

||

= 30 | réponses aux questions ouvertes

---

= 8 | infographies de synthèse

|| bas

Pour protéger les répondants, les réponses brutes ne sont pas publiées.

> Seules les infographies de synthèse ont été conservées.

### Ce que le questionnaire a révélé :

1. ![Extrait du projet graine](page-maker-1.png)
83 % des répondants sont prêts à s’occuper de leurs plantes dès la plantation d’une graine.

||

2. ![Extrait du projet graine](page-maker-2.png)
70,2 % estiment que des missions quotidiennes pourraient les aider à mieux entretenir leurs plantes.

---

Ces données ont validé plusieurs choix de conception :

<<

- des parcours d’entretien dès la plantation d’une graine

||

- des missions quotidiennes
