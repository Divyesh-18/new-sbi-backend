#!/bin/bash

# Health Check Script for PokerBaazi Backend
# Run this script to check the health of your server

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "======================================"
echo "  PokerBaazi Backend Health Check"
echo "======================================"
echo ""

# Check if PM2 is running
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 is not installed${NC}"
    exit 1
fi

# Check if app is running
APP_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="pokerbaazi-backend") | .pm2_env.status' 2>/dev/null)

if [ "$APP_STATUS" != "online" ]; then
    echo -e "${RED}❌ Application is not running${NC}"
    echo "Start it with: pm2 start ecosystem.config.js"
    exit 1
fi

echo -e "${GREEN}✅ Application Status: ONLINE${NC}"
echo ""

# Get process info
PROCESS_INFO=$(pm2 jlist | jq '.[] | select(.name=="pokerbaazi-backend")')

# Memory usage
MEMORY_MB=$(echo "$PROCESS_INFO" | jq -r '.monit.memory / 1024 / 1024 | floor')
echo -e "${BLUE}📊 Memory Usage:${NC}"
echo "   Current: ${MEMORY_MB} MB"
if [ "$MEMORY_MB" -lt 800 ]; then
    echo -e "   ${GREEN}✅ Status: HEALTHY${NC}"
else
    echo -e "   ${YELLOW}⚠️  Status: HIGH (> 800MB)${NC}"
fi
echo ""

# CPU usage
CPU=$(echo "$PROCESS_INFO" | jq -r '.monit.cpu')
echo -e "${BLUE}💻 CPU Usage:${NC}"
echo "   Current: ${CPU}%"
if (( $(echo "$CPU < 50" | bc -l) )); then
    echo -e "   ${GREEN}✅ Status: HEALTHY${NC}"
else
    echo -e "   ${YELLOW}⚠️  Status: HIGH (> 50%)${NC}"
fi
echo ""

# Uptime
UPTIME=$(echo "$PROCESS_INFO" | jq -r '.pm2_env.pm_uptime')
UPTIME_SECONDS=$(($(date +%s) - UPTIME / 1000))
UPTIME_HOURS=$((UPTIME_SECONDS / 3600))
UPTIME_MINUTES=$(((UPTIME_SECONDS % 3600) / 60))
echo -e "${BLUE}⏱️  Uptime:${NC}"
echo "   ${UPTIME_HOURS}h ${UPTIME_MINUTES}m"
if [ "$UPTIME_HOURS" -gt 1 ]; then
    echo -e "   ${GREEN}✅ Status: STABLE${NC}"
else
    echo -e "   ${YELLOW}⚠️  Status: Recently restarted${NC}"
fi
echo ""

# Restart count
RESTART_COUNT=$(echo "$PROCESS_INFO" | jq -r '.pm2_env.restart_time')
echo -e "${BLUE}🔄 Restart Count:${NC}"
echo "   Total: ${RESTART_COUNT}"
if [ "$RESTART_COUNT" -lt 5 ]; then
    echo -e "   ${GREEN}✅ Status: HEALTHY${NC}"
else
    echo -e "   ${YELLOW}⚠️  Status: Multiple restarts detected${NC}"
fi
echo ""

