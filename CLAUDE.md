@AGENTS.md

# Job Watcher — instructions pour Claude

## Stack

- **Next.js 16** (App Router) — lire `node_modules/next/dist/docs/` avant de toucher aux conventions
  - Le fichier middleware s'appelle `proxy.ts` (pas `middleware.ts`) et exporte une fonction `proxy`
  - Les Server Actions s'écrivent avec `"use server"` dans le corps de la fonction (inline dans les Server Components)
- **React 19** — `useActionState` disponible nativement
- **TypeScript** strict
- **Prisma 7** — breaking changes importants :
  - Requiert un driver adapter (`PrismaPg` de `@prisma/adapter-pg`)
  - Client généré dans `src/generated/prisma/client` (pas d'`index.ts` — importer depuis le chemin complet)
  - Config dans `prisma.config.ts` à la racine (pas dans `next.config`)
  - `new PrismaClient()` sans argument est invalide — toujours passer `{ adapter }`
- **Tailwind v4** — config via `@tailwindcss/postcss`, pas de `tailwind.config.js`
- **next-auth v5 beta** (`next-auth@beta`) — Auth.js, App Router natif

## Infrastructure

- **Hébergement** : Vercel Hobby
  - Le plan Hobby limite les crons à une fois par jour minimum → utiliser **cron-job.org** comme déclencheur HTTP externe
  - Le endpoint `/api/collect` est protégé par l'en-tête `X-Cron-Secret` (pas par OAuth)
- **Base de données** : Neon (PostgreSQL serverless, free tier)
- **Email** : Resend — le domaine de test `onboarding@resend.dev` ne peut envoyer qu'à l'email du compte Resend
- **Auth** : GitHub OAuth via NextAuth v5, compte restreint à `chainstrument`

## Variables d'environnement

```
DATABASE_URL        # Neon connection string
CRON_SECRET         # Secret partagé avec cron-job.org
RESEND_API_KEY      # Clé Resend
ALERT_EMAIL         # Email de destination des alertes
AUTH_SECRET         # Secret NextAuth (générer avec openssl rand -base64 32)
AUTH_GITHUB_ID      # OAuth App GitHub — Client ID
AUTH_GITHUB_SECRET  # OAuth App GitHub — Client Secret
AUTH_URL            # http://localhost:3000 en local (optionnel en prod, Vercel auto-détecte)
```

## Conventions de code

- **Pas de commentaires** sauf si le WHY est non-évident (contrainte cachée, workaround d'un bug précis)
- Les services tiers (Resend, etc.) doivent être **instanciés de façon lazy** (dans la fonction, jamais au niveau du module) — sinon le build échoue si la variable d'env est absente
- Les pages sont des **Server Components** par défaut ; `'use client'` uniquement si hooks React ou événements navigateur nécessaires
- `export const dynamic = 'force-dynamic'` sur les pages qui lisent la DB à chaque requête

## Architecture

```
src/
  app/                    # Routes Next.js (App Router)
    api/
      auth/[...nextauth]/ # NextAuth handlers
      collect/            # Endpoint cron (protégé par X-Cron-Secret)
      jobs/               # API REST jobs
      alerts/             # API REST alertes
      sources/            # API REST sources
    jobs/[id]/            # Page détail
    alerts/               # Page alertes
    sources/              # Page sources
    stats/                # Page stats
    login/                # Page connexion (publique)
  collectors/             # Logique de collecte (interface Collector + registry)
  components/             # Composants React
  generated/prisma/       # Client Prisma généré (gitignored)
  lib/
    prisma.ts             # Singleton Prisma avec PrismaPg adapter
    match-alert.ts        # Matching offres/alertes (pure function)
    send-alert-email.ts   # Envoi email Resend (lazy init)
    content-hash.ts       # SHA-1 pour déduplication cross-sources
  auth.ts                 # Config NextAuth (GitHub provider)
  proxy.ts                # Protection de toutes les routes
```

## Pièges connus

- **`prisma generate`** doit tourner à chaque déploiement → `"postinstall": "prisma generate"` dans `package.json`
- **`/src/generated/`** est gitignored — le client est regénéré au déploiement via postinstall
- Le **cron cron-job.org** doit envoyer en **POST** (pas GET) et inclure l'en-tête `X-Cron-Secret`
- Les erreurs silencieuses dans les Promises (`.catch(console.error)`) masquent les problèmes — préférer propager dans un tableau `errors[]`
- **NextAuth callback URL** sur GitHub OAuth App : `https://job-watcher-rho.vercel.app/api/auth/callback/github`
