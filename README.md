Python 3.10+ doesn't work because of some bad version check in one of the dependencies

Currently using 3.9.6

# Start via Docker (Flask + Postgres + Frontend)

```
docker-compose up -d --build
```

Access Frontend at `localhost:3000`

# Running Flask locally without Docker 
on MacOS you need PostgreSQL from Brew to install psycopg2

```
brew install postgresql
```
