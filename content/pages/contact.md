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

# Zone du message (pleine largeur, au-dessus du bouton) : mêmes réglages que les champs
message_titre: Ton message
message_details: détails détaillés
message_obligatoire: oui
message_icone: ""

# Bouton du formulaire, avant et après l'envoi
envoyer: Envoyer
envoye: Message envoyé
---
