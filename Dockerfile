FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


#npm ci installerar exakt det som står i lockfilen (stabilt).
 #--host 0.0.0.0 behövs för att jag ska nå Vite från min dator utanför containern.!!!