# Guide de captures — commandes exactes

Deux etats coexistent dans git :
- **`main`** = depot D'ORIGINE (etat AVANT)
- **`tp2-reparations`** = depot REPARE (etat APRES)

Bascule a tout moment :
```powershell
cd C:\Users\flori\OneDrive\Documents\Travaux\tp2-Florian-PINHEIRO
git checkout main            # -> etat AVANT
git checkout tp2-reparations # -> etat APRES
```

---

## AVANT (branche `main`)

### AVANT-1-modele-indisponible.png
```powershell
git checkout main
opencode
```
IMPORTANT : n'utilise PAS `@general` (agent integre sans ligne `model:`, il herite du
modele de la session et repond meme sur `main`). Il faut invoquer un agent DU DEPOT, qui
porte la ligne `model:` morte. Dans la TUI, tape par exemple : `@dev fais un test`
(ou `@finder`, `@explorer`, `@tester`, `@reviewer`, `@planner`).
L'erreur attendue : `Model unavailable: opencode/deepseek-v4-pro` (ou `-flash`).
Capture l'ecran au moment de l'erreur, puis quitte.

Note : apres un `git checkout`, relance `opencode` — les agents sont charges au demarrage,
une bascule de branche en cours de session ne recharge pas les fichiers.

### AVANT-2-npm-test.png
```powershell
npm test
```
Attendu : `npm error Missing script: "test"`. Capture.

### AVANT-3-tests-partiels.png
```powershell
npm run test:unit
```
Attendu : seulement `test/overlap.spec.ts` et `test/store.spec.ts` lances
(`2 passed`, `5 passed | 4 skipped`). Capture le recapitulatif.

### AVANT-4-lint-aveugle.png
```powershell
npm run lint
```
Attendu : aucune sortie d'erreur, exit 0, ALORS QUE `src/lib/price.ts` commence par
`// @ts-nocheck`. Capture la commande + ouvre `src/lib/price.ts` (ligne 1) dans l'editeur.

### AVANT-5-ci-commentee.png
Ouvre `.github/workflows/ci.yml` et capture la ligne 19 :
`# - run: npm run test:unit   # TODO remettre, ca bloquait les merges`

---

## APRES (branche `tp2-reparations`)

### APRES-1-chaine-repond.png
```powershell
git checkout tp2-reparations
opencode
```
Dans la TUI : `@general dis bonjour`. Le sous-agent repond (plus d'erreur de modele). Capture.

### APRES-2-tests-complets.png
```powershell
npm run test:unit
```
Attendu : `5 passed` fichiers, `24 passed | 1 skipped`. Capture le recapitulatif.

### APRES-3-lint-reel.png
Prouve que le lint attrape desormais l'echappatoire :
```powershell
"// @ts-nocheck`nexport const x = 1;" | Out-File -Encoding utf8 src/lib/_tmp-lint.ts
npm run lint
Remove-Item src/lib/_tmp-lint.ts
```
Attendu : une erreur `Do not use "@ts-nocheck"...`. Capture AVANT de supprimer le fichier.

### APRES-4-ci-verte.png
Ouvre `.github/workflows/ci.yml` et capture : `npm run lint`, `npm run typecheck`,
`npm run test:unit` (tous actifs, non commentes).

### APRES-5-endpoint.png
```powershell
npm start
# dans un autre terminal :
curl.exe -s "http://localhost:3000/rooms/labo/availability?date=2026-11-03"
curl.exe -s "http://localhost:3000/rooms/nexistepas/availability?date=2026-11-03"
```
Attendu : 200 avec `busy`/`free`, puis 404. Capture les deux. Puis `Ctrl+C` pour arreter.

---

## Rappel
- Vraies captures d'ecran (Win+Shift+S), pas de copier-coller de texte.
- Nommage : `<AVANT|APRES>-<n>-<sujet>.png`, deposees dans `preuves/`.
- Revenir sur `tp2-reparations` a la fin : `git checkout tp2-reparations`.
