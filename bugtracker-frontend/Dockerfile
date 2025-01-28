FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set default API URL for container usage
ENV NEXT_PUBLIC_API_URL=http://backend:8080

# Exclude test reports
RUN echo "test-results.xml" >> .dockerignore

# Build the Next.js app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"] 