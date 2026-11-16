---
# MÉTHODE — PAGE « PERSONAES »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/personaes/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\whithish_02.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/200
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 152.9, x: 0.0, y: -26.5 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: persona
    desktop: { x: 39.0, y: 76.8 }
    mobile: { x: 40.4, y: 82.3, rotation: -2.9 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Le persona est une description fictive mais réaliste d’un utilisateur type, fondée sur la recherche.
  Il incarne un profil représentatif des utilisateurs cibles, avec leurs objectifs, leurs besoins, leurs comportements et leurs contraintes.

  De cette façon, chaque idée, chaque décision, chaque choix de design est alors confronté à la question :
  *« Est-ce que cela conviendrait à notre persona ? »*
  Cette référence commune aide l’équipe à aligner ses choix sur les besoins réels des utilisateurs plutôt que sur des intuitions ou des opinions internes.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: graine
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md, plus :
#   ![description](desktop.webp | mobile.webp) → image recadrée autrement en mobile et en tablette petite
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## De la cible au persona

Lors du projet graine, deux cibles ont été identifiées : une principale et une secondaire, à ne pas négliger.

---

Nous avons donc réalisé un persona par cible :

1. Sara, 24 ans.
2. Un couple de 35 à 40 ans, avec un enfant d’environ 10 ans.

---

> Le procédé étant le même pour les deux, je n’en présenterai qu’un.

## Données utilisateurs

Pour construire le persona principal, Sara, j’ai croisé plusieurs enseignements issus de sources différentes :

---

Les 18 à 34 ans sont les plus susceptibles d’être intéressés par notre application.

> → Recherches quantitatives (études)

||

Il y a plus de femmes que d’hommes qui estiment l’entretien des plantes contraignant.

> → Recherches quantitatives (études)

---

Ils s’informent sur les plantes surtout sur internet et auprès de leurs proches.

> → Recherches quantitatives (questionnaire)

||

70,2 % des répondants estiment que des missions quotidiennes les aideraient à mieux entretenir leurs plantes.

> → Recherches quantitatives (questionnaire)

## Humaniser ces données

![Persona principal du projet graine : Sara H.](persona-sara.webp | persona-sara-mobile.webp)

> Persona principal, Sara H. (documentation graine).

## Ce que cela a apporté

Face à chaque choix, nous nous sommes demandé comment Sara aimerait que soit son application.

---

Par exemple :

Sara voudrait des rappels pour ne rien oublier. Les missions quotidiennes transforment ces rappels en objectifs à accomplir chaque jour.
