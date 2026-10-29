@AGENTS.md

## Développement des composants de l'UI kit depuis Figma

Règle permanente, à appliquer à la lettre pour chaque composant.

### Phase 1 — Analyse (aucun code)
1. Lire la frame Figma par ses données structurées (arbre des calques, variantes et propriétés, auto-layout, bordures, rayons, effets, styles de texte). **Jamais à partir d'un screenshot**, jamais d'estimation « à l'œil ».
2. Relever pour chaque propriété la variable Figma liée (couleur, espacement, corner, typo…) et sa correspondance dans les tokens du projet (`app/styles/`).
3. Lister tout ce qui manque ou pose problème : valeur en dur sans variable, variable sans token correspondant, état ou variante absent, icône manquante, etc.
4. Rendre compte à l'utilisateur :
   - si un élément manque, **lui demander de le créer dans Figma et de renvoyer le lien** ; ne rien inventer ni contourner ;
   - si tout est présent, le dire et attendre son feu vert.

### Phase 2 — Développement (seulement après validation)
5. Coder uniquement avec les tokens (aucune valeur en dur). Les variantes Figma deviennent des props ; les icônes interchangeables passent par `components/ui/Icon`.
6. Vérifier point par point le code face aux données Figma, puis lint et build.
7. Fournir le tableau « propriété Figma → token utilisé ».

Interdit : ajouter un état ou une variante absent de Figma sans demander.

### Décisions
Faire uniquement ce que l'utilisateur demande. Ne jamais déduire ni choisir soi-même une valeur ou un comportement de design (mise en page tablette, durée, courbe, taille…) : conseiller, proposer des options, et laisser l'utilisateur décider.
