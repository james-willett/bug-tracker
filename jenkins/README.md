Why this change

The pipeline mounts a writable Go build cache into the container to avoid `go test` trying to initialize a build cache at `/.cache` (permission denied) when running inside the Docker container. The Jenkins agent/container user cannot write to paths owned by the container root by default, so we mount a host directory as `/go/cache` and set `GOCACHE` to use it.

How to prepare the Jenkins host

1. On the Jenkins host create the cache directory and give Jenkins write permissions (example paths shown):

   # create the directory and set ownership to the Jenkins user (adjust user/group as needed)
   mkdir -p /var/jenkins_home/gocache
   chown -R 1000:1000 /var/jenkins_home/gocache

2. Ensure the directory is accessible by the Jenkins controller/node that runs the pipeline.

Notes

- The Jenkinsfile mounts `${JENKINS_HOME:-/var/jenkins_home}/gocache` into the container at `/go/cache` and sets `GOCACHE='/go/cache'` and `GOMODCACHE='/go/pkg/mod'`.
- If your Jenkins runs inside a container, ensure the path exists on the host and is bind-mounted into the Jenkins container as well.
- If you'd rather use a different path, update the `args` volume mapping in `jenkins/Jenkinsfile` accordingly.
