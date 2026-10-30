# PostizMetro frontend: Metronic Next.js 16, Node 24.
# NEXT_PUBLIC_BACKEND_URL is baked at build time, so Coolify must pass it
# as a build argument. NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1
# is required in this egress environment for the Google Fonts fetch at build.
FROM node:24-bookworm-slim
WORKDIR /app
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1
ENV PORT=3000
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
