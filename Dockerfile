FROM registry.il4.dso.mil/platform-one/devops/pipeline-templates/ironbank/nodejs14:14.16.0 as builder

USER root

WORKDIR /app

COPY package.json ./
COPY src src
COPY scripts scripts

RUN npm i

RUN npm run build

USER appuser

FROM registry.il4.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nginx-19:1.19.2

USER appuser

COPY --from=builder --chown=appuser:appuser /app/dist /var/www

EXPOSE 8080

CMD [ "nginx", "-g", "daemon off;" ]
