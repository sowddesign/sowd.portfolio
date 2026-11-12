---
# MÉTHODE — PAGE « BENCHMARKS »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/benchmarks/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - analyser
  - confronter
  - concurrents
  - conventions
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\brand_02.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/400
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 129.0, x: 0.0, y: 0.0 }
image_mobile: { taille: 85.0, x: 0.0, y: 15.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: benchmark
    desktop: { x: 49.9, y: 70.6 }
    mobile: { x: 50.0, y: 75.3 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique. Liste numérotée : « #### Titre » (facultatif) puis une ligne « 1. texte » par élément.
definition: |
  Le benchmark en UX est une analyse comparative de produits ou d’expériences proposés par des concurrents.

  #### Objectifs :
  1. Comprendre comment ces produits répondent aux besoins des utilisateurs.
  2. Repérer leurs manques pour trouver des opportunités de se différencier.
  3. S’inspirer des bonnes pratiques et éviter les erreurs déjà commises.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: scholar
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

## Démarche

Pour Scholar, nous avons mené un benchmark des applications d’apprentissage en quelques minutes par jour.

---

Aucune ne traitait de typographie : nous avons donc étudié des concurrents indirects, qui partagent notre format mais pas notre sujet.

> Critères comparés : onboarding, personnalisation, types d’exercices, direction artistique…

---

<<

**Applications retenues :**

1. Brilliant
2. Duolingo
3. Sans fautes

||

> J’ai analysé Brilliant et Sans fautes ; mon binôme s’est chargé de Duolingo. Je présente donc ces deux applications.

## Brilliant

Application d’apprentissage interactive qui enseigne les mathématiques, la programmation, les sciences et l’analyse de données.

Elle repose sur des exercices courts, visuels et ludiques, plutôt que sur des cours magistraux.

---

![Brilliant : choix des objectifs à l’onboarding](brilliant-onboarding.png)

||

**Un onboarding basé sur les objectifs :**

L’utilisateur choisit lui-même ses objectifs, et l’application lui propose un contenu en fonction.

---

![Brilliant : choix du niveau, illustré par des exemples](brilliant-niveau.png)

||

**Un niveau illustré par des exemples :**

Pour évaluer son niveau, chaque option est illustrée par un exemple concret. C’est plus parlant qu’une simple étiquette « Débutant » ou « Intermédiaire ».

---

![Brilliant : exercice en glisser-déposer](brilliant-exercices.png)

||

**Des exercices variés et interactifs :**

Les façons de répondre changent d’un exercice à l’autre. J’ai retenu le glisser-déposer : il rend l’exercice plus dynamique et garde l’utilisateur actif.

## Sans fautes

Application d’apprentissage qui aide à améliorer l’orthographe, la grammaire et la conjugaison française.

Elle propose des exercices courts, des jeux, des dictées et un parcours personnalisé adapté au niveau de l’utilisateur.

---

![Sans fautes : choix de l’avatar parmi des figures de la langue française](sans-fautes-avatars.png)

||

**Une direction artistique liée au sujet :**

L’application met en scène des figures de la langue française (Victor Hugo, George Sand, MC Solaar…) : l’univers visuel renforce le thème.

---

![Sans fautes : proposition de jouer en famille](sans-fautes-famille.png)

||

**Un mode à plusieurs :**

L’application propose de jouer à plusieurs. Ce n’est pas une priorité pour notre sujet, mais c’est une piste à étudier.

## Ce que le benchmark a apporté

**Ce que nous avons repris pour Scholar :**

1. Un onboarding pour se situer.
*Comme chez Brilliant, l’utilisateur précise son niveau dès le départ, et l’application adapte les contenus en fonction.*
2. Un test de niveau.
*Nous sommes allés plus loin qu’une simple auto-évaluation : un court test permet de situer précisément l’utilisateur.*
3. Une direction artistique liée au sujet.
*Comme Sans fautes avec ses figures de la langue française, Scholar s’appuie sur une DA ancrée dans son thème : l’encre, qui rappelle les débuts de la typographie, bien avant l’ordinateur.*

||

![Scholar : question du test de niveau](scholar-test-niveau.png)

> Test de niveau (application Scholar)
