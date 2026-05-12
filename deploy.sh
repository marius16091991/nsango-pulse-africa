#!/bin/bash

cd /var/www/nsango-pulse-africa

echo "🔄 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔁 Restarting PM2..."
pm2 restart all

echo "✅ Deploy finished"
