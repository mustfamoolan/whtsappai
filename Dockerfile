FROM golang:1.22-alpine AS backend-builder

WORKDIR /app
COPY app/go.mod app/go.sum ./
RUN go mod download

COPY app/ ./
RUN go build -o main .

FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY app/frontend/package.json app/frontend/package-lock.json ./
RUN npm install
COPY app/frontend/ ./
RUN npm run build

FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata

COPY --from=backend-builder /app/main .
COPY --from=frontend-builder /app/dist ./public

# Ensure the database file is placed in a volume (if sqlite is used)
ENV PORT=8080
ENV APP_ENV=production

EXPOSE 8080
CMD ["./main"]
