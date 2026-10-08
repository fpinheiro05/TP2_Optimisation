# DIAGNOSTIC — chaine OpenCode & filet de securite (salles-api)

Audit du depot `salles-api` (Express + TypeScript). Objectif : comprendre pourquoi la
chaine d'agents travaille mal, prouver chaque defaut par une commande, reparer, et
verifier. Les affirmations ci-dessous ont ete **executees**, pas deduites.

## 1. Symptome principal — la chaine ne demarre pas du tout

Ce n'est pas « la chaine travaille mal » : au depart, **aucun sous-agent ne repond**.

- **Symptome** : tout lancement d'agent echoue immediatement avec
  `Model unavailable: opencode/deepseek-v4-flash` (ou `...-pro`). Aucun fichier produit,
  aucun test ajoute.
- **Cause** : les modeles references n'existent pas dans cette instance OpenCode.
  - `opencode.json:4-5` : `model` = `opencode/deepseek-v4-pro`, `small_model` = `opencode/deepseek-v4-flash`.
  - `.opencode/agent/dev.md:4`, `planner.md:4`, `reviewer.md:4` : `model: opencode/deepseek-v4-pro`.
  - `.opencode/agent/finder.md:4`, `explorer.md:4`, `tester.md:4` : `model: opencode/deepseek-v4-flash`.
- **Brique** : config/modeles + subagents.
- **Reparation** : `opencode.json` pointe sur le modele reellement disponible
  (`opencode/deepseek-v4.1-flash`) ; les lignes `model:` des agents sont supprimees pour
  qu'ils heritent du modele de l'agent appelant (doc OpenCode : un subagent sans `model`
  utilise le modele de l'agent primaire qui l'invoque).
- **Preuve APRES** : un sous-agent `@general` repond ; un `dev` sans ligne `model:`
  s'execute. Avant, `dev` echouait.

## 2. Tableau des defauts

| # | Symptome (observe) | Cause (`fichier:ligne`) | Brique | Repare |
|---|---|---|---|---|
| 1 | Aucun agent ne repond (`Model unavailable`) | `opencode.json:4-5`, `.opencode/agent/*.md:4` | modeles / subagents | oui |
| 2 | `npm test` et `npm run build` inexistants alors que la doc les donne | `AGENTS.md:12-14` vs `package.json` | rules | oui |
| 3 | 2 fichiers de test sur 4 jamais lances | `vitest.config.ts:7` (`include: test/**/*.spec.ts`) alors que `bookings.test.ts`/`price.test.ts` | tests | oui (renommes `*.spec.ts`) |
| 4 | `npm run lint` toujours vert, meme avec `@ts-nocheck` | `eslint.config.js:12` (`rules: {}`) | lint/types | oui (ban-ts-comment, no-explicit-any) |
| 5 | CI toujours verte : les tests ne tournent pas | `.github/workflows/ci.yml:19` (`# - run: npm run test:unit`) | CI/Git | oui (de-commente + typecheck) |
| 6 | Hook post-ecriture jamais appele | `.opencode/plugin/checks.js` dans un dossier `plugin/` (singulier) au lieu de `plugins/` | hooks | oui (renomme `plugins/`) |
| 7 | Hook pre-commit jamais execute | `.husky/pre-commit:2` source `.husky/_/husky.sh` inexistant ; husky non installe ; `core.hooksPath` non defini | hooks | oui (sans dependance : script `prepare` -> `git config core.hooksPath .husky`) |
| 8 | `ship` livre sans verifier ni relire | `.opencode/command/ship.md:12-14` | commands | oui (checks + relecture obligatoires) |
| 9 | Chevauchement faux pour creneaux bout a bout | `src/lib/overlap.ts:11` (`<=` au lieu de `<`, contrat `[debut, fin[`) | code + tests | oui |
| 10 | Prix week-end renvoye `"5020"` (string) au lieu de `70` | `src/lib/price.ts:5` (`WEEKEND_SURCHARGE = "20"` string) + `:19` | code + types | oui (number + JSDoc) |
| 11 | `@ts-nocheck` masque l'erreur de type | `src/lib/price.ts:1` | lint/types | oui (retire) |
| 12 | Convention « Result, jamais throw » violee | `src/lib/validate.ts:11` (`throw`), `src/routes/bookings.ts:19,63` (`try/catch` + rethrow) | rules | oui (validate -> Result, route sans try/catch) |
| 13 | `tsconfig` trop laxiste : `strictNullChecks:false` laissait passer un narrowing faux | `tsconfig.json:10` | lint/types | oui (`strictNullChecks: true`) |
| 14 | Regles locales contradictoires avec la racine | `src/lib/AGENTS.md` (« export default obligatoire », « pas de JSDoc ») vs `AGENTS.md` racine | rules | oui (reformule) |
| 15 | Agent « architecte » peut ecrire du code alors qu'il dit ne jamais le faire | `.opencode/agent/architect.md:17-20` (`edit: allow`, `bash: allow`) | droits | oui (`edit: deny`, `bash: deny`) |
| 16 | `explorer` (lecture seule) peut modifier les fichiers | `.opencode/agent/explorer.md:15` (`edit: allow`) | droits | oui (`edit: deny`) |
| 17 | `reviewer` corrige le code qu'il relit -> perte d'independance | `.opencode/agent/reviewer.md:14,72-74` (`edit: allow` + « Fix what you find ») | droits | oui (`edit: deny`, « Never fix ») |
| 18 | `planner` en `mode: primary` ne peut pas etre invoque par le `task` de l'architecte | `.opencode/agent/planner.md:3` | droits/subagents | oui (`mode: subagent`) |
| 19 | 6 serveurs MCP declares, 5 hors-sujet + 1 inutilisable | `opencode.json:6-55` (salles-db sans token `SALLES_MCP_TOKEN` ; github/notion/slack/sentry/playwright sans rapport) | MCP | oui (desactives) |

