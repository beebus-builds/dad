FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o bin/server ./cmd/api

FROM alpine:3.20
RUN apk --no-cache add ca-certificates tzdata
COPY --from=builder /app/bin/server /server
COPY migrations/ /migrations/
EXPOSE 8080
CMD ["/server"]
