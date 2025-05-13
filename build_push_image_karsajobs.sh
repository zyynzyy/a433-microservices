#!/bin/sh

docker build . -t zyynzyzy/karsajobs:latest
#Perintah build image

echo $PASSWORD_DOCKER_HUB | docker login -u zyynzyzy --password-stdin
#Perintah login ke docker hub

docker push zyynzyzy/karsajobs:latest
#Perintah push image ke docker hub