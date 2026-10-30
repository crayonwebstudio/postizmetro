# PostizMetro backend: Postiz NestJS 10, Node 22 (Postiz engines >=22.12 <23).
# Builds backend, workers, and cron. The compose file overrides CMD per service.
# Prisma generate MUST run before build; the VM build failure in BUILD.md was
# caused by a missing generated Prisma client, not by PostizMetro code.
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10.6.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.base.json ./
COPY libraries ./libraries
COPY apps ./apps
COPY scripts ./scripts
COPY i18n.json i18n.lock version.txt ./
RUN pnpm install --ignore-scripts
RUN pnpm dlx prisma@6.5.0 generate --schema ./libraries/nestjs-libraries/src/database/prisma/schema.prisma
RUN NODE_OPTIONS=--max-old-space-size=4096 pnpm run build:backend
RUN NODE_OPTIONS=--max-old-space-size=4096 pnpm run build:workers
RUN NODE_OPTIONS=--max-old-space-size=4096 pnpm run build:cron
ENV PORT=3000
EXPOSE 3000
# APP_MODE selects the process when the same image is reused for workers/cron.
# Default is the NestJS backend. Set APP_MODE=workers or APP_MODE=cron in Coolify
# for the worker/cron applications, and APP_MODE=seed for a one-off seed run.
CMD ["sh", "-c", "if [ \"$APP_MODE\" = \"workers\" ]; then exec node apps/workers/dist/apps/workers/src/main.js; elif [ \"$APP_MODE\" = \"cron\" ]; then exec node apps/cron/dist/apps/cron/src/main.js; elif [ \"$APP_MODE\" = \"seed\" ]; then pnpm dlx prisma@6.5.0 db push --schema ./libraries/nestjs-libraries/src/database/prisma/schema.prisma && exec node scripts/seed-review-workspace.mjs; else exec node apps/backend/dist/apps/backend/src/main.js; fi"]
