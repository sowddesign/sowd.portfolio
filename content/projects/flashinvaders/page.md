---
# TEXTES DE LA PAGE PROJET FLASH INVADERS (/projects/flashinvaders)
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Les textes sont entre guillemets : garde-les. Pour un retour à la ligne, écris \n.
# Mise en forme dans un texte : **gras**, *italique*, [lien](https://…).
# Les images et vidéos sont dans public/projects/flashinvaders/.

# Contexte
contexte_titre: Contexte
contexte_paragraphes:
  - "Flash Invaders est une application qui permet de « flasher » les mosaïques de Space Invader dans la rue pour gagner des points."
  - "C’est un projet scolaire (Mastère UX Design), réalisé seul sur **trois mois**, autour de la thématique des **nouvelles mobilités**. J’ai proposé une refonte de l’application pour en améliorer l’expérience, sur le plan fonctionnel comme graphique."
# Note en italique, colonne du milieu
contexte_note: "L’application étant gamifiée, je parle de joueurs plutôt que d’utilisateurs."
# Mes rôles (repris de l’introduction au projet de la méthode)
roles:
  - UX / UI Designer
  - Prototype

# Libellés communs
objectif: "Objectif :"
voir_methode_observation: Voir la méthode Observation terrain
voir_methode_user_journey: Voir la méthode User journey

# Découvrir (01)
phase_1_titre: Découvrir
phase_1_numero: (01)
phase_1_sous_titre: Explorer les besoins

entretiens_titre: Entretiens exploratoires
entretiens_sous_titre: L’organisation
entretiens_duree_label: "Durée :"
entretiens_duree: 20 à 30 minutes par entretien.
entretiens_objectif: "Comprendre les différentes façons de jouer, pour améliorer l’expérience de chacun **sans changer sa façon de jouer**."
entretiens_criteres_label: "Critères de recrutement :"
entretiens_criteres:
  - Habiter à Paris ou en proche banlieue.
  - Avoir déjà joué ou jouer actuellement.
  - Moitié de joueurs de longue date, moitié de joueurs récents (certains avaient téléchargé l’application juste avant l’entretien).
entretiens_questions_label: "Exemples de questions posées :"
entretiens_questions:
  - question: "Quand et comment avez-vous découvert Flash Invaders ?"
    objectif: "Comprendre ce qui motive le joueur et, s’il joue depuis longtemps, ce qui lui donne envie de continuer."
  - question: "Combien d’invaders avez-vous dans votre collection ?"
    objectif: "Croiser la collection et l’ancienneté du joueur pour établir une typologie."
  - question: "Flash Invaders vous a-t-elle permis de mieux connaître la ville ?"
    objectif: "Savoir si le joueur cherche seulement à chasser, ou si la **découverte de la ville** compte aussi."
  - question: "Comment faites-vous pour repérer les invaders manquants ?"
    objectif: "Identifier les besoins d’information que l’application ne couvre pas."
  - question: "Comment faites-vous ensuite pour les localiser ?"
    objectif: "Repérer des comportements émergents et voir si d’autres applications y répondent."

audit_titre: Audit de l’existant
audit_sous_titre: "Exemple : la page « Live »"
audit_positifs_label: "Points positifs :"
audit_positifs:
  - "L’aspect communautaire est mis en avant (pseudos visibles) : on voit que la communauté est active."
  - "L’option « Ville incluse », une fois désactivée, masque les invaders déjà flashés dans sa ville et évite de se gâcher la surprise."
  - Les joueurs qui débutent leur collection peuvent voir les invaders existants.
audit_negatifs_label: "Points négatifs :"
audit_negatifs:
  - Aucune interaction n’est possible avec les photos ou les pseudos des autres joueurs.
  - Impossible de n’afficher que les invaders flashés par ses amis ou par les joueurs qu’on suit.
audit_axes_label: "Axes d’amélioration :"
audit_axes:
  - "Ajouter les invaders présentés à sa **liste de souhaits**."
  - "Ajouter un **onglet Amis** pour suivre leur activité."

benchmark_titre: Benchmark concurrentiel
benchmark_sous_titre: "Exemple : la fonctionnalité Routes de Pokémon GO"
benchmark_retenir_label: "À retenir :"
benchmark_retenir:
  - Création de routes à partir du suivi GPS.
  - Départ et arrivée sur des éléments du jeu (les Pokéstops).
  - Partage avec la communauté et choix d’une route sur une carte dédiée.
benchmark_eviter_label: "À éviter :"
benchmark_eviter:
  - Les routes hors de son périmètre ne sont pas visibles.
  - "Pas de dimension communautaire : impossible de faire une route à plusieurs."

