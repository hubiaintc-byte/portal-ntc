# Seed assets — Portal Grupo NTC

Esta pasta guarda os arquivos binários (jpg/png) usados pelos scripts
de seed do CMS. Os arquivos **não são versionados** no git (ver
`.gitignore`); apenas este README e o `.gitkeep`.

Os arquivos vivem definitivamente no **Supabase Storage** (bucket
`ntc-portal-media`, prefixo `home/`) depois que `pnpm payload:seed:imagens-home`
roda. Esta pasta funciona como _fonte local efêmera_ para o seed: na
prática, ela existe no ambiente da máquina que rodou o seed pela
primeira vez (o Mac do Instituto NTC) e é regenerada por quem precise
re-rodar o seed.

## Reproduzir localmente

```bash
# 1. Copiar as fotos da pasta de design para esta pasta
cp /caminho/para/img/fotos/*.{jpg,png} apps/cms/src/seed/assets/

# 2. Rodar o seed de upload (uma vez por projeto Supabase)
pnpm payload:seed:imagens-home

# 3. Rodar o seed de conteúdo (idempotente; pode rodar múltiplas vezes)
pnpm payload:seed:home-v3
```

## Lista de imagens esperadas pelo seed da Home v3

Origem: `02_Prototipo_Home_GrupoNTC_v3_Premium.html`. Cada arquivo é
mapeado pelo `uploadImagensHome.ts` com `alt` apropriado.

- `hero-principal.jpg` — slide 1 (institucional).
- `area-saude.png` — slide 2 (evento PROSUS+).
- `area-gestao-publica.png` — slide 3 (evento AGIP).
- `area-educacao.jpg` — slide 4 (programa PEAR).
- `contratacao.jpg` — slide 5 (soluções) + bloco Contratação.
- `eventon-estudio.png` — slide 6 (EventOn) + bloco EventOn.
- `expert-01.png`, `expert-02.png`, `expert-03.png`, `expert-04.png` —
  fotos dos 4 especialistas exemplo.
- demais imagens (`autoridade-*`, `educacao-inclusiva`, etc.) são
  fotos auxiliares que entram em sessões futuras (programas, conteúdos).