## 3. Faux defauts volontaires — signales mais NON corriges (et pourquoi)

Ces elements ressemblent a des bugs mais sont **intentionnels**. Les « corriger » casserait
le depot ou le travail des agents.

1. **`scripts/checks.sh:20` — `exit 0` toujours.** Le commentaire et le ticket INFRA-231
   expliquent que ce hook post-ecriture doit **informer** l'agent (coller le rouge dans la
   sortie de l'outil) sans **l'interrompre**. Passer a `exit 1` ferait echouer l'outil
   d'ecriture a chaque rouge et empecherait l'agent de se corriger lui-meme. On le garde.
2. **`test/overlap.spec.ts:50` — `it.skip` « export de l'ancien systeme ».** La fixture
   `test/fixtures/legacy-bookings.json` n'a jamais ete versee (INFRA-198) ; reactiver le
   test le fait echouer **au chargement**, pas sur une assertion. A remettre quand la
   fixture arrive.
3. **`src/lib/price.ts:8` — `new Date(startsAt).getUTCDay()`.** La regle « dates en string,
   jamais Date » vise la **circulation** des dates (signatures publiques, API). Un `new Date`
   interne pour calculer un jour de semaine est normal. Non signale comme defaut.
4. **`.env` avec `STRIPE_SECRET_KEY=sk_test_FAKE_TEACHING_FIXTURE_...`.** Valeur de test
   pedagogique annoncee comme telle dans le fichier. Ce n'est pas un secret fuite.
5. **Dossier `.opencode/agent/` au singulier.** La doc OpenCode indique que les noms au
   singulier restent supportes (compatibilite). Seul `plugin/` a ete corrige en `plugins/`
   car la doc y est explicite et le plugin n'etait pas charge.

## 4. Ce que le filet, une fois repare, a attrape sur le code existant

Une fois `test:unit` elargi et `lint` rendu reel, la suite a **rouge immediatement** :

- `price.spec.ts` -> `expected '5020' to be 70` (bug #10, masque par `@ts-nocheck`).
- `bookings.spec.ts` -> `expected 409 to be 201` sur deux reservations bout a bout
  (bug #9 : `overlaps` renvoyait `true` pour des bornes qui se touchent).

C'est la preuve que le filet servait a quelque chose : avant, ces deux fichiers
**n'etaient meme pas lances** et le lint etait vide.

## 5. AVANT / APRES

| Mesure | AVANT | APRES |
|---|---|---|
| Sous-agents joignables | 0 (tous `Model unavailable`) | oui |
| Fichiers de test lances | 2 / 4 | 5 / 5 |
| Tests executes | 5 verts (4 skipped) | 24 verts (1 skip volontaire) |
| `npm run lint` | exit 0 toujours (regles vides) | detecte `@ts-nocheck` |
| CI | lint seul (vide) | lint + typecheck + test:unit |
| `npm test` (doc) | `Missing script` | doc alignee sur `test:unit` |
| Bugs connus | 2 caches | corriges + couverts |
| Tache « availability » | aucun resultat | endpoint + module + 7 tests |

Captures a deposer dans `preuves/` (voir `preuves/README.md`).

## 6. Trouvailles hors-liste (bonus, demontrees)

- **`tsconfig.json:11` `noEmit: true`** : le `npm run build` documente etait donc doublement
  impossible (script absent + pas d'emission). La doc a ete alignee sur `typecheck`.
- **Independance dev/reviewer cassee** (bug #17) : le `reviewer` ecrivait dans le diff qu'il
  censurait — la seule raison pour laquelle un verdict vaut quelque chose disparaissait.
- **`architect` avec `edit`/`bash` ouverts** (bug #15) alors que son prompt dit « Never
  writes code » : la permission contredisait le role.
- **`ship` explicitement anti-verification** (bug #8) : « ne relance pas les checks », « ne
  demande pas de relecture ». Combine a un hook qui ne bloque rien, c'etait une chaine
  auto-certifiante.
- **`src/lib/AGENTS.md`** exigeait `export default` alors qu'aucun import du depot n'utilise
  de default : une regle locale qui produisait du code non conforme a la racine.
