# 🚀 AI Persistence Engine - Deployment Guide

## Overview

The AI Persistence Engine is a production-ready system for autonomous AI identity management, memory consolidation, and learning progress tracking. This guide provides comprehensive instructions for deploying and managing the system.

## 🎯 Quick Start

### One-Command Deployment
```bash
cd /home/main/dev/Axiomatic/packages/autonomous-identity
./deploy-ai-persistence.sh
```

### Manual Deployment
```bash
# 1. Navigate to package directory
cd /home/main/dev/Axiomatic/packages/autonomous-identity

# 2. Create environment file
cat > .env << 'EOF'
NODE_ENV=production
H2GNN_STORAGE_PATH=/app/persistence
H2GNN_STATE_FILE=/app/state/state.json
H2GNN_LOG_LEVEL=info
H2GNN_MAX_MEMORIES=10000
H2GNN_ENCRYPTION_KEY=$(openssl rand -hex 32)
EOF

# 3. Build and deploy
docker-compose -f docker-compose.working.yml build --no-cache
docker-compose -f docker-compose.working.yml up -d

# 4. Wait and verify
sleep 30
curl -s http://localhost:3000/health | jq '.'
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│ AI Persistence   │────│ File Storage    │
│   Port: 80      │    │ Core Port: 3000  │    │ /app/persistence│
│   SSL/TLS       │    │ Health Checks    │    │ /app/state      │
│   Load Balance  │    │ Auto-restart     │    │ /app/logs       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
packages/autonomous-identity/
├── docker-compose.working.yml    # ✅ Working deployment configuration
├── Dockerfile.working            # ✅ Optimized Docker build
├── server.mjs                    # ✅ AI Persistence server
├── nginx.simplified.conf         # ✅ Nginx proxy configuration
├── core/dist/                    # ✅ Pre-built core modules
├── .env                          # ✅ Environment configuration
└── README_DEPLOYMENT.md          # ✅ This deployment guide
```

## 🔧 Configuration Files

### docker-compose.working.yml
The working Docker Compose configuration that includes:
- AI Persistence Core service
- Nginx reverse proxy
- Health checks
- Volume mounts for persistence
- Network configuration

### Dockerfile.working
Optimized Docker build that:
- Uses Node.js 18 Alpine base image
- Installs production dependencies
- Copies server and core files
- Sets up non-root user
- Configures health checks

### server.mjs
The AI Persistence server that:
- Imports from `./core/dist/index.mjs`
- Provides HTTP API endpoints
- Handles CORS and preflight requests
- Implements health checks
- Manages identity and memory operations

### nginx.simplified.conf
Nginx configuration that:
- Proxies requests to AI Persistence Core
- Handles load balancing
- Provides SSL/TLS termination
- Implements health checks

## 🌐 Service Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health status |
| `/status` | GET | Detailed system status |
| `/api/identities` | POST | Create AI identity |
| `/api/identities` | GET | List AI identities |
| `/api/memories` | POST | Store memory |
| `/api/memories` | GET | Retrieve memories |
| `/api/learn` | POST | Learn concept |

## 🔌 API Examples

### Health Check
```bash
curl -s http://localhost:3000/health | jq '.'
```

### Create AI Identity
```bash
curl -X POST http://localhost:3000/api/identities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Assistant",
    "type": "ai",
    "capabilities": ["learning", "reasoning"],
    "preferences": {"language": "en"}
  }'
```

### Store Memory
```bash
curl -X POST http://localhost:3000/api/memories \
  -H "Content-Type: application/json" \
  -d '{
    "type": "episodic",
    "content": "User interaction data",
    "metadata": {"source": "user", "importance": 0.8}
  }'
```

### Retrieve Memories
```bash
curl -s http://localhost:3000/api/memories | jq '.'
```

## 🛠️ Troubleshooting

### Common Issues

#### Container Keeps Restarting
**Symptoms**: Container status shows "Restarting"
**Solution**:
```bash
# Check logs
docker-compose -f docker-compose.working.yml logs ai-persistence-working

# Verify import path in server.mjs
# Should be: import { AIPersistenceCore, DEFAULT_CONFIG } from './core/dist/index.mjs';
```

#### Nginx Proxy Not Responding
**Symptoms**: `curl http://localhost/health` fails
**Solution**:
```bash
# Check nginx logs
docker-compose -f docker-compose.working.yml logs nginx

# Verify upstream server name in nginx.simplified.conf
# Should be: server ai-persistence-working:3000;
```

#### Port Conflicts
**Symptoms**: "Port is already allocated" error
**Solution**:
```bash
# Stop conflicting services
docker stop $(docker ps -q --filter "publish=3000")
docker stop $(docker ps -q --filter "publish=80")
```

### Debug Commands

