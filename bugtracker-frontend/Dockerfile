# ---- Base image ----
FROM node:20


WORKDIR /app


COPY package*.json ./


RUN if [ -f package-lock.json ]; then \
      npm ci --omit=optional; \
    else \
      npm install --omit=optional; \
    fi


COPY . .

RUN npm install --omit=optional


EXPOSE 3000


CMD ["npm", "start"]