# Check recent errors
echo -e "${BLUE}🔍 Recent Errors (last 50 lines):${NC}"
ERROR_COUNT=$(pm2 logs pokerbaazi-backend --err --lines 50 --nostream 2>/dev/null | grep -i "error\|exception\|failed" | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "   ${GREEN}✅ No errors found${NC}"
else
    echo -e "   ${YELLOW}⚠️  Found ${ERROR_COUNT} error messages${NC}"
    echo "   Run 'pm2 logs pokerbaazi-backend --err' to view"
fi
echo ""

# Check cron job performance
echo -e "${BLUE}⏰ Cron Job Performance:${NC}"
CRON_LOGS=$(pm2 logs pokerbaazi-backend --lines 100 --nostream 2>/dev/null | grep "completed in")
if [ -n "$CRON_LOGS" ]; then
    echo "$CRON_LOGS" | tail -3
    
    # Check for slow crons (> 5000ms)
    SLOW_CRONS=$(echo "$CRON_LOGS" | grep -E "[5-9][0-9][0-9][0-9]ms|[0-9]{5,}ms" | wc -l)
    if [ "$SLOW_CRONS" -gt 0 ]; then
        echo -e "   ${YELLOW}⚠️  Found ${SLOW_CRONS} slow cron executions (>5s)${NC}"
    else
        echo -e "   ${GREEN}✅ All crons completing in <5s${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  No cron completion logs found${NC}"
fi
echo ""

# Check for cron overlaps
echo -e "${BLUE}🚫 Cron Job Overlaps:${NC}"
OVERLAP_COUNT=$(pm2 logs pokerbaazi-backend --lines 200 --nostream 2>/dev/null | grep "still running, skipping" | wc -l)
if [ "$OVERLAP_COUNT" -eq 0 ]; then
    echo -e "   ${GREEN}✅ No overlaps detected${NC}"
else
    echo -e "   ${YELLOW}⚠️  Found ${OVERLAP_COUNT} overlap instances${NC}"
    echo "   This means crons are taking longer than their interval"
fi
echo ""

# Socket.io connections
echo -e "${BLUE}🔌 Socket.io Connections:${NC}"
CONN_LOGS=$(pm2 logs pokerbaazi-backend --lines 50 --nostream 2>/dev/null | grep "Total connections" | tail -3)
if [ -n "$CONN_LOGS" ]; then
    echo "$CONN_LOGS"
    echo -e "   ${GREEN}✅ Connections are being tracked${NC}"
else
    echo -e "   ${YELLOW}⚠️  No connection logs found${NC}"
fi
echo ""

# MongoDB connection
echo -e "${BLUE}🍃 MongoDB Connection:${NC}"
MONGO_LOGS=$(pm2 logs pokerbaazi-backend --lines 200 --nostream 2>/dev/null | grep -i "connected to\|mongodb")
if echo "$MONGO_LOGS" | grep -q "Connected to"; then
    echo -e "   ${GREEN}✅ Connected to MongoDB${NC}"
    echo "$MONGO_LOGS" | grep "Connected to" | tail -1
else
    echo -e "   ${RED}❌ No MongoDB connection found${NC}"
fi
echo ""

# Overall health score
echo "======================================"
HEALTH_SCORE=100

if [ "$MEMORY_MB" -gt 800 ]; then HEALTH_SCORE=$((HEALTH_SCORE - 20)); fi
if (( $(echo "$CPU > 50" | bc -l) )); then HEALTH_SCORE=$((HEALTH_SCORE - 15)); fi
if [ "$RESTART_COUNT" -gt 5 ]; then HEALTH_SCORE=$((HEALTH_SCORE - 15)); fi
if [ "$ERROR_COUNT" -gt 10 ]; then HEALTH_SCORE=$((HEALTH_SCORE - 20)); fi
if [ "$OVERLAP_COUNT" -gt 5 ]; then HEALTH_SCORE=$((HEALTH_SCORE - 15)); fi
if [ "$SLOW_CRONS" -gt 3 ]; then HEALTH_SCORE=$((HEALTH_SCORE - 15)); fi

echo -e "${BLUE}🏥 Overall Health Score: ${NC}"
if [ "$HEALTH_SCORE" -ge 80 ]; then
    echo -e "   ${GREEN}${HEALTH_SCORE}/100 - HEALTHY ✅${NC}"
elif [ "$HEALTH_SCORE" -ge 60 ]; then
    echo -e "   ${YELLOW}${HEALTH_SCORE}/100 - FAIR ⚠️${NC}"
else
    echo -e "   ${RED}${HEALTH_SCORE}/100 - NEEDS ATTENTION ❌${NC}"
fi
echo "======================================"
echo ""

# Recommendations
if [ "$HEALTH_SCORE" -lt 80 ]; then
    echo -e "${YELLOW}📋 Recommendations:${NC}"
    if [ "$MEMORY_MB" -gt 800 ]; then
        echo "   • High memory usage - Check for memory leaks"
    fi
    if [ "$ERROR_COUNT" -gt 10 ]; then
        echo "   • Multiple errors - Run: pm2 logs pokerbaazi-backend --err"
    fi
    if [ "$OVERLAP_COUNT" -gt 5 ]; then
        echo "   • Cron overlaps - Consider optimizing database queries"
    fi
    if [ "$SLOW_CRONS" -gt 3 ]; then
        echo "   • Slow crons - Check database indexes"
    fi
    echo ""
fi

echo "For detailed monitoring: pm2 monit"
echo "For live logs: pm2 logs pokerbaazi-backend"
