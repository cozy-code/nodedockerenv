FROM node:7.5.0

ENV HOME=/home/app

WORKDIR $HOME

# install global npm components
RUN npm install -g gulp \
&& npm install -g typescript typings\
&& npm install express-generator -g \
&& npm install nodemon -g \
&& npm cache clear
