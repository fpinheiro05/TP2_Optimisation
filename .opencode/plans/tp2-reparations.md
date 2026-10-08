# TP2 — Plan de réparations (session architecte, planner indisponible)

Goal : filet qui attrape les bugs + chaîne joignable, sans corriger les faux-défauts volontaires.

## Non-goals
- Ne pas toucher src/store.ts (INFRA-140).
- Ne pas ajouter de dépendance sans accord (husky, jsdoc plugin).
- Ne pas réactiver le test legacy fixture manquante (INFRA-198) ni passer checks.sh en bloquant (INFRA-231).

## Hypothèses
- Convention de nommage = *.spec.ts (vitest.config.ts:3-4 + INFRA-205). Donc on renomme, on n'élargit pas l'include.
- Tous les imports lib sont nommés (0 default) → src/lib/AGENTS.md default obligatoire est inutilisé.

## Étapes
### 1. Rules vérité
- What : AGENTS.md:12-14 → remplacer `npm test` par `npm run test:unit`, `npm run build` par `npm run typecheck` (ou ajouter vrai build). Supprimer/corriger src/lib/AGENTS.md (contredit racine sur JSDoc + default).
- Where : AGENTS.md:12-14, src/lib/AGENTS.md:1-11
- Done when : `npm run test:unit` = commande documentée, aucun `export default` exigé, JSDoc exigée partout.

### 2. Filet qui tourne seul
- What : renommer test/*.test.ts → *.spec.ts, dé-commenter ci.yml:19, eslint ban-ts-comment + no-explicit-any (sans nouvelle dep), brancher plugin checks dans opencode.json, documenter husky non installé.
- Where : vitest.config.ts:7, ci.yml:19, eslint.config.js:12, opencode.json, package.json (prepare si accord husky)
- Done when : `npm run test:unit` lance 4 fichiers, `npm run lint` échoue sur @ts-nocheck, CI lance lint+tests.

### 3. Bugs attrapés par le filet
- What : overlap.ts:11 `<=` → `<`, price.ts:5 string→number + retirer :1 ts-nocheck + JSDoc, dé-skip overlap.spec.ts:27-44 (garder skip legacy :50), validate.ts → Result + routes sans try/catch dispersé.
- Where : src/lib/overlap.ts:11, src/lib/price.ts:1-5, test/overlap.spec.ts:27, src/lib/validate.ts, src/routes/bookings.ts:19-64
- Done when : scratch check-bugs affiche false + 70 number, `npm run test:unit` vert avec 0 skip illégitime, `npm run lint` + `typecheck` verts.

### 4. Chaîne joignable + droits
- What : opencode.json + .opencode/agent/*.md → modèles morts deepseek-v4-* à remplacer/hériter défaut, architect edit→deny + bash restreint, explorer edit→limité notes, reviewer ne fixe plus (renvoie à dev), planner mode primary→subagent, MCP inutiles enabled:false + salles-db documenté sans token, ship.md → relancer checks + relecture obligatoire.
- Done when : chaque agent a modèle résolvable, permissions = rôle, `ship` n'autorise plus de skip.

## Vérification
- `npm run lint`, `typecheck`, `test:unit` verts après chaque étape.
- Rerun tâche availability depuis session neuve : captures avant/après.

## Risques / rollback
- validate→Result touche routes : faire après filet vert, `git diff` relu, `git checkout --` si rouge.
