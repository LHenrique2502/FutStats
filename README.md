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
