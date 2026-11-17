---
# TEXTES DE LA PAGE CONTACT (/contact)
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.

# Titre de la page
titre: Contact

# Texte au-dessus de l'écran du visuel de photos (doubles espaces conservés)
photos_texte: "Quelques  photos  pour  que  tu  vois  qui  lira  ton  message. :)"

# Formulaire « me contacter » : petit texte au-dessus du titre (doubles espaces conservés), puis titre
formulaire_details: "Si  tu  souhaite"
formulaire_titre: me contacter

# Champs du formulaire, dans l'ordre d'affichage (deux par ligne à partir de la tablette).
# Chaque champ commence par « - ». Pour en ajouter un, copie un bloc entier ; pour en retirer un, supprime son bloc.
#   titre       : texte du champ
#   details     : petit texte sous le trait ("" = aucun)
#   obligatoire : oui ou non (astérisque ; le bouton Envoyer reste grisé tant qu'un champ obligatoire est vide)
#   icone       : nom d'un fichier de public/icons, sans « .svg » ("" = aucune icône)
#   type        : texte, email (doit être une adresse valide pour envoyer) ou telephone (clavier numérique, tout format accepté)
champs:
  - titre: Prénom
    details: ""
    obligatoire: oui
    icone: User
    type: texte
  - titre: Nom de famille
    details: ""
    obligatoire: oui
    icone: UsersFour
    type: texte
  - titre: Adresse e-mail
    details: Si tu veux que je te  recontacte par mail
    obligatoire: non
    icone: At
    type: email
  - titre: Téléphone
    details: Si tu préfère que je t’appelle
    obligatoire: non
    icone: Phone
    type: telephone

# Objet du message (pleine largeur, juste au-dessus du message) : mêmes réglages que les champs
objet_titre: Objet
objet_details: ""
objet_obligatoire: non
objet_icone: ""

# Zone du message (pleine largeur, au-dessus du bouton) : mêmes réglages que les champs
message_titre: Ton message
message_details: détails détaillés
message_obligatoire: oui
message_icone: ""

# Champ « email » en erreur (adresse invalide) : remplace son petit texte sous le trait jusqu'à la correction
email_invalide: Il faut un @ et . quelque chose pour que votre adresse mail soit valide.

# Bouton du formulaire, avant et après l'envoi
envoyer: Envoyer
envoye: Message envoyé

# Messages d'alerte qui sortent de sous le bouton pendant et après l'envoi
alerte_envoi: Message en cours d’envoi.
alerte_envoye: Ton message a été correctement envoyé.
# Échec : texte principal, puis petite ligne en italique dessous ("" = aucune).
# Une adresse e-mail écrite dans ces textes devient un lien cliquable.
# Échec : pas de connexion internet
alerte_hors_ligne: Ton message n'a pas pu être envoyé dû à un problème de connexion.
alerte_hors_ligne_details: N'oublie pas de copier ton message avant de rafraîchir la page.
# Échec : toute autre erreur (service indisponible, envoi refusé…)
alerte_echec: Ton message n'a pas pu être envoyé dû à un problème technique.
alerte_echec_details: Tu peux me contacter directement via sowd.design@gmail.com.

# Objet du mail que tu reçois
mail_objet: Nouveau message depuis le portfolio
---
