
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm i --only=production
COPY src ./src
COPY data ./data
ENV PORT=4000
EXPOSE 4000
CMD ["npm","run","start"]
