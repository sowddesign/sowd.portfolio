---
# MÉTHODE — PAGE « SCÉNARIOS D'USAGE »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/scenarios-usage/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - imaginer
  - raconter
  - situation
  - contrainte
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\darker_02.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/500
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 167.5, x: -0.3, y: -6.4, rotation: 8.2 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: scénarios
    desktop: { x: 33.1, y: 44.1, rotation: -8.2 }
    mobile: { x: 32.3, y: 44.6, rotation: -10.2 }
  - texte: "d’usage"
    desktop: { x: 63.8, y: 35.4, rotation: -8.2 }
    mobile: { x: 66.1, y: 49.0, rotation: -10.2 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Le scénario d’usage décrit une **[situation concrète]{dark}** dans laquelle un utilisateur donné, souvent le persona, utilise le produit.

  Il précise l’objectif que l’utilisateur cherche à atteindre et le contexte de l’interaction. Il permet de repérer, **[avant de concevoir]{dark}**, les étapes, les besoins et les contraintes du parcours.
  *Là où le user journey retrace un parcours existant, le scénario d’usage imagine celui du futur produit.*

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: graine
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/sections/recherches-quantitatives.md, plus :
#   ![description](desktop.webp | mobile.webp) → image recadrée autrement en mobile et en tablette petite
#   ![description](fichier.webp){mention: texte} → texte posé sur l'image, en bas à droite
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Mise en scène du persona

Lors du projet [graine](/projects/graine), j'ai imaginé de courtes histoires pour visualiser les interactions entre l’utilisateur et l’application.

---

*Le scénario présenté ici s’appuie sur Sara, notre persona principal.*

## Le scénario : l’entretien du soir

Ce scénario met en scène une fonctionnalité qui aide à s’occuper de ses plantes au quotidien.

---

1. Sara rentre du travail. Elle ouvre l’application et voit, dès l’accueil, les tâches d’entretien du jour sous forme de stories (de courtes séquences à faire défiler, comme sur Instagram).
2. Grâce aux icônes affichées sur les stories, elle sait qu’elle va devoir arroser et tailler : elle prépare son arrosoir et ses ciseaux.
3. Elle ouvre la story de sa première plante.
4. C’est son premier arrosage : l’application lui propose un tutoriel illustré par des schémas animés et des vidéos. « Pour cette plante, verse directement au cœur, dans le réservoir naturel. Ça lui suffira. »
5. À la demande de l’application, elle prend une photo.
6. L’application analyse la photo et confirme que l’arrosage a été fait correctement.
7. Elle gagne des points et peut passer à la story suivante.

||

![Deux mains arrosent une broméliacée en pot avec un petit arrosoir, au cœur de la plante](entretien-du-soir.webp | entretien-du-soir-mobile.webp){mention: Image générée avec l’IA}

> Illustrer le scénario peut faire apparaître des détails qu’un texte cache : ici, il faut les deux mains pour arroser.

## Ce que cela a apporté

**Différencier les tâches d’entretien**

Arroser, tailler, rempoter : une plante peut demander plusieurs tâches différentes, parfois le même jour.

En écrivant le scénario, je me suis rendu compte qu’il fallait les distinguer au **[premier coup d’œil]{dark}**, avant même de commencer les maquettes. Nous avons donc ajouté une icône par tâche : Sara sait quel matériel préparer avant de commencer.

---

**Des mains occupées**

L’image a fait apparaître une contrainte : les **[deux mains]{dark}** sont prises par l’arrosoir, ou plongées dans la terre. Il devient impossible de manipuler son téléphone en même temps.

Plusieurs solutions en sont sorties :

<<

- Prévisualiser les vidéos du tutoriel avant de commencer la tâche.

||

- Faire passer les étapes automatiquement, à un rythme adapté au niveau de l’utilisateur.

>>
