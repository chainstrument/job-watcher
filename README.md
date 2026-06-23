# Job Watcher

Agrégateur d'offres d'emploi pour développeurs web — surveille en continu plusieurs sources (flux RSS, APIs) et centralise les nouvelles offres dans une interface unifiée avec alertes et filtres.

---

## Problème à résoudre

Les offres d'emploi pour développeurs web sont dispersées sur de nombreuses plateformes (Indeed, LinkedIn, Welcome to the Jungle, etc.). Surveiller ces sources manuellement est chronophage et on rate facilement des opportunités récentes.

---

## Ce que fait l'application

Job Watcher se connecte périodiquement à un ensemble de sources configurées (flux RSS et/ou APIs publiques), déduplique et normalise les offres, puis les expose dans une interface où l'utilisateur peut :

- consulter les offres récentes agrégées de toutes les sources
- filtrer par mots-clés, stack technique, localisation ou type de contrat
- être notifié (email ou notification push) lorsqu'une nouvelle offre correspond à ses critères
- marquer des offres comme vues, sauvegardées ou ignorées

---

## Sources envisagées

| Source | Type | Notes |
|---|---|---|
| Indeed | RSS | Flux par recherche |
| LinkedIn | RSS | Flux jobs publics |
| Welcome to the Jungle | API / RSS | Offres tech France |
| Hacker News "Who's Hiring" | RSS / scraping | Thread mensuel HN |
| RemoteOK | API JSON | Emplois remote |
| We Work Remotely | RSS | Emplois remote |
| Stack Overflow Jobs | RSS | (si disponible) |

> D'autres sources pourront être ajoutées via configuration sans modifier le code.

---

## Spécifications fonctionnelles (proposition)

### SF-01 — Gestion des sources
- L'utilisateur peut ajouter, activer/désactiver et supprimer des sources RSS ou API
- Chaque source est configurée avec : URL, type (RSS/API), intervalle de polling, tags

### SF-02 — Collecte et normalisation
- Un job de collecte s'exécute à intervalles configurables (ex. toutes les heures)
- Chaque offre est normalisée dans un modèle commun : titre, entreprise, localisation, type de contrat, stack, date de publication, URL source
- Les doublons sont détectés et ignorés (même offre sur plusieurs sources)

### SF-03 — Filtrage et recherche
- Filtres disponibles : mots-clés (titre/description), stack technique, localisation (ville / remote), type de contrat (CDI, CDD, freelance, remote)
- Recherche plein texte sur titre et description

### SF-04 — Gestion des offres
- Statuts par offre : `nouvelle`, `vue`, `sauvegardée`, `ignorée`
- L'utilisateur peut ajouter des notes personnelles sur une offre

### SF-05 — Alertes
- L'utilisateur configure des alertes basées sur des critères (mots-clés, stack, localisation)
- Notification par email et/ou push navigateur lorsqu'une nouvelle offre correspond

### SF-06 — Tableau de bord
- Vue liste et vue détail des offres
- Compteurs : nouvelles offres depuis la dernière visite, offres sauvegardées
- Historique des sources avec statut de la dernière collecte (succès / erreur / nb offres)

---

## Spécifications techniques (proposition)

### ST-01 — Stack

| Couche | Technologie | Rôle |
|---|---|---|
| Full-stack framework | **Next.js 14+ (App Router)** | Pages, API Routes, SSR/SSG |
| Langage | **TypeScript** | Frontend + backend |
| Base de données | **PostgreSQL** via [Neon](https://neon.tech) | Offres, sources, alertes (serverless-compatible) |
| ORM | **Prisma** | Schéma, migrations, requêtes typées |
| Collecte périodique | **cron-job.org** (externe, gratuit) | Appelle `/api/collect` en HTTP sur n'importe quelle fréquence |
| Parsing RSS | `rss-parser` | Lecture des flux RSS |
| Notifications email | **Resend** | Alertes email transactionnelles |
| Hébergement | **Vercel** (plan Hobby) | Déploiement, serverless functions |

> **Pourquoi pas les Vercel Cron Jobs ?** Le plan Hobby est limité à 2 cron jobs avec une fréquence minimale d'une fois par jour. On utilise à la place [cron-job.org](https://cron-job.org) (gratuit, illimité) qui appelle la route `/api/collect` en HTTP avec un secret partagé — l'endpoint est une serverless function standard, callable par n'importe qui.

### ST-02 — Architecture

```
cron-job.org (toutes les heures, ou plus fréquemment)
        │
        ▼ POST /api/collect  +  X-Cron-Secret: $CRON_SECRET
        ▼
POST /api/collect          ← route handler Next.js (serverless)
        │
        ├─ RSSCollector
        ├─ APICollector
        └─ ...
              │
              ▼
        normalize → deduplicate → upsert (Neon/PostgreSQL via Prisma)
              │
              ▼
        vérifier alertes → envoyer email (Resend)
```

- **Collecteurs** : un module par type de source (RSS, API JSON) avec une interface commune `Collector`
- **API Routes** : `/api/jobs`, `/api/sources`, `/api/alerts` — consommées par le frontend Next.js
- **Frontend** : Server Components pour le rendu initial, Client Components pour les filtres/interactions

### ST-03 — Extensibilité
- Ajouter une nouvelle source = implémenter l'interface `Collector` et ajouter une entrée en base
- Les collecteurs sont enregistrés dans un registre central, pas besoin de modifier le cron

---

## Ce qui n'est pas dans le périmètre initial

- Candidature en ligne depuis l'app (on renvoie vers la source)
- Multi-utilisateurs / authentification (v1 = usage personnel, pas de login)
- Application mobile native
- Scraping de pages HTML (on reste sur RSS et APIs JSON publiques)

---

## Structure du dépôt (cible)

```
job-watcher/
├── src/
│   ├── app/                  # Next.js App Router (pages + API routes)
│   │   ├── api/
│   │   │   ├── collect/      # Route appelée par Vercel Cron
│   │   │   ├── jobs/         # CRUD offres
│   │   │   ├── sources/      # CRUD sources
│   │   │   └── alerts/       # CRUD alertes
│   │   ├── (dashboard)/      # Pages frontend
│   │   └── layout.tsx
│   ├── collectors/           # Modules de collecte (RSS, API...)
│   ├── lib/                  # Prisma client, helpers
│   └── types/                # Types TypeScript partagés
├── prisma/
│   └── schema.prisma
├── vercel.json               # Configuration crons
└── README.md
```

---

## Feuille de route (proposition)

| Milestone | Contenu |
|---|---|
| M1 — Fondations | Setup Next.js + Neon + Prisma, schéma DB, premier collecteur RSS, cron Vercel |
| M2 — Interface | Pages liste/détail offres, filtres basiques, statuts offres |
| M3 — Alertes | Configuration alertes, notifications email (Resend) |
| M4 — Sources avancées | Collecteurs API (RemoteOK, WTTJ), déduplication robuste |
| M5 — Polish | Dashboard stats, historique collectes, gestion des erreurs |
