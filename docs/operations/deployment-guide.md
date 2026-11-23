# MERIDIAN Deployment & Operations Guide

## Production Topology
- **API Runtime**: FastAPI deployed on AWS ECS Fargate or Docker host behind Application Load Balancer.
- **Web Frontend**: Next.js 16 standalone Node.js server container.
- **Primary Database**: Amazon RDS PostgreSQL 16 with automated multi-AZ replication.
- **Cache**: Amazon ElastiCache Redis 7.

## Running with Docker Compose
```bash
cd infrastructure/docker
docker compose up -d --build
```

## Health Checks & Monitoring
- API Health Check: `GET /api/docs` or `GET /api/openapi.json`
- SSE Reconnect Monitoring: Client passes `Last-Event-ID` header upon reconnect to replay missed events sequentially.
