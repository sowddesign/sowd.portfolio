---
# MÉTHODE — PAGE « RECHERCHES QUANTITATIVES »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/recherches-quantitatives/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - questionnaires
  - études
  - données
  - quantité
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\brand_01.png
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
  - texte: "recherches  quantitatives"
    desktop: { x: 49.7, y: 33.0, rotation: 8.3 }
    mobile: { x: 49.4, y: 32.8, rotation: 8.3 }

# « En quelques mots » : colonne de gauche, puis colonne de droite (ligne vide = nouveau paragraphe)
definition_gauche: La recherche quantitative est une technique de collecte des données permettant d’analyser des comportements, des opinions et même des attentes utilisateur ; en quantité.
definition_droite: |
  Les données sont souvent récoltées à distance (et donc plus rapidement) grâce à des sondages, des questionnaires mais aussi à travers des études sélectionnées en amont.

  Elles permettent de prouver ou démontrer des faits en quantifiant un phénomène.

# Bouton vers le projet cité (texte et adresse)
projet_bouton: Voir le projet graine
projet_lien: /projects/graine
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
#   ![description](fichier.png) → image (dans le dossier des images de la page)
#   > texte                  → légende (petite, en italique)
#   = 47 | texte             → gros chiffre et son libellé
#   [texte](lien) [texte]{brand} *italique* **gras** → comme dans les autres textes du site
#   Lien vers un projet (/projects/…) : « Voir le projet » s'affiche au curseur.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

Lors du projet [graine](/projects/graine) j’ai souhaité comprendre les habitudes des Français concernant les plantes et les expériences gamifiées.

Mais aussi de mieux comprendre comment la gamification va changer l’expérience vécue, afin d’éviter au maximum les dérives liées à cette pratique.

||

### Deux méthodes ont été mobilisées :

1. Analyse d’études existantes
2. Elaboration et envoi d’un questionnaire

## Analyse d’études

Des études comme :

---

[« Work gamification: Effects on enjoyment, productivity and the role of leadership »](https://www.sciencedirect.com/science/article/abs/pii/S1567422320300715?via%3Dihub)

[« les Français et leur jardin »](https://documents.lesentreprisesdupaysage.fr/pub/documents/DP-Unep-x-Ifop-2025.pdf)

||

[« EFL learners’ motivation in a gamified formative assessment: The case of Quizizz »](https://link.springer.com/article/10.1007/s10639-023-12034-7#Sec1)

ou encore [« Les Français et le Jeu vidéo »](https://www.sell.fr/sites/default/files/essentiel-jeu-video/ejv_octobre_2024_0.pdf)

---

![Extrait du document de recherche du projet graine : études](etudes.png)

|| bas

> Extrait  du  document  de  recherche  du  projet  graine

---

Ces recherches m’ont amené à deux études permettant de créer un lien sur une tranche d’âge, **les 18-34 ans**.

||

### Deux insight ont étés trouvés :

1. Ils estiment l’entretien des plantes comme une contrainte.
2. Presque 90% des 18-34 ans qui jouent au jeu vidéo

---

### Ce que cela a apporté :

Les études préalables ont orientés les choix sur le questionnaire : notamment pour déterminer à qui l’envoyer, mais aussi sur les questions posées et le ton à employer.

||

## Questionnaire

Ce questionnaire a été distribué de deux façons :

||

---

- Envoi à des connaissances, dans la tranche d’âge préalablement visée

||

- Posté sur les réseaux sociaux comme Reddit et Instagram

---

![Extrait du document de recherche du projet graine : réponses au questionnaire](questionnaire-reponses.png)

||

![Extrait du document de recherche du projet graine : infographie](questionnaire-infographie-1.png)

![Extrait du document de recherche du projet graine : infographie](questionnaire-infographie-2.png)

> Extrait  du  document  de  recherche  du  projet  graine

---

### Résultats :

---

= 47 | Réponses aux questions

||

= 30 | Réponses développées

---

= 8 | Infographies réalisées

|| bas

Dans le but de protéger les données nous avons supprimé les réponses.

> Seules les infographies ont étés conservée pour appuyer l’argumentaire.
