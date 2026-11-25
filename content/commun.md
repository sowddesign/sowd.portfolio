---
# TEXTES COMMUNS À TOUTES LES PAGES — en-tête, menu, pied de page, tuiles projet.
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : » (le site ne le retrouverait plus).
# Si le texte contient « : » ou commence par un caractère spécial, entoure-le de guillemets : "Naviguer :".
# Les doubles espaces sont conservés là où Figma en utilise (ex. « design  par »).
# Les lignes commençant par « # » sont des commentaires.

# Onglet du navigateur et moteurs de recherche
site_titre: sowd — portfolio
site_description: Portfolio sowd par Tom Lamy

# En-tête (desktop : boutons de pages ; mobile et tablette : bouton contact)
entete_accueil: accueil
entete_projets: projets
entete_a_propos: à propos
entete_contact: contact
# Bouton du menu mobile et tablette, lu par les lecteurs d'écran
menu_ouvrir: Ouvrir le menu
menu_fermer: Fermer le menu

# Bloc « Naviguer » (menu et pied de page)
naviguer_titre: "Naviguer :"
naviguer_accueil: Accueil
naviguer_showreel: Showreel
naviguer_demarche_ux: Démarche UX
naviguer_projets: Projets
naviguer_a_propos: À propos

# Bloc « Me contacter » (menu et pied de page)
# Le lien du mail et du téléphone suit le texte : modifier l'un modifie l'autre.
contacter_titre: "Me contacter :"
contacter_linkedin: LinkedIn
contacter_instagram: Instagram
contacter_email: sowd.design@gmail.com
contacter_telephone: 06.66.04.79.21

# Bloc « Tu veux en savoir plus ? » (pied de page)
savoir_plus_titre: Tu veux en savoir plus ?
savoir_plus_cv: Télécharger mon CV
savoir_plus_demarche_ux: Voir ma démarche UX
savoir_plus_contacter: Me contacter

# Message vers la démarche UX (bloc cliquable, la barre « | » fait partie de la DA)
message_curieux: Curieux|se ?
message_decouvre: Découvre comment je travaille

# Visuel à colorier du pied de page
visuel_afficher: Afficher tous les logos
visuel_remettre_noir: Remettre les logos en noir
visuel_recommencer: Recommencer
visuel_bien_joue: Bien joué ! Recommencer

# Bas du pied de page
pied_signature: sowd.design
pied_annee: 2026
pied_design_par: design  par

# Tuiles projet
tuile_nouveau: Nouveau
tuile_voir_projet: Voir le projet
# Projet marqué « off » dans content/projects/ordre.yaml : bouton désactivé de la tuile
tuile_bientot: Bientôt disponible

# Section en bas des pages projet
autres_projets_titre: D’autres projets

# Tableau questions / réponses : ligne de titre (« Réponse : » n'apparaît qu'à partir de la tablette)
infos_numero: N°
infos_question: "Question :"
infos_reponse: "Réponse :"

# Carrousel de photos : boutons, lus par les lecteurs d'écran
photos_precedente: Photo précédente
photos_suivante: Photo suivante
photos_fermer: Revenir à la mosaïque
# Consigne animée sur écran tactile, en bas à gauche de la mosaïque
photos_appuie: Appuie
# Consigne animée en mobile, en bas à gauche de l'image d'en-tête des pages de la méthode
header_image_reste_appuye: Reste appuyé

# Champ de formulaire : bouton qui efface la saisie (infobulle au survol prolongé, lecteurs d'écran)
champ_supprimer: Supprimer

# Texte qui remplace le curseur au survol des boutons icône (souris)
curseur_menu_ouvrir: Naviguer
curseur_menu_fermer: Fermer
curseur_visuel_afficher: Afficher
curseur_visuel_remettre_noir: Recommencer
curseur_voir_projet: Voir le projet
curseur_bientot: Bientôt disponible
curseur_photos_precedente: Précédente
curseur_photos_suivante: Suivante
curseur_photos_fermer: Fermer
curseur_champ_supprimer: Supprimer
curseur_agrandir: Agrandir
# Texte au curseur sur « Méthode : double diamant » (accueil) : invite à regarder le schéma dessous
curseur_regarder_dessous: Regarder en dessous
# Contrôles de la vidéo : texte au curseur
curseur_video_lecture: Lecture
curseur_video_pause: Pause
curseur_couper_son: Couper le son
curseur_remettre_son: Remettre le son
curseur_video_fermer: Fermer
# Méthode, boutons « précédente » et « suivante » : suivi du nom de l'étape visée
curseur_methode_etape: "Étape :"
# Introduction au projet (pages de la méthode) : bouton pour l'ouvrir et pour la fermer
curseur_methode_intro_ouvrir: Ouvrir
curseur_methode_intro_fermer: Fermer
# Méthode, tuiles de la liste des pages (desktop, non réduites) : texte au curseur
curseur_methode_selectionner: Sélectionner
curseur_methode_fermer_page: Fermer

