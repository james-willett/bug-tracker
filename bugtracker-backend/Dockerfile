FROM golang:1.21-alpine

WORKDIR /app

# Create data directory
RUN mkdir -p /data && chmod 777 /data

# Alpine mirrors → HTTP (бо TLS у твоїй мережі зламаний)
RUN sed -i 's/https/http/' /etc/apk/repositories

# Install tools
RUN apk update \
    && apk add --no-cache ca-certificates git wget \
    && update-ca-certificates

# Go should use system CA (safe)
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV GODEBUG=x509roots=1

# Copy go.mod/sum first (cache layer)
COPY go.mod go.sum ./

# TLS inside GitHub broken → disable verification for git
ENV GIT_SSL_NO_VERIFY=1

# Avoid Go proxy HTTPS
ENV GOPROXY=direct
ENV GOSUMDB=off
ENV GOINSECURE=*

# Download modules
RUN go mod download

# Copy the rest of backend code
COPY . .

# Build static binary (required for Alpine)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main cmd/bugtracker/main.go

EXPOSE 8080
CMD ["./main"]
