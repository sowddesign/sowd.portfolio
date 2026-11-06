---
# MÉTHODE — PAGE « OBSERVATIONS TERRAIN »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/observations-terrain/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
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
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: observations
    desktop: { x: 21.9, y: 33.3 }
    mobile: { x: 34.9, y: 20.0 }
  - texte: terrain
    desktop: { x: 72.9, y: 33.3 }
    mobile: { x: 60.2, y: 20.0 }

# « En quelques mots » : colonne de gauche, puis colonne de droite (ligne vide = nouveau paragraphe)
definition_gauche: À compléter.
definition_droite: À compléter.

# Bouton vers le projet cité (texte et adresse)
projet_bouton: À compléter
projet_lien: /projects
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

À compléter.
