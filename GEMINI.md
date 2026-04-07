# Modern Skeuo / Kinetic Command Center - SYNCO Design System

Este documento define os princípios e a infraestrutura técnica do novo design system do projeto SYNCO, baseado no blueprint visual identificado em `referencia/stitch`.

## 1. Visão Geral
O estilo **Modern Skeuo** evolui o neumorfismo para criar interfaces com profundidade tátil real, iluminação direcional e materiais digitais premium. O conceito de **Kinetic Command Center** foca em feedback visual dinâmico (glows e press effects) para elevar a experiência operacional.

## 2. Regra Fundamental: "No-Line"
A partir desta infraestrutura, fica **proibido o uso de bordas sólidas de 1px** (`border`, `border-t`, etc.) para delimitar elementos.
- A separação e hierarquia devem ser feitas através de **profundidade (shadows)** e **contraste de superfícies**.
- Use tokens de `boxShadow` para definir os limites dos componentes.

## 3. Tokens de Design (Tailwind)

### Cores Core
- `deep-void`: `#0F0F12` (Fundo principal profundo)
- `anthracite-surface`: `#1A1A1E` (Superfície base de cards e painéis)
- `kinetic-orange`: `#FF6B00` (Cor de ação primária e neon)

### Sombras Skeuomórficas
- `shadow-skeuo-flat`: Profundidade tátil padrão.
- `shadow-skeuo-pressed`: Efeito de botão pressionado (inset).
- `shadow-skeuo-elevated`: Alta profundidade para elementos flutuantes ou modais.

### Kinetic Glows
- `shadow-glow-orange`: Brilho neon suave para elementos ativos.
- `shadow-glow-orange-intense`: Brilho intenso para estados de hover ou destaque crítico.

## 4. Componentes Base
Sempre dê preferência aos componentes em `src/components/ui/` que já implementam estas regras:
- **`TactileCard`**: Container tátil com fundo anthracite.
- **`KineticButton`**: Botão de ação com feedback cinético e glow.
- **`GlassSidebar`**: Sidebar com glassmorphism e backdrop blur.

## 5. Escala de Spacing
A escala base do projeto é de **8px**.
- Utilize os multiplicadores padrão do Tailwind (ex: `p-2` = 8px, `p-4` = 16px, `m-6` = 24px).
- Evite valores "mágicos" fora da progressão de 8px.

## 6. Fonte de Verdade Visual
Para qualquer dúvida sobre comportamento visual ou novos padrões, consulte a pasta:
`referencia/stitch/`