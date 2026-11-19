---
# MÉTHODE — PAGE « DÉVELOPPEMENT IA »
# Son étape, sa place et son nom dans le menu se règlent dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.
# Les images vont dans public/methode/developpement-ia/ (même nom que ce fichier).

# Image d'en-tête : mots-clés (au survol ; en desktop, groupés deux par deux « a - b »)
image_mots_cles:
  - à compléter
# Fichier de l'image d'en-tête (facultatif : vide = fond blanc)
# Nom seul = dans le dossier des images de la page ; sinon chemin depuis public (ex. public\pages\photo.png)
image_fichier: public\pages\bright_06.webp
# Couleur de fond derrière l'image (facultatif : vide = blanc).
# Au choix (tokens primitive/color/brand) : brand/50, brand/100, brand/200, brand/300, brand/400, brand/500,
# brand/600, brand/700, brand/800, brand/900, brand/950
image_fond: brand/300
# Placement de l'image, repris de Figma (desktop 800 × 218, mobile 376 × 218), en % de la hauteur du cadre :
# taille = hauteur de l'image, x = écart entre le centre de l'image et le centre du cadre, y = haut de l'image,
# rotation = inclinaison de l'image en degrés (sens horaire)
image_desktop: { taille: 138.0, x: 0.0, y: -11.7 }
image_mobile: { taille: 100.0, x: 0.0, y: 0.0 }
# Textes posés sur l'image, toujours visibles : centre du texte en % de l'image (x : largeur, y : hauteur),
# rotation en degrés par rapport à l'image, « couleur: blanc » = text/neutral/white
image_textes:
  - texte: développement IA
    desktop: { x: 44.7, y: 67.5 }
    mobile: { x: 44.9, y: 67.3 }

# « En quelques mots » : une ligne par paragraphe ; ligne vide = nouveau groupe (plus d’espace).
# *texte* = italique.
definition: |
  Pour un designer web ou UX/UI, le développement assisté par l’IA consiste à utiliser une IA générative pour transformer des intentions de conception, des maquettes et des spécifications en code ou en interfaces fonctionnelles.

  Le designer garde la maîtrise des choix d’expérience : il précise les besoins, guide la génération et évalue les résultats.

# Projet cité : nom du fichier dans content/methode/projets/ (introduction au projet et bouton vers le projet)
projet: portfolio
---

# « UTILISATION DANS UN PROJET » — texte sous l'en-tête de commentaires (l'introduction au projet vient du projet cité)
#
#   Même écriture que content/methode/pages/recherches-quantitatives.md (images PNG, JPEG, WebP ou GIF).
#
# Mobile (pas de maquette Figma) : texte puis image.
#
# Les lignes commençant par « # » suivi d'un espace sont des commentaires.

## Du prototype au site en ligne

Pour ce [Portfolio](/projects/portfolio), j’ai voulu aller plus loin qu’un prototype Figma. Avec [Claude Code](https://claude.com/fr/product/claude-code), j’ai transformé mon prototype haute fidélité en un site hébergé en ligne.

*Pour l’hébergement j’utilise [Netlify](https://www.netlify.com/) connecté à [GitHub](https://github.com/).*

## Poser les bases

Même si l’IA a développé ce site, je voulais garder la main sur le design et les interactions. Je ne lui confiais que le développement, ce que je lui demandais, et rien de plus.

---

J’ai donc commencé par créer des skills : des instructions qui encadrent précisément ce que l’outil doit faire, et comment.

## Corrections rapides

Pendant le développement, j’ai fait tester le site à différents utilisateurs. Certaines fonctionnalités marchaient bien, mais il manquait aussi des comportements attendus.

J’ai pu les réaliser directement via des prompts plutôt que de repasser par une phase de prototypage, en plus d’être testables en direct localement.

*Par exemple, les utilisateurs essayaient de faire glisser la grille pour l’afficher, alors que le comportement prévu était un clic. J’ai ajouté le glissement.*

# À ajouter : la vidéo (en GIF) du glissement de la grille, dans la colonne de droite :
# ||
# ![Glissement de la grille …](glissement-grille.gif)

## Itérations

La majorité des animations ont été créées directement sur Figma. Pour certaines, comme l’animation de chargement ou les effets liés au curseur, j’ai utilisé l’IA.

*Fidèle à cette idée de l’IA comme outil, je retouchais chaque rendu proposé par des prompts.*

---

![Animation de chargement du portfolio : un tournesol en noir et blanc sur fond blanc](animation-chargement.webp)

*Animation de chargement de Portfolio sowd, entièrement créée avec des prompts (et mes assets).*

---

![Variantes de la barre de chargement proposées par Claude : actuelle, A — Ballottement, B — Ménisque](barre-chargement-variantes.webp)

*Pour l’animation de barre de chargement, Claude a proposé plusieurs variantes. J’ai retenu la variante A, car je souhaitais garder une animation légère et discrète mais qui se voit, les autres étaient trop visibles.*

*J’ai ensuite modifié la vitesse à laquelle le liquide s’écoule, le temps avant que le liquide rattrape l’état d’avancement, l’état à l’arrêt, etc.*

## Ce que cela a apporté

Le portfolio est passé d’un prototype à un vrai site en ligne, sans perdre les choix de design et d’interaction. L’IA a pris en charge le code, et j’ai gardé la décision sur ce que vit le visiteur.
