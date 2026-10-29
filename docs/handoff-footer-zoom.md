# Handoff — Ícones 3D girando com dithering no CTA do rodapé

## Contexto

Projeto Astro 5 (`dev/v1`, TypeScript, CSS global, sem framework de UI). O CTA do rodapé tem um painel claro com uma box de ícones interna que exibe um "zoom tunnel" infinito. A spec e a técnica de 3D+dithering já existem no repo.

**Arquivos relevantes:**

- `dev/v1/src/components/FooterCtaZoom.astro` — implementação atual (é aqui que está o problema; precisa ser refeito).
- `dev/v1/src/components/CategoryGlyph.astro` — **referência obrigatória**: faz extrusão voxel 3D + projeção em perspectiva + iluminação + ordered dithering **re-projetando a cada frame** (é exatamente o comportamento desejado, mas com câmera fixa e sem zoom).
- `dev/v1/src/styles/remaining-fidelity.css` — `.footer-cta` (radius 16px, padding 20px) e `.footer-cta-slot` (bg `#C4D1C0`, radius 16px). Já está correto, não mexer.
- `dev/v1/src/assets/icons/category-web.svg`, `category-brand.svg`, `category-art.svg`, `category-music.svg`, `category-experiment.svg` — 5 glyphs pixel-art, `viewBox 0 0 24 24`, um único `<path d="...">`.
- `dev/v1/DESIGN.md` — seção "Footer CTA zoom tunnel".

## O problema (o que está errado hoje)

O `FooterCtaZoom.astro` atual pré-computa, **uma única vez**, cada ícone como uma escultura 3D estática em um canvas offscreen 256×256 (pose fixa de yaw/pitch), e no loop de zoom apenas faz `ctx.drawImage(sculpture, ...)` com escala crescente. Resultado: a imagem é **estática** — não gira, não muda de perspectiva, não tem paralaxe ao se aproximar. Parece um PNG sendo ampliado, não um objeto 3D mergulhando na tela. Isso é o que deve ser corrigido.

## Objetivo

Cada ícone deve ser um **modelo 3D real** (extrusão voxel) que **gira e se move** enquanto a câmera avança em direção a ele, com **ordered dithering aplicado a cada frame**, até o objeto ocupar toda a view; então o campo faz flood para a cor do ícone (chapada) e o próximo ícone reaparece na cor oposta. Loop infinito, sem emenda, sem flash, sem salto de escala.

## Abordagem técnica obrigatória

**Re-projetar a escultura 3D a cada frame** (como `CategoryGlyph.astro` faz), em vez de escalar uma imagem pré-renderizada. Mantenha um buffer interno de resolução fixa (256×256 é suficiente) e, por frame:

1. **Extrusão voxel**: a partir do `d` de cada `category-*.svg`, rasterize uma máscara de ocupação 24×24 (`pathToMask`). Cada célula ocupada vira um voxel com profundidade `DEPTH` (use `DEPTH = 9`, `GRID = 24`, como no `CategoryGlyph`).
2. **Rotação por frame**: `yaw` e `pitch` variam com o progresso da fase, ex. `yaw = BASE_YAW + spin * p` (girar ~120°–180° ao longo da fase) e `pitch = BASE_PITCH + wobble * sin(...)`. A luz é fixa; o sombreamento (`faceShade`) é **recalculado por frame** porque a orientação muda.
3. **Zoom por perspectiva (não por scale de imagem)**: no `project(x, y, z)`, o fator de perspectiva é `CAMERA / (CAMERA - z2)`. Faça `CAMERA` **diminuir** ao longo da fase (ex. de `90` até ~`6`–`8`), de modo que as faces frontais cresçam até preencher a view — isso gera a sensação de "mergulhar através do objeto" com paralaxe real. Não resolva o zoom com `drawImage` escalando uma imagem fixa.
4. **Dithering por frame**: após desenhar as faces (frente + laterais, sombreadas em escala de cinza), aplique o mesmo ordered dithering (Bayer 8×8 + DITHER4) do `CategoryGlyph`, quantizando o cinza para uma rampa de 5 tons da cor da fase: oliva (centrado em `#647362`) ou claro (centrado em `#EBF3E9`). Aplique o dither no buffer interno (256×256) e então `drawImage` desse buffer escalado para o canvas do slot — a re-projeção (rotação+zoom) é por frame; só a resolução interna é fixa.
5. **Flood chapado na emenda**: nos últimos ~25% da fase, faça o **campo** (fundo) fazer lerp da cor atual para a cor do ícone e **dissolva o ícone** (alpha→0) na mesma janela, de modo que no fim da fase o slot fique 100% na cor chapada (oliva ou claro). No pico, a re-projeção 3D já está "dentro" do objeto; o flood cobre os vazios entre voxels e torna a emenda invisível. O reset de fase acontece nesse instante (sem pausa, sem flash).

