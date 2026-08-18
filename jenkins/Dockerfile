FROM jenkins/jenkins:lts-jdk17

USER root

ENV GOCACHE=/tmp/.cache/go-build

RUN apt-get update && apt-get install -y lsb-release

# Install Docker CLI
RUN curl -fsSLo /usr/share/keyrings/docker-archive-keyring.asc \
  https://download.docker.com/linux/debian/gpg

RUN echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/usr/share/keyrings/docker-archive-keyring.asc] \
  https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list

RUN apt-get update && apt-get install -y docker-ce-cli

# Install Go
RUN apt-get install -y golang-go

# Create cache directory with proper permissions
RUN mkdir -p /tmp/.cache/go-build && \
    chmod 777 /tmp/.cache/go-build

USER jenkins