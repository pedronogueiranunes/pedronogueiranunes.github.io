# Validação do redesign

Build final de produção: 14 rotas estáticas. `npm run build` aprovado ao fim de cada etapa.

## Checagens

- Astro check: 34 arquivos, 0 erros, 0 avisos, 0 sugestões.
- Interações: validação, voltar sem perder dados, seleção múltipla, falta de chave, erro/sucesso simulados, filtros e carrossel aprovados. Nenhum email real enviado.
- Responsivo: seis páginas × 1440, 1024, 768 e 390px; 24 combinações sem overflow da página ou sobreposição do cabeçalho.
- Links internos: 14 rotas verificadas, nenhum caminho ou fragmento ausente.
- Axe WCAG 2 A/AA + 2.1 AA: nenhuma violação nas sete páginas representativas em tema claro e escuro. Isso não substitui avaliação humana de acessibilidade.
- Splat: ativação mobile posterior à interação, modelo real carregado, teclado, movimento reduzido e fallback testados.
- Detector visual: nenhum achado. Proveniência: 155 rasters, 0 sem origem registrada.

## Lighthouse mobile

Medição local em build de produção, Lighthouse 13.5.0, emulação mobile padrão. Resultado varia com ambiente, rede e dispositivo. O 3D mobile é ativado por interação, portanto não faz parte da carga inicial medida.

| Rota | Performance | Acessibilidade |
|---|---:|---:|
| `/` | 99 | 100 |
| `/services` | 100 | 100 |
| `/projects` | 100 | 100 |
| `/work/bsa-legal` | 99 | 100 |
| `/about` | 97 | 100 |
| `/contact` | 100 | 100 |
| `/thoughts/design-system-without-overdoing-it` | 99 | 100 |

## Revisão visual

Os nove achados materiais levantados pela revisão independente foram corrigidos e conferidos. O parecer fecha esses pontos; não equivale a certificação de igualdade pixel a pixel completa. Ver [revisão](visual-review.md) e [capturas](screenshots.md).

## Adaptações deliberadas

- Token de marca `#FF5A1F` preservado. Textos pequenos e fundos de ações usam tons laranja de maior contraste para AA.
- Lettering do footer usa Pixelify conforme briefing e referência mobile.
- 3D mobile sob interação; fallback permanece disponível em movimento reduzido e falhas.
- Elementos ocultos/OLD continuam fora da Home. Fonte antiga arquivada em `legacy/home-before-redesign.astro.txt`.

## Pendências antes de publicar

Preencher [a lista](itens-para-preencher.md): chave pública Web3Forms, URLs de agendamento/redes/CV/proposta/projetos, dados reais, depoimentos, galerias e narrativas dos cinco cases além do BSA. O formulário trata a chave ausente como indisponibilidade; não simula envio.

`npm audit fix` reduziu 13 avisos para 5 (1 baixo, 3 altos e 1 crítico). A remediação restante indicada pela auditoria exige migrar a versão principal do Astro; a stack Astro 5 foi preservada. Estes avisos devem ser avaliados antes do merge, em especial se o modo de deploy deixar de ser estático.

O workflow de PR compila o site. O deploy continua restrito à main ou ao acionamento manual existente. Nenhum merge é realizado por este trabalho.

## Como repetir as verificações básicas

1. Rodar `npm ci`, `npm run build` e `npm run preview`.
2. Abrir Home, Services, Projects, BSA, About e Contact em 1440/1024/768/390px.
3. Abrir preferências pelo teclado, trocar Light/Dark/Auto, recarregar e fechar com Esc; abrir/fechar menu mobile.
4. Em Projects, alternar categorias, colunas/lista e os filtros de ano/país; usar reset.
5. No formulário, tentar continuar vazio; preencher nome/email; voltar preservando dados; testar seleção múltipla e tentar enviar sem chave. Deve mostrar a alternativa de email.
6. Com movimento normal, ativar o retrato 3D e girar com mouse/teclas. Com movimento reduzido, deve continuar estático.
7. Para o verificador de tipos sem instalar dependências no projeto: `npm exec --yes --package=@astrojs/check@0.9.12 --package=typescript@5.9.3 -- astro-check --root .`.
8. Reexecutar Lighthouse mobile sobre a prévia de produção. Os relatórios JSON deste diretório registram o ambiente original.
