# 🚀 Projeto Fullstack: Django + React (Vite)

Este é um projeto fullstack com backend em **Django** e frontend em **React + Vite**, utilizando **Tailwind CSS**, **shadcn-ui** e **TypeScript**.

---

## 📁 Estrutura do Projeto

```
/
├── backend/
│   ├── manage.py
│   └── ...
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── ...
├── README.md
└── .gitignore
```

---

## 🧠 Tecnologias Utilizadas

### Backend

- Python
- Django
- Django REST Framework
- SQLite

### Frontend

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui

---

## 🔧 Como executar o projeto localmente

### 🔙 Backend (Django)

#### 📦 Pré-requisitos

- Python 3.10+
- Ambiente virtual configurado

#### ▶️ Rodando o servidor

```bash
# Acesse a pasta do backend
cd backend/

# Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Rode o servidor
python manage.py runserver
```

#### 🗃️ Migrações do banco de dados

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 👤 Criar superusuário

```bash
python manage.py createsuperuser
```

#### 🧪 Populando com dados de exemplo

```bash
# Aplicar migrações (caso não tenha feito)
python manage.py migrate

# Carregar dados de exemplo (arquivo dados.json)
python manage.py loaddata dados.json
```

> ⚠️ O arquivo `db.sqlite3` está no `.gitignore`. Use `loaddata` sempre que quiser restaurar os dados salvos.

---

### 🔜 Frontend (React + Vite)

#### 📦 Pré-requisitos

