FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --only=production
COPY src ./src
# COPY data ./data  <-- removed because folder may not exist
ENV PORT=4000
EXPOSE 4000
CMD ["npm","run","start"]
