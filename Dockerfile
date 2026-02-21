ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-alpine AS base
ARG PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM deps AS build
COPY . .

RUN npm run build

FROM base AS final
ENV PORT=$PORT

COPY --from=build /app/.next /app/.next
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules

CMD ["npm", "start"]
