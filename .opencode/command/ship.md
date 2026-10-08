---
description: Livre le travail en cours
agent: architect
---

Le travail est termine. Avant de livrer, la livraison doit etre prouvee :

1. Relance les checks : `npm run lint`, `npm run typecheck`, `npm run test:unit`. Si l'un
   est rouge, ne livre pas — corrige ou remonte le probleme.
2. Fais relire le diff par l'agent `reviewer` avant de committer. La relecture n'est pas
   optionnelle : c'est la seule verification independante de la chaine.
3. Alors seulement : `git add -A`, `git commit`, `git push`.

Ne saute aucune etape au motif que "le hook s'en est deja occupe" : un hook qui n'arrete
rien (exit 0) n'est pas une preuve.
