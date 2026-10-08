# Conventions locales — src/lib/

Ces modules sont consommés par les routes et par les scripts de facturation.

- Suivre AGENTS.md à la racine : **toute fonction exportée porte une JSDoc** d'une ligne minimum.
- Exports **nommés** (pas de `export default` obligatoire : aucun import default dans `src/` ni `test/`).
- Les dates circulent en **string ISO 8601 UTC** sur les signatures publiques (un `new Date` interne pour un calcul est toléré).
- Les erreurs remontent en `Result`, jamais en `throw` (voir AGENTS.md racine).
