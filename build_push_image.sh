#!/bin/sh


image_name="item-app"
image_version="v1"
docker_username="zyynzyzy"
#Variable declaration


docker build . -t $image_name:$image_version
#Build Docker image

echo $PASSWORD_DOCKER_HUB | docker login -u $docker_username --password-stdin
#Memasukkan password ke dalam docker login 

docker tag $image_name:$image_version $docker_username/$image_name:$image_version
#Memberikan tag pada image yang sudah dibuild

docker push $docker_username/$image_name:$image_version
#Push image ke docker hub
