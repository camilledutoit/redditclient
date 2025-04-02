package docker

deny[msg] {
  input.Config.User == ""
  msg = "Dockerfile must specify a non-root user."
}

deny[msg] {
    ports := input.Config.ExposedPorts
    not ports["4000/tcp"]
    msg = "Dockerfile must expose port 4000."
}
