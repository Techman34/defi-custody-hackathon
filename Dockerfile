# Start with node 10.15.0
# FROM node:lts-stretch-slim
FROM node:10-stretch-slim
RUN apt update && apt install --assume-yes git python curl dnsutils build-essential

ARG buildtime_settings=local_docker
ENV SETTINGS_ENV=$buildtime_settings

RUN mkdir /source

WORKDIR /source

COPY package.json /source/
COPY yarn.lock /source/

RUN yarn install --frozen-lockfile --ignore-optional --non-interactive
RUN yarn global add truffle@5.0.2
RUN yarn global add ganache-cli@6.4.1

COPY . /source/

RUN ["chmod", "+x", "/source/docker-entrypoint.sh"]

ENTRYPOINT ["/source/docker-entrypoint.sh"]
CMD ["none"]
