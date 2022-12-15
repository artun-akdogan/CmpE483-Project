FROM node:14-alpine
ENV CI=true
#ENV CHOKIDAR_USEPOLLING=true

WORKDIR /frontend/

COPY . /frontend

RUN npm install
RUN npm run test

EXPOSE 3000
ENTRYPOINT ["npm"]
