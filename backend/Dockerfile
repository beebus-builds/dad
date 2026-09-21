FROM golang:1.27-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o bin/server ./cmd/api

FROM alpine:3.22
RUN apk --no-cache add ca-certificates tzdata wget \
    && addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/bin/server /server
# Migrations are embedded in the binary (migrations/embed.go);
# no need to ship the directory.
EXPOSE 8080
USER appuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/ready || exit 1
CMD ["/server"]
