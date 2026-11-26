# 🍽️ Cardápio Refeitório IFPI – Campus Teresina Central

Aplicação web responsiva (*mobile-first*) desenvolvida para facilitar o acesso dos estudantes e servidores ao cardápio semanal do **Refeitório Estudantil do Instituto Federal do Piauí (IFPI) – Campus Teresina Central**, contando com painel administrativo protegido para gestão diária das refeições.

---

## ✨ Funcionalidades

### 🌐 Área Pública (Estudantes e Servidores)
* **Status em Tempo Real:** Banner dinâmico sincronizado com o fuso horário de Teresina (`America/Fortaleza`) indicando se o refeitório está **Aberto Agora** ou **Fechado**, além do horário da próxima refeição.
* **Navegação Semanal (Segunda a Sexta):** Seleção rápida entre os dias úteis da semana vigente com destaque automático para o dia atual.
* **Exibição de Almoço e Jantar:** Listagem clara e visual das porções servidas em cada turno (`11h30 às 13h30` e `17h00 às 19h00`).
* **Aviso de Dias Não Letivos:** Exibição automática de justificativa em datas de feriados, recessos ou paralisações.
* **Compartilhamento Rápido:** Botão integrado para enviar o cardápio formatado diretamente via **WhatsApp** ou compartilhar o link nativamente.
* **SEO Otimizado:** Renderização no servidor (SSR) e dados estruturados (`Schema.org / FoodEstablishment`).

### 🔐 Painel Administrativo (`/admin`)
* **Autenticação Segura:** Login de administradores via **Supabase Auth** com proteção de rotas no servidor (`src/proxy.js`).
* **Gestão de Refeições:** Cadastro, edição e exclusão de almoços e jantares da semana vigente.
* **Catálogo de Porções:** Gerenciamento reutilizável de pratos e acompanhamentos com seletor de ícones.
* **Controle de Dias Não Letivos:** Registro de datas sem funcionamento e seus respectivos motivos.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend & Framework:** [Next.js 16 (App Router)](https://nextjs.org/) & [React](https://react.dev/)
* **Estilização:** [Bootstrap 5.3](https://getbootstrap.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/)
* **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL com *Row Level Security* e Supabase Auth)
* **Deploy:** [Vercel](https://vercel.com/)

---

## 👨‍💻 Desenvolvimento
Desenvolvido por Primeira Classe - Desenvolvimento de Sistemas.
