FROM golang:1.21-alpine

WORKDIR /app

# Create mount point directory with proper permissions
RUN mkdir -p /data && chmod 777 /data

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o main cmd/bugtracker/main.go

# Expose port 8081
EXPOSE 8081

# Run the binary
CMD ["./main"] 