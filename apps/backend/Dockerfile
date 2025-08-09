FROM node:20-slim
WORKDIR /app
COPY . /app
RUN npm i -g pnpm@9
# Expect building at repo root in CI; container starts from dist
CMD ["node", "dist/server/index.js"]