```bash
# Check container status
docker-compose -f docker-compose.working.yml ps

# View all logs
docker-compose -f docker-compose.working.yml logs

# View specific service logs
docker-compose -f docker-compose.working.yml logs ai-persistence-working
docker-compose -f docker-compose.working.yml logs nginx

# Restart services
docker-compose -f docker-compose.working.yml restart

# Monitor resource usage
docker stats
```

## 🔒 Security

### Environment Variables
```bash
# Production security settings
NODE_ENV=production
H2GNN_STORAGE_PATH=/app/persistence
H2GNN_STATE_FILE=/app/state/state.json
H2GNN_LOG_LEVEL=info
H2GNN_MAX_MEMORIES=10000
H2GNN_ENCRYPTION_KEY=your-secure-encryption-key-here
```

### Encryption Key Generation
```bash
# Generate secure encryption key
openssl rand -hex 32
```

### SSL/TLS Configuration
```bash
# Add SSL certificates to nginx configuration
# Update nginx.simplified.conf with SSL settings
# Add certificate files to ssl/ directory
```

## 📊 Monitoring

### Health Monitoring
```bash
# Check health status
curl -s http://localhost:3000/health | jq '.'

# Check system status
curl -s http://localhost:3000/status | jq '.'
```

### Log Monitoring
```bash
# Monitor logs in real-time
docker-compose -f docker-compose.working.yml logs -f

# Export logs for analysis
docker-compose -f docker-compose.working.yml logs > ai-persistence.log
```

### Performance Monitoring
```bash
# Monitor resource usage
docker stats

# Check health metrics
curl -s http://localhost:3000/health | jq '.metrics'
```

## 🔄 Maintenance

### Update Services
```bash
# Pull latest images
docker-compose -f docker-compose.working.yml pull

# Rebuild and restart
docker-compose -f docker-compose.working.yml up -d --build
```

### Backup Data
```bash
# Backup persistence data
docker run --rm -v autonomous-identity_ai-persistence-data:/data -v $(pwd):/backup alpine tar czf /backup/persistence-backup.tar.gz -C /data .
```

### Restore Data
```bash
# Restore persistence data
docker run --rm -v autonomous-identity_ai-persistence-data:/data -v $(pwd):/backup alpine tar xzf /backup/persistence-backup.tar.gz -C /data
```

## 🚀 Advanced Configuration

### Custom Environment Variables
```bash
# Advanced configuration
cat > .env << 'EOF'
NODE_ENV=production
H2GNN_STORAGE_PATH=/app/persistence
H2GNN_STATE_FILE=/app/state/state.json
H2GNN_LOG_LEVEL=debug
H2GNN_MAX_MEMORIES=50000
H2GNN_CONSOLIDATION_THRESHOLD=500
H2GNN_ENCRYPTION_KEY=your-secure-encryption-key-here
EOF
```

### Scaling Configuration
```bash
# Scale AI Persistence service
docker-compose -f docker-compose.working.yml up -d --scale ai-persistence-working=3
```

## 🔗 Integration

### H²GNN MCP Integration
The AI Persistence Engine integrates with:
- Enhanced H²GNN MCP Server
- Knowledge Graph MCP Server
- Geometric Tools MCP Server
- LSP-AST MCP Server
- H²GNN Core MCP Server

### Universal Signal Processing
- Supports all signal types through 5-cell geometric framework
- FFT processing for frequency-domain analysis
- Geometric constraints for feedback prevention
- Sacred mathematics integration for optimization

## 📞 Support

### Quick Commands Reference
```bash
# Start services
docker-compose -f docker-compose.working.yml up -d

# Stop services
docker-compose -f docker-compose.working.yml down

# View status
docker-compose -f docker-compose.working.yml ps

# View logs
docker-compose -f docker-compose.working.yml logs -f

# Restart services
docker-compose -f docker-compose.working.yml restart

# Test health
curl -s http://localhost:3000/health | jq '.'
```

### Emergency Recovery
```bash
# Complete reset
docker-compose -f docker-compose.working.yml down -v
docker system prune -f
docker-compose -f docker-compose.working.yml build --no-cache
docker-compose -f docker-compose.working.yml up -d
```

## ✅ Production Checklist

### Pre-Deployment
- [ ] Docker and Docker Compose installed
- [ ] Environment file created with secure encryption key
- [ ] Ports 80 and 3000 available
- [ ] Sufficient disk space for persistence volumes

### Deployment
- [ ] Docker images built successfully
- [ ] Containers started and healthy
- [ ] Health endpoint responding
- [ ] Nginx proxy working
- [ ] API endpoints functional

### Post-Deployment
- [ ] Health checks passing
- [ ] Memory operations working
- [ ] Identity management functional
- [ ] Logs being generated
- [ ] Performance metrics normal

---

**The AI Persistence Engine is production-ready and provides persistent AI identity, universal knowledge graph analysis, and seamless integration with the Universal Life Protocol ecosystem.**
