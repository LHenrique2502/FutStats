# Meu Novo Projeto

## Back-end

### Execute project

`python manage.py runserver (executar esse comando dentro da raiz do projeto)`
`python manage.py "nome do arquivo que deseja executar"`

### Migrations

`python manage.py makemigrations`
`python manage.py migrate`

## Populando o banco de dados

Após clonar o projeto e ativar seu ambiente virtual:

1. Aplique as migrações para criar o banco:

   ```bash
   python manage.py migrate

   ```

2. Carregue os dados de exemplo (caso deseje restaurar os dados salvos):

   ```bash
   python manage.py loaddata dados.json
   ```

O arquivo db.sqlite3 está ignorado no repositório. Utilize o loaddata sempre que quiser importar os dados salvos no arquivo dados.json.

### Create superuser

`python manage.py createsuperuser`
