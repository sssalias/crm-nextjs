ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---------- deps (все зависимости) ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build ----------
FROM deps AS build
COPY . .
RUN npm run build

# ---------- production deps ----------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- final ----------
FROM base AS final
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/.next /app/.next
COPY --from=build /app/public /app/public
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY package.json .

CMD ["npm", "start"]