# Contrôles de la vidéo : boutons et barres, lus par les lecteurs d'écran
video_lecture: Lire la vidéo
video_pause: Mettre la vidéo en pause
video_couper_son: Couper le son
video_remettre_son: Remettre le son
video_son_coupe: son coupé
video_volume: Volume
video_progression: Progression de la vidéo
video_agrandir: Afficher la vidéo en plein écran
video_fermer: Quitter le plein écran

# Extraits audio (pages de la méthode) : boutons et barre, lus par les lecteurs d'écran
# (texte au curseur et volume : ceux de la vidéo)
audio_lecture: Écouter l’extrait
audio_pause: Mettre l’extrait en pause
audio_progression: Progression de l’extrait

# Chargement du site : barre de progression, lue par les lecteurs d'écran
chargement_progression: Chargement du site

# Double diamant (tournesols) : libellés sur le visuel
double_probleme: problème
double_solution: solution
double_decouvrir: découvrir
double_definir: définir
double_developper: développer
double_livrer: livrer
# Textes de chaque étape ; [mot]{brand} met un mot en couleur ; retour à la ligne : écrire le texte après « | » sur plusieurs lignes (comme double_texte_diamants)
double_texte_diamants: |
  Le [Double Diamant]{brand} me permet de partir d’un problème pour mieux comprendre les besoins des utilisateurs, puis de tester plusieurs pistes avant de livrer une solution qui y répond.
double_texte_probleme: |
  [Comprendre le problème]{brand} : 
  Je pars d’une question large. Ce que j’apprends auprès des utilisateur m’aide à préciser le problème."
double_texte_01: "J’écoute les utilisateurs et je les observe pour comprendre ce qu’ils essaient de faire, ce qui les freine et ce dont ils ont [besoin]{brand}."
double_texte_02: "Je regarde les problèmes récurrent ou ce qui gêne le plus les utilisateurs. À partir de là, je [précise le problème]{brand} à résoudre en priorité."
double_texte_solution: |
  [Concevoir la solution]{brand} : 
  Je teste plusieurs pistes avant de livrer une solution qui répond aux besoins des utilisateurs.
double_texte_03: "Je crée des [versions simples]{brand} de mes idées pour que les utilisateurs puissent les essayer. Leurs [retours]{brand} m’aident à retenir la piste la plus utile."
double_texte_04: "Je finalise la solution retenue et je vérifie qu’elle répond aux [besoins de départ]{brand} avant de la mettre à disposition."
# Mobile et écran tactile : consigne, boutons et indicateur d’étapes
double_consigne: appuie sur un tournesol
double_commencer: Découvrir
double_redecouvrir: Re-découvrir
double_revenir_debut: Revenir au début
double_etape_precedente: Étape précédente
double_etape_suivante: Étape suivante
# Copyright en bas du visuel
double_copyright: "© 2026  Tom  Lamy  - Création  graphique  originale."

# Méthode (pages de chaque étape) : titres des deux parties et boutons communs
methode_definition_titre: En quelques mots
methode_projet_titre: Utilisation dans un projet
methode_etape_suivante: Voir la prochaine étape
# Texte court du même bouton, affiché quand le texte ne tient pas sur une ligne
methode_etape_suivante_court: Prochaine étape
# En-tête des étapes de la méthode : boutons vers l'étape précédente et suivante
methode_precedente: précédente
methode_suivante: suivante
# Boutons de l'accordéon mobile (lus par les lecteurs d'écran, suivis du titre de la partie)
methode_ouvrir: Ouvrir
methode_fermer: Fermer
# Image cliquable (lue par les lecteurs d'écran, suivie de la description de l'image)
methode_agrandir: Agrandir l’image
# Image agrandie : bouton de fermeture (lu par les lecteurs d'écran)
methode_image_fermer: Fermer l’image agrandie
# Menu des étapes : compteur d'étapes terminées (en affichage réduit, lu seulement par les lecteurs d'écran)
methode_terminees: Terminés
# Tuile « Bonus » qui remplace le compteur quand toutes les pages de l'étape sont lues : numéro, puis texte
methode_bonus: Bonus
methode_bonus_texte: Lecture complétée
# Page bonus : premier bouton sous l'image (le second reprend methode_etape_suivante), puis son adresse
methode_bonus_page_secrete: Accéder à l’éditeur
# Texte court du bouton, quand le texte ne tient pas sur une ligne (comme les autres pages de la méthode)
methode_bonus_page_secrete_court: Éditeur
# Adresse : la page secrète, éditeur de dessin ouvert directement (#editeur)
methode_bonus_page_secrete_lien: /page-secrete#editeur
# Bouton de téléchargement dans l'image (image haute qualité) : texte accessible et texte au curseur
methode_bonus_telecharger: Télécharger
# Légende sous l'image, sans lien
methode_bonus_legende: Réalisé par Tom Lamy avec l’éditeur sowd.
---