**O que já está correto e deve ser preservado (não regredir):**

- Máquina de estados `idle` / `zoom` / `settle`, um único `requestAnimationFrame` por vez.
- Hover (`pointerenter`/`pointerleave` no `.footer-cta-slot`, só em `(hover: hover) and (pointer: fine)`); settle de ~420ms na saída; autoplay touch (só com o slot visível via `IntersectionObserver`, threshold 0.4, teto 30fps); `prefers-reduced-motion: reduce` → frame de repouso estático, sem rAF; `document.hidden` → pausa.
- Cores: campo de repouso `#C4D1C0`; ícones alternando `#647362` (oliva) e `#EBF3E9` (claro). Sequência: fase 0 = campo `#C4D1C0` + ícone oliva `web`; fases seguintes alternam oliva ↔ claro, ícone = cor oposta ao campo, ícone índice = `k % 5` (web, brand, art, music, experiment, repetindo).
- Ease-in / ease-out (cúbico) no progresso da fase.
- Tunables: `T = 2.2s` desktop / `2.6s` touch; escala de reinício `0.12×` do repouso; fade-in do ícone `120ms`; settle `420ms`; DPR cap 2; `restPx` lido de `--footer-zoom-glyph` (140/96/64 por breakpoint).
- Ciclo de vida: `onPageLoad` de `src/scripts/page-lifecycle.ts`, listeners com `{ signal: scope.signal }`, cleanup completo (`cancelAnimationFrame`, `ResizeObserver.disconnect`, `IntersectionObserver.disconnect`), inicialização idempotente (footer persiste entre navegações — um único renderer por canvas).
- Overlay de pontos (`radial-gradient` escuro) acima do canvas, `aria-hidden`/`pointer-events: none`, sem links/foco.

**Restrições:** não usar vídeo/GIF/Lottie; não importar libs novas (GSAP etc.); não usar `getImageData` sobre o canvas cheio do slot por frame (o dither fica no buffer interno 256×256); não alterar layout, cores do painel, copy, i18n, nem a ordem das seções; comentários em inglês (padrão do repo); não commitar.

## Critérios de aceite

- O ícone **gira visivelmente** e a câmera **avança com paralaxe** (faces laterais aparecem/somem conforme a rotação), não sendo um PNG estático ampliado.
- Dithering Bayer visível e consistente a cada frame, em oliva ou claro conforme a fase.
- No pico de cada fase, o slot está 100% na cor chapada (amostre cantos e centro com color picker: `#647362` ou `#EBF3E9` exatos); a emenda entre fases é imperceptível frame a frame.
- Loop infinito sem flash, sem salto de escala, sem congelamento em 60s; hover/unhover rápidos e repetidos não quebram o estado nem criam loops concorrentes.
- `prefers-reduced-motion: reduce` estático; mobile (390px e 768px) com autoplay só visível, pausa fora da viewport/aba oculta, sem overflow horizontal.
- Navegação client-side (home → contact → home): um único canvas, um único rAF, sem erros no console, sem vazamento de memória.
- `npm run build` verde; nenhuma dependência nova; nenhum arquivo fora do escopo alterado.
- `DESIGN.md` atualizado (trocar a menção a "extruded and ordered-dithered once" por "re-projected and ordered-dithered every frame, rotating while the camera dives").

## Como validar

```bash
cd dev/v1 && npm run build && npm run dev  # http://localhost:4321
```

Abra a home, role até o rodapé, passe o mouse na box e grave 20–30s em 60fps; revise frame a frame os pontos de emenda e a rotação. Teste 1440/1024/768/390 em light/auto/dark, `prefers-reduced-motion`, emulação touch, e a navegação home→contact→home.
