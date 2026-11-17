---
# TEXTES DE LA PAGE CONTACT (/contact)
# Modifie seulement le texte après « : ». Ne change pas le nom avant « : ».
# Si le texte contient « : », entoure-le de guillemets.

# Titre de la page
titre: Contact

# Texte au-dessus de l'écran du visuel de photos (doubles espaces conservés)
photos_texte: "Quelques  photos  pour  que  tu  vois  qui  lira  ton  message. :)"

# Formulaire « me contacter » : petit texte au-dessus du titre (doubles espaces conservés), puis titre
formulaire_details: "Si  tu  souhaites"
formulaire_titre: me contacter

# Légende des champs obligatoires, en haut à droite sous le trait du titre
obligatoire_legende: "* : obligatoire"

# Champs « au moins un » (voir obligatoire ci-dessous) : texte au-dessus, puis mot entre deux champs
au_moins_un_texte: "Au moins l’un des deux est obligatoire :"
au_moins_un_separateur: et / ou

# Champs du formulaire, dans l'ordre d'affichage (deux par ligne à partir de la tablette).
# Chaque champ commence par « - ». Pour en ajouter un, copie un bloc entier ; pour en retirer un, supprime son bloc.
#   titre       : texte du champ
#   details     : petit texte sous le trait ("" = aucun)
#   obligatoire : oui, non ou au moins un (astérisque ; le bouton Envoyer reste grisé tant qu'un champ obligatoire est vide).
#                 « au moins un » : les champs qui l'ont sont regroupés (texte au_moins_un_texte au-dessus, au_moins_un_separateur
#                 entre eux) ; il suffit que l'un d'eux soit rempli correctement
#   icone       : nom d'un fichier de public/icons, sans « .svg » ("" = aucune icône)
#   type        : texte, email (doit être une adresse valide pour envoyer) ou telephone (clavier numérique ; numéro
#                 complet de France, Canada, Maroc, Suisse, ou avec indicatif + d'un autre pays)
#   autocompletion : ce que le navigateur peut proposer de remplir — given-name (prénom), family-name (nom), name (nom complet),
#                    email, tel ou organization (entreprise) ; "" = aucune proposition
champs:
  - titre: Prénom
    details: ""
    obligatoire: oui
    icone: User
    type: texte
    autocompletion: given-name
  - titre: Nom de famille
    details: ""
    obligatoire: oui
    icone: UsersFour
    type: texte
    autocompletion: family-name
  - titre: Adresse e-mail
    details: Si tu souhaites que je te recontacte par mail.
    obligatoire: au moins un
    icone: At
    type: email
    autocompletion: email
  - titre: Téléphone
    details: Si tu préfères que je t’appelle
    obligatoire: au moins un
    icone: Phone
    type: telephone
    autocompletion: tel

# Objet du message (pleine largeur, juste au-dessus du message) : mêmes réglages que les champs
objet_titre: Objet de ton message
objet_details: ""
objet_obligatoire: non
objet_icone: ""

# Zone du message (pleine largeur, au-dessus du bouton) : mêmes réglages que les champs
message_titre: Ton message
message_details: N’hésite pas à donner le plus de détails possible concernant ta demande, je réponds en général sous 48 h.
message_obligatoire: oui
message_icone: ""

# Champ « email » en erreur (adresse invalide) : remplace son petit texte sous le trait jusqu'à la correction
email_invalide: Il faut un @ et . quelque chose pour que votre adresse mail soit valide.

# Champ « telephone » en erreur (numéro trop court ou invalide) : remplace son petit texte sous le trait jusqu'à la correction
telephone_invalide: "Il manque des chiffres ou le numéro n’est pas valide (ex. : 06 12 34 56 78 ou +33 6 12 34 56 78)."

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
# Objet du mail quand le champ « Objet » est rempli : ce début, puis l'objet saisi (espace final conservé grâce aux guillemets)
mail_objet_debut: "fr:portfolio : "
---
