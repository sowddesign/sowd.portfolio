---
# MÉTHODE — PAGE « PROBLÉMATIQUE »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/problematique/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\whithish_01.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/200
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 141.5, x: 0.0, y: -10.6 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: problématique
    desktop: { x: 39.2, y: 18.5, rotation: -9.2 }
    mobile: { x: 40.5, y: 17.2, rotation: -9.2 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace)
definition: |
  La problématique (ou question de recherche) est la formulation claire et délimitée du problème à résoudre. Elle fixe le périmètre de la réflexion : ce que l’on cherche vraiment à comprendre ou à améliorer.
  Elle guide à la fois la méthodologie à adopter pour explorer le sujet et les choix de design qui en découlent.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: souffle
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
#   > texte (sous « 1. »)    → note de l'élément numéroté (petite, en italique)
#   - texte                  → liste à puces (une ligne par élément)
#   ![description](fichier.png) → image (dans le dossier des images de la page)
#   ![description](fichier.webp){sans cadre} → image sans bordure ni coins
#   > texte                  → légende (petite, en italique)
#   = 47 | texte             → gros chiffre et son libellé
#   [texte](lien) [texte]{brand} *italique* **gras** → comme dans les autres textes du site
#   Lien vers un projet (/projects/…) : « Voir le projet » s'affiche au curseur.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Du constat à la problématique

Lors du projet Souffle, nous sommes partis d’un thème large : comment prendre soin des soignants.

Nos recherches ont montré que les infirmiers et infirmières en psychiatrie sont particulièrement exposés au burn-out, souvent à cause de la charge émotionnelle du métier.

---

1. Le thème :
> → le soin des soignants.

||

2. La cible :
> → les infirmiers et les infirmières en psychiatrie.

---

3. Le constat :
> → les infirmiers et infirmières en psychiatrie sont particulièrement exposés au burn-out.

||

4. Le problème :
> → l’épuisement professionnel.

---

5. La cause :
> → la charge émotionnelle du métier, éprouvante et difficile à gérer.

||

> Chaque étape a resserré le périmètre jusqu’à la problématique.

---

#### La problématique :

*« Comment prévenir l’épuisement professionnel des infirmiers et infirmières en psychiatrie face aux difficultés émotionnelles de leur travail ? »*

## Ce que cela a apporté

La problématique a orienté nos choix : « prévenir » nous a menés vers des exercices à pratiquer au quotidien, plutôt qu’un accompagnement une fois l’épuisement installé.

---

Et parce que la cause est émotionnelle, nous nous sommes appuyés sur la méthode ACT, qui apprend à accueillir ses émotions plutôt qu’à les éviter.

---

![Activité « Jouer avec ses pensées » de l’application Souffle](jouer-avec-ses-pensees.webp)

|| bas

> Activité « Jouer avec ses pensées » (application Souffle)
