FROM node:20-slim AS build
WORKDIR /repo
COPY . /repo
RUN npm i -g pnpm@9
# Build expected at repo root in CI

FROM node:20-slim
RUN npm i -g serve
WORKDIR /app
COPY dist /app/dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]