observation_titre: Observation terrain
observation_organisation_label: "Organisation :"
observation_organisation: "J’ai organisé une balade dans le Marais avec trois joueurs de profils différents : un expérimenté, un occasionnel et un novice."
observation_deroule_label: "Déroulé :"
observation_deroule:
  - Pendant la phase d’observation, je ne suis pas intervenu, pour ne pas influencer les joueurs. J’ai suivi, observé et pris des notes.
  - À mi-parcours, j’ai interrogé chaque joueur à l’écart du groupe sur ce qui enrichirait son expérience.
observation_bonus_label: "Bonus :"
observation_bonus: "Nous avons croisé un autre joueur en train de flasher un invader. Il suivait un itinéraire sur son téléphone, s’arrêtait à des points précis pour regarder autour de lui et marchait d’un bon pas."
observation_apports_label: "Ce que cela a apporté :"
observation_apports:
  - constat: L’expérimenté passait sans cesse de Flash Invaders à Google Maps.
    refonte: "→ Refonte : des **marqueurs personnels** dans l’application."
  - constat: Les joueurs ont choisi un itinéraire qui passait par un maximum d’invaders.
    refonte: "→ Refonte : des **balades guidées** par des indices."
  - constat: Sans l’aide de l’expérimenté, le novice aurait peut-être abandonné.
    refonte: "→ Refonte : des **fonctionnalités communautaires**."

questionnaire_titre: Questionnaire et réseaux sociaux
questionnaire_deroule_label: "Déroulé :"
questionnaire_deroule: "J’ai créé le questionnaire sur Google Forms et l’ai envoyé aux joueurs de mon entourage, puis publié sur Reddit. Il comptait 17 questions, pour 3 à 5 minutes de réponse. Les réponses ont été collectées dans Google Sheets."
questionnaire_lien_label: "Lien :"
questionnaire_lien_texte: Questionnaire Projet Flash Invaders
questionnaire_lien: https://docs.google.com/forms/d/e/1FAIpQLSdjNQkbkef8hUgJW9SN87c-1lJnpcvUEkGTFLicixz8YmABRg/viewform?usp=header
questionnaire_resultats_label: "Résultats :"
questionnaire_resultats:
  - chiffre: "20"
    legende: Joueurs ayant répondu
  - chiffre: "3"
    legende: Profils de joueurs identifiés
  - chiffre: "4"
    legende: Applications utilisées en moyenne pendant une session de jeu

# Définir (02)
phase_2_titre: Définir
phase_2_numero: (02)
phase_2_sous_titre: Préciser le problème à résoudre

personas_titre: Personas
personas:
  - cible: "Cible principale :"
    prenom: Élodie
    description: fan d’Invader, très investie dans l’application.
    image: persona-elodie.webp
  - cible: "Cible secondaire :"
    prenom: Romain
    description: joueur régulier mais peu investi.
    image: persona-romain.webp

user_journey_titre: User journey
user_journey_sous_titre: Parcours d’Élodie sur l’application actuelle
user_journey_texte:
  - "Presque tout se passe **hors de l’application** : Instagram pour enquêter, Maps pour placer ses points et tracer son itinéraire, WhatsApp ou Discord pour retrouver ses amis. Flash Invaders n’est ouverte que le temps de flasher."
  - "La refonte vise donc à **ramener ces usages dans l’application**."

# Développer (03)
phase_3_titre: Développer
phase_3_numero: (03)
phase_3_sous_titre: Imaginer des solutions

arborescence_titre: Arborescence
arborescence_audit_label: "Après l’audit :"
arborescence_audit: L’audit a permis d’identifier les modifications à apporter page par page. L’objectif est de rendre plus lisibles certaines fonctionnalités existantes et d’y intégrer les nouvelles.
# Légende : une ligne par page (« page » = nom utilisé par les post-it ci-dessous ; la couleur est fixée dans le code).
arborescence_legende:
  - page: flash
    nom: Flash
  - page: carte
    nom: Carte
  - page: collection
    nom: Collection
  - page: communaute
    nom: Communauté
  - page: compte
    nom: Compte
