FROM nginx:1.27.1 AS base
#-------------------------#
ENV TZ="Europe/Moscow"
EXPOSE 80
EXPOSE 443

FROM node:22.8.0-bookworm AS build
ARG ENV
WORKDIR /src
COPY ClientApp/package.json .
RUN npm install --legacy-peer-deps
COPY ClientApp/ .
RUN npm run build

FROM base AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/client-app/browser /usr/share/nginx/html