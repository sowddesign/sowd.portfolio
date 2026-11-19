---
# MÉTHODE — PAGE D'INTRODUCTION DE L'ÉTAPE « DÉFINIR » (page00)
# Cette étape pointe vers ce fichier par « intro: definir » dans content/methode/ordre.yaml.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.

# Petit libellé au début du titre (le titre commence juste après, puis passe à la ligne dessous)
libelle: Préciser

# Titre (H3)
titre: Continue de faire défiler pour découvrir ce que je fais à chaque étape et ce que cela apporte au projet.

# Texte sous le titre
texte: Une étape t’intéresse ? Sélectionne-la directement dans la liste.

# Consigne animée en bas
consigne: Défiler

# ——— PAGE « BONUS » (lecture complétée) ———
# Ouverte depuis la tuile « Bonus », qui remplace le compteur « Terminés » quand toutes les pages de l'étape sont lues.
# Sans ces lignes, l'étape n'a pas de page bonus et le compteur reste affiché.

# Titre (H3)
fin_titre: Lecture complétée

# Texte sous le titre
fin_texte: Pour te remercier du temps que tu as passé à lire ce contenu, je t'ai préparé un souvenir.

# Image affichée (dans public/methode/fin/)
fin_image: definir.webp

# Rognage maximal de fin_image, en pixels : haut puis bas (écrans larges, pour tout garder à l'écran).
# Ici : 60 px de marge gardés en haut et en bas de la fleur, elle n'est jamais coupée.
fin_image_rognage: 70 84

# Carte téléchargée en haute qualité, bouton de téléchargement dans l'image (dans public/methode/fin/) :
# export Figma (node 5859:31908, x2) avec le QR code, sans date ; la date du jour y est écrite au téléchargement.
fin_image_hd: definir.png

# Emplacement de la date dans fin_image_hd, en pixels : bord droit, puis haut de la ligne (32 px de haut dans Figma).
# Ici : à droite de « 02. Définir – lecture complétée », centrée sur sa ligne, comme dans Figma (x2).
fin_date_position: 2537 1947
---