arborescence_legende_note: Chaque couleur correspond à une page.
# Post-it : ligne (1 à 6) et colonne (1 à 9) dans le tableau, page (couleur), texte, et page affichée en bas.
arborescence_postits:
  - { ligne: 1, colonne: 2, page: flash, texte: "On/Off\nLumière flash", etiquette: Flash }
  - { ligne: 1, colonne: 3, page: flash, texte: Flasher un invader, etiquette: Flash }
  - { ligne: 1, colonne: 5, page: carte, texte: Chercher une adresse, etiquette: Carte }
  - { ligne: 1, colonne: 6, page: carte, texte: Naviguer sur la carte, etiquette: Carte }
  - { ligne: 1, colonne: 7, page: collection, texte: Regarder ses invaders déjà flashés, etiquette: Collection }
  - { ligne: 1, colonne: 8, page: communaute, texte: Ajouter un ami, etiquette: Communauté }
  - { ligne: 1, colonne: 9, page: communaute, texte: Activer/désactiver flash, etiquette: Communauté }
  - { ligne: 1, colonne: 10, page: compte, texte: Voir ses stats joueur, etiquette: Compte }
  - { ligne: 1, colonne: 11, page: compte, texte: Accéder aux paramètres, etiquette: Compte }
  - { ligne: 2, colonne: 2, page: flash, texte: "On/Off\nPartage ami", etiquette: Flash }
  - { ligne: 2, colonne: 3, page: flash, texte: S’informer sur un invader, etiquette: Flash }
  - { ligne: 2, colonne: 5, page: carte, texte: Paramétrer sa balade (+/- fonct.), etiquette: Carte }
  - { ligne: 2, colonne: 6, page: carte, texte: Placer des marqueurs sur l’itinéraire, etiquette: Carte }
  - { ligne: 2, colonne: 7, page: collection, texte: Voir les informations d’un invader, etiquette: Collection }
  - { ligne: 2, colonne: 8, page: communaute, texte: Voir actualités amis, etiquette: Communauté }
  - { ligne: 2, colonne: 9, page: communaute, texte: Activer/désactiver flash, etiquette: Communauté }
  - { ligne: 2, colonne: 10, page: compte, texte: Personnaliser son avatar, etiquette: Compte }
  - { ligne: 2, colonne: 11, page: compte, texte: Personnaliser ses couleurs d’interface, etiquette: Compte }
  - { ligne: 3, colonne: 5, page: carte, texte: Suivre l’itinéraire, etiquette: Carte }
  - { ligne: 3, colonne: 6, page: communaute, texte: Démarrer une balade commune, etiquette: Communauté }
  - { ligne: 3, colonne: 7, page: collection, texte: Comparer la collection (amis/global), etiquette: Collection }
  - { ligne: 3, colonne: 8, page: communaute, texte: Ajouter un marqueur sur la carte des amis, etiquette: Communauté }
  - { ligne: 3, colonne: 9, page: communaute, texte: Partager ce marqueur, etiquette: Communauté }
  - { ligne: 3, colonne: 10, page: compte, texte: Modifier adresses enregistrées, etiquette: Compte }
  - { ligne: 3, colonne: 11, page: compte, texte: Voir ses badges, etiquette: Compte }
  - { ligne: 4, colonne: 3, page: flash, texte: "Onboarding\nFlash", etiquette: Flash }
  - { ligne: 4, colonne: 4, page: carte, texte: "Onboarding\nNavigation/itinéraire", etiquette: Carte }
  - { ligne: 4, colonne: 5, page: carte, texte: Valider l’arrivée, etiquette: Carte }
  - { ligne: 4, colonne: 6, page: compte, texte: Voir l’historique des balades, etiquette: Compte }
  - { ligne: 4, colonne: 7, page: collection, texte: Voir les invaders manquants, etiquette: Collection }
  - { ligne: 4, colonne: 8, page: communaute, texte: Rejoindre les réseaux sociaux, etiquette: Communauté }
  - { ligne: 5, colonne: 5, page: carte, texte: "Stats sur la balade (temps, km…)", etiquette: Carte }
  - { ligne: 5, colonne: 6, page: compte, texte: Voir ses stats précédentes, etiquette: Compte }
  - { ligne: 5, colonne: 7, page: collection, texte: Cliquer sur un manquant, etiquette: Collection }
  - { ligne: 6, colonne: 4, page: carte, texte: Relancer la balade, etiquette: Carte }
  - { ligne: 6, colonne: 5, page: carte, texte: Partager sa balade et ses stats, etiquette: Carte }
  - { ligne: 6, colonne: 6, page: compte, texte: Partager d’anciennes balades, etiquette: Compte }
  - { ligne: 6, colonne: 7, page: collection, texte: Placer des marqueurs sur la carte, etiquette: Collection }

wireframe_titre: Wireframe
wireframe_sous_titre: Parcours d’inscription et tutoriels
wireframe_embed: https://embed.figma.com/design/mpaucUVKo6gh4MXMAg8fQ7/Projet-Trimestriel---Nouvelle-Mobilit%C3%A9?node-id=526-2312&embed-host=share&page-selector=false

design_system_titre: Design system et charte graphique

# Livrer (04)
phase_4_titre: Livrer
phase_4_numero: (04)
phase_4_sous_titre: Finaliser la solution

prototype_titre: Prototype
prototype_sous_titre: "Vidéo de deux parcours : l’inscription et une balade avec itinéraire."

presentation_titre: Présentation Figma Slides
presentation_sous_titre: Support de la soutenance orale.
presentation_embed: https://embed.figma.com/deck/ri3YTgCNSn15MkbQZ9TOfP/Flash-Invaders-Pr%C3%A9sentation-18.04?node-id=1-807&viewport=-148%2C-140%2C0.75&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&embed-host=share
---