- Node.js (recomenda-se instalar com [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

#### ▶️ Rodando o frontend

```bash
# Acesse a pasta do frontend
cd frontend/

# Instale as dependências
npm install

# Rode o projeto com hot reload
npm run dev
```

#### ⚙️ Variáveis de ambiente (Frontend / SEO)

O frontend usa algumas variáveis (arquivo `.env` dentro de `frontend/`):

- `VITE_API_URL_BACK`: URL base da API (ex.: `http://127.0.0.1:8000/api/`)
- `VITE_SITE_URL`: URL pública do site (ex.: `https://seu-dominio.com`) — usada para canonical/OG e para gerar `sitemap.xml`
- `SITE_URL`: alternativa para builds (o script de SEO roda via `node` no `prebuild` e pode usar `SITE_URL` quando `VITE_SITE_URL` não estiver disponível no ambiente)
- `VITE_OG_IMAGE_URL` (opcional): imagem padrão para Open Graph
- `VITE_GSC_VERIFICATION` (opcional): verificação do Google Search Console

> Dica: se você vir `https://example.com` no `robots.txt`/`sitemap.xml`, é porque `VITE_SITE_URL`/`SITE_URL` não foram definidos no ambiente de build.

#### ⚙️ Variáveis de ambiente (Backend / Odds)

- `DATABASE_URL`: conexão com o banco (usada também no GitHub Actions).
- `ODDS_API_KEY`: chave da The Odds API (necessária para `python manage.py importar_odds`).

---

## 📈 Páginas de alto tráfego (odds/value)

Rotas novas adicionadas no frontend:

- ` /value-bets-hoje `: ranking de value bets (probabilidade vs odd/implícita)
- ` /over-25-odds-hoje `: recorte do dia para Over 2.5
- ` /btts-odds-hoje `: recorte do dia para BTTS
- ` /1x2-odds-hoje `: recorte do dia para 1X2
- ` /ferramentas ` e ` /guias `: calculadoras + páginas evergreen

### Rotas dinâmicas por liga/mercado/data

- ` /odds/:leagueSlug/:market/hoje ` (ex.: `/odds/brasileirao-a/over-25/hoje`)
- ` /odds/:leagueSlug/:market/YYYY-MM-DD ` (ex.: `/odds/brasileirao-a/over-25/2026-02-13`)

### Rotina recomendada (para não ficar lento)

Para evitar cálculo em tempo real (e manter o site rápido), a ideia é:

1. **Importar odds** e salvar em `MatchOdds`
2. **Pré-calcular análises** (probabilidades/insights/best odds) e salvar em `MatchAnalysis`

Comandos:

```bash
# 1) Importa odds para hoje + próximos 3 dias
python manage.py importar_odds --days 3

# 2) Pré-calcula análises para hoje + próximos 3 dias
python manage.py precomputar_analises --days-ahead 3 --sample-limit 5 --force
```

---

## 🤖 Telegram (digest diário)

Foi adicionado um comando de management no Django para enviar um digest diário (top value bets) via Telegram:

- Arquivo: `futstats/core/management/commands/enviar_digest_telegram.py`
- Variáveis de ambiente necessárias:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID` (um ou mais IDs separados por vírgula) **ou** `TELEGRAM_CHANNEL_ID`
  - `SITE_URL` (recomendado, para os links apontarem para seu domínio)

### Comandos úteis

#### 1) Testar sem enviar (dry-run)

```bash
python manage.py enviar_digest_telegram --limit 10 --mode latest --dry-run
```

#### 2) Enviar de verdade (usa `.env`)

```bash
python manage.py enviar_digest_telegram --limit 10 --mode latest
```

#### 3) Enviar filtrando por data do jogo (janela)

```bash
# Apenas hoje
python manage.py enviar_digest_telegram --limit 10 --mode window --days-ahead 1

# Hoje + próximos 2 dias
python manage.py enviar_digest_telegram --limit 10 --mode window --days-ahead 3
```

#### 4) Enviar passando token/chat por parâmetro (sem depender do `.env`)

```bash
python manage.py enviar_digest_telegram --token "SEU_TOKEN" --chat-id "-1001234567890" --limit 10 --mode latest
```

#### 5) Windows (PowerShell): definir variáveis e enviar

```powershell
$env:TELEGRAM_BOT_TOKEN="SEU_TOKEN"
$env:TELEGRAM_CHANNEL_ID="-1001234567890"   # canal/grupo (normalmente começa com -100)
$env:SITE_URL="https://seu-dominio.com"
python manage.py enviar_digest_telegram --limit 10 --mode latest
```

### Observações

- **`mode latest` vs `mode window`**
  - `latest`: pega as últimas recomendações (ótimo para teste e validação do bot)
  - `window`: filtra por data do jogo (ideal para digest diário real)
- **Encoding no Windows**: se o console mostrar caracteres quebrados, rode `chcp 65001` antes do comando.
- **Pré-requisito de dados**: para o digest ter conteúdo, o banco precisa ter `BetRecommendation` gerado (por exemplo, após rodar a importação/análise de odds do projeto).

Exemplo simples:

```bash
python manage.py enviar_digest_telegram --limit 10 --mode latest --site-url "https://seu-dominio.com"
```

---

## 🌍 Deploy

Este projeto pode ser facilmente implantado utilizando a plataforma **Lovable**:

- Acesse: [Projeto no Lovable](https://lovable.dev/projects/97817821-2020-4d7a-b69e-4767f7ded0e6)
- Clique em **Share > Publish** para publicar
- Para conectar um domínio personalizado: Vá em `Project > Settings > Domains`

🔗 Guia oficial: [Setting up a custom domain (Lovable Docs)](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## 💻 Outras formas de edição

- **Usando o Lovable:** edite diretamente pela plataforma
- **GitHub + IDE:** clone o repositório e edite localmente
- **GitHub Codespaces:** use a IDE do GitHub online
- **Editor direto no GitHub:** clique no botão de edição nos arquivos

---

## ✅ Funcionalidades (em desenvolvimento)

- [x] API REST com Django
- [x] Interface moderna com React
- [ ] Autenticação de usuários
- [ ] Dashboard de estatísticas

---

## 📬 Contato

Caso tenha dúvidas ou queira contribuir, fique à vontade para abrir uma issue ou pull request!

---
