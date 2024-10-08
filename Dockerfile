FROM node:14.21.1 as development

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

RUN npm run build  # Ensure this creates the dist folder

CMD ["ls", "-la", "dist"]

FROM node:14.21.1 as production

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=development /app/dist ./dist

CMD ["node", "./dist/index.js"]
