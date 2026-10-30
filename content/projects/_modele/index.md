---
# MODÈLE DE PROJET — dupliquer ce dossier (content/projects/_modele) pour créer un projet.
# Le nom du dossier devient l'adresse de la page : content/projects/mon-projet/ → /projects/mon-projet
# (minuscules, tirets, pas d'espace ni d'accent). Les dossiers commençant par « _ » sont ignorés.
# Les images vont dans un dossier du même nom dans public : public/projects/mon-projet/.
# Les lignes commençant par « # » sont des commentaires, tu peux les supprimer.

# Titre du projet (obligatoire)
title: Titre du projet

# Type de projet, affiché sur la tuile « new » (facultatif)
type: Personnel

# Année (obligatoire)
year: 2026

# Tags, affichés sur la tuile « new » : un tag par ligne, précédé de « - » (facultatif)
tags:
  - UX researcher
  - DSM
  - DA

# Numéro d'ajout : le premier projet a 1, le suivant 2, etc. Donne au nouveau projet le numéro
# le plus grand : il s'affichera en premier, avec le libellé « Nouveau » et la grande tuile « new ».
# Deux projets ne peuvent pas avoir le même numéro.
order: 1

# Nom du fichier image de la tuile, placé dans public/projects/mon-projet/ (obligatoire)
image: cover.png
---

Texte de la page projet (pas encore affiché).
