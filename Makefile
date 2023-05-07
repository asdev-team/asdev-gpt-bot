build:
	sudo docker build -t asdev-gpt-bot .

run:
	sudo docker run -d --name asdev-gpt-bot --rm asdev-gpt-bot

stop:
	sudo docker stop asdev-gpt-bot

rm:
	sudo docker rmi asdev-gpt-bot