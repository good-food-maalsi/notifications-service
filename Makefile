start:
	docker compose -f docker-compose.yml -f redis.yml up -d
	docker compose -f rabbitmq.yml up -d

stop:
	docker compose -f docker-compose.yml -f redis.yml down
	docker compose -f rabbitmq.yml down

install:
	docker network create good-food
	docker volume create rabbitmq-data
