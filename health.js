#!/usr/bin/env node

/**
 * Health Check Server for WCAGAI
 *
 * Provides HTTP health endpoint for Railway and cloud platforms
 * while the orchestrator runs agents in the background.
 *
 * This server runs concurrently with orchestrate.sh to:
 * 1. Keep the Railway container alive
 * 2. Provide health check endpoint at /health
 * 3. Show pipeline status and agent info
 * 4. Enable graceful shutdown
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Start time for uptime calculation
const startTime = new Date();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WCAGAI Pipeline',
    message: 'Orchestrator running in background',
    uptime: Math.floor((Date.now() - startTime) / 1000) + 's',
    timestamp: new Date().toISOString()
  });
});

// Detailed health check
app.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  res.json({
    status: 'healthy',
    service: 'wcagai-complete-stack',
    version: '2.0.0',
    uptime_seconds: uptime,
    uptime_human: formatUptime(uptime),
    environment: process.env.NODE_ENV || 'production',
    tenant: process.env.TENANT_ID || 'default',
    features: {
      orchestrator: true,
      agents: [
        'keyword',
        'scan',
        'gemini',
        'security',
        'badge',
        'ceo',
        'draft',
        'deploy'
      ],
      lucy_mode: process.env.LUCY_MODE === 'true',
      bullmq: process.env.USE_BULLMQ === 'true'
    },
    timestamp: new Date().toISOString()
  });
});

// Status endpoint showing what keyword is running
app.get('/status', (req, res) => {
  res.json({
    pipeline: 'running',
    keyword: process.env.KEYWORD || 'accessibility (default)',
    agents_launched: 8,
    logs_directory: './logs/',
    uptime: Math.floor((Date.now() - startTime) / 1000) + 's'
  });
});

// Format uptime in human-readable format
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down health server...');
  server.close(() => {
    console.log('✅ Health server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down health server...');
  server.close(() => {
    console.log('✅ Health server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏥 WCAGAI Health Server Running                            ║
║                                                               ║
║   Port:        ${PORT}                                        ║
║   Endpoints:   GET /                                          ║
║                GET /health                                    ║
║                GET /status                                    ║
║                                                               ║
║   Orchestrator: Running in background                        ║
║   Agents:       8 agents launched                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});
