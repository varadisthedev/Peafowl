docker-compose.yml: manages both the containers


docker-compose.yml
      │
      ├── Express Container
      └── Redis Container

redis comes from redis:latest, hence no sepearte docker image needed 
hence no seperate dockerfile