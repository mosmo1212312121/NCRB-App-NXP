# FROM node:alpine AS builder
# WORKDIR /opt/web
# COPY package.json ./
# RUN apk update \
#     && apk add g++ make python
# RUN npm cache clean --force \
#     && npm install
# # RUN apk add --no-cache --virtual .gyp \
# #         python \
# #         make \
# #         g++ \
# #     && npm install \
# #     && apk del .gyp

# ENV PATH="./node_modules/.bin:$PATH"

# COPY . ./
# RUN npm run build \
#     && npm run generate
FROM nginx:1.17-alpine
RUN apk --no-cache add curl
RUN curl -L https://github.com/a8m/envsubst/releases/download/v1.1.0/envsubst-`uname -s`-`uname -m` -o envsubst && \
    chmod +x envsubst && \
    mv envsubst /usr/local/bin
COPY ./nginx.config /etc/nginx/nginx.template
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/nginx.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
# COPY --from=builder /opt/web/dist /usr/share/nginx/html 
COPY ./dist /usr/share/nginx/html 