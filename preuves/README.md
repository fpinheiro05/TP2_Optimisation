# Preuves — captures AVANT / APRÈS

Le sujet exige de VRAIES captures d'écran (pas de copier-coller) montrant l'état AVANT
et APRÈS la réparation. Ce dossier les accueille.

## À capturer (écran entier ou fenêtre OpenCode/terminal)

### AVANT (état d'origine du dépôt)
1. `AVANT-1-modele-indisponible.png` — l'erreur `Model unavailable: opencode/deepseek-v4-flash`
   (ou `-pro`) au lancement d'un sous-agent.
2. `AVANT-2-npm-test.png` — `npm test` → `Missing script: "test"`.
3. `AVANT-3-tests-partiels.png` — `npm run test:unit` ne lance que 2 fichiers / 5 tests verts.
4. `AVANT-4-lint-aveugle.png` — `npm run lint` exit 0 malgré `@ts-nocheck` dans src/lib/price.ts.
5. `AVANT-5-ci-commentee.png` — `.github/workflows/ci.yml` ligne `# - run: npm run test:unit`.

### APRÈS (dépôt réparé)
6. `APRES-1-chaine-repond.png` — un sous-agent (ex. `@general`) répond correctement.
7. `APRES-2-tests-complets.png` — `npm run test:unit` lance 5 fichiers / 24 tests verts (1 skip volontaire).
8. `APRES-3-lint-reel.png` — `npm run lint` échoue si on remet `@ts-nocheck` (ou passe avec le code corrigé).
9. `APRES-4-ci-verte.png` — la CI lance lint + typecheck + test:unit.
10. `APRES-5-endpoint.png` — `GET /rooms/labo/availability?date=...` renvoie busy/free.

## Convention de nommage
`<AVANT|APRES>-<n>-<sujet>.png`, déposés à la racine de ce dossier.
