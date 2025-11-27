## Frontend Dockerfile for Cloud Run (React + Vite)
FROM node:20 AS build
WORKDIR /app

# Build-time env vars are passed from CI to bake backend URL/API key into the static bundle.
ARG VITE_GEMINI_API_KEY
ARG VITE_API_URL
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY \
    VITE_API_URL=$VITE_API_URL

# Install dependencies with pnpm (preferred). Falls back to npm if pnpm is unavailable.
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
