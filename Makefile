build:
	sudo docker build -t asdev_gpt_bot_images .

run:
	sudo docker run -d --restart=always --name=asdev_gpt_bot_cntainer asdev_gpt_bot_images

logs:
	sudo docker logs asdev_gpt_bot_cntainer

start:
	sudo docker container start asdev_gpt_bot_cntainer

restart:
	sudo docker container restart asdev_gpt_bot_cntainer

stop:
	sudo docker container stop asdev_gpt_bot_cntainer
	sudo docker stop asdev_gpt_bot_cntainer

rm:
	sudo docker container rm asdev_gpt_bot_cntainer
	sudo docker rmi asdev_gpt_bot_images