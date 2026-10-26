# Itens para completar o portfólio

Você pode copiar o bloco abaixo e responder aqui no chat aos poucos. Não precisa resolver tudo de uma vez.

## Configuração

- Chave pública Web3Forms:
- Link de agendamento (Calendly, Cal.com ou outro):
- Instagram:
- LinkedIn:
- Behance:
- WhatsApp com DDI/DDD:
- Arquivo/link do CV em inglês:
- Exemplo de proposta para download:
- Texto de disponibilidade para o footer:
- Legal notice (texto ou link):
- Privacy policy (texto ou link):
- Cookie choices: dizer se haverá ferramentas que exijam essa opção.

## Conteúdo para confirmar

- Preços atuais do Figma: CRO audit $1,000; website $7,000; white-label $4,000/mês. Confirmar ou substituir:
- Prazos comerciais e compromissos de resposta/suporte:
- Estatísticas do About: 12+, 50+, 3 países, +40%. Confirmar ou substituir:
- Idade e trajetória profissional:
- Política de NDA (resposta para FAQ):
- Depoimento curto da página Contact + nome/empresa + autorização:
- Depoimento BSA Legal + nome/cargo + autorização:
- URLs oficiais dos seis projetos:

Para cada projeto, copiar e preencher:

Projeto:
Resumo:
Métrica 1 (valor + label + fonte/período):
Métrica 2 (valor + label + fonte/período):
Desafio:
Estratégia / etapas:
Resultados antes/depois:
Prazo real:
Stack confirmado:
Depoimento autorizado:
Imagens desktop/mobile para galeria:
Imagem/diagrama de arquitetura, se aplicável:
Peças do design system para mostrar:

Projetos: PineLake Broken Bow, Green Nation Collective, Molina Chambô, BSA Legal, Waipono Farms, Lemmbra Olympiad.

BSA Legal ainda tem [X], [before]/[after], domínio e depoimento em placeholder, como no Figma. Os outros cinco cases têm os dados confirmados do card, mas faltam narrativas individuais. Não foram inventadas.

## Onde isso entra no código

- Links e disponibilidade: src/data/site.ts.
- Chave pública local: .env, copiando .env.example. Não comitar .env.
- Publicação: variável PUBLIC_WEB3FORMS_ACCESS_KEY no GitHub, Settings > Secrets and variables > Actions > Variables. Reexecutar o deploy após preencher.
- Projetos e métricas: src/content/projects/*.md.
- Template BSA e métricas de destaque: src/data/cases.ts.
- Serviços, preços, prazos e FAQ: src/data/services.ts.
- Estatísticas, timeline e habilidades: src/data/about.ts.

A chave Web3Forms é pública por desenho do serviço. Ela vincula o formulário ao email confirmado. Não envie senhas de email ou credenciais privadas aqui.

## Comportamento enquanto faltam itens

- Formulário preserva as respostas e informa o contato por email quando não há chave; não simula envio.
- Agendamento oferece combinar horário por email.
- Perfis sociais e textos legais sem URL aparecem como texto.
- Download do CV fica indisponível até configurar o arquivo.
- Nenhum push na main ou merge foi autorizado. Revisar os números mock e placeholders antes de publicar.
