# Network Setup Guide - Connecting Mobile App to Local Backend

This guide helps you connect your Expo mobile app to the NestJS backend running on your computer.

## Configuration Complete

The following files have been configured:
- `.env` EXPO_PUBLIC_API_URL=http://172.20.10.2:8000/api/v1
- `app.json` extra.apiUrl updated
- Backend `main.ts` Now listens on 0.0.0.0 (all network interfaces)

## Steps to Connect

### 1. Restart Backend Server

cd 0xmart-backend
npm run start:dev

The server should log:
- Application is running on: http://localhost:8000/api/v1
- Mobile/Network access: http://172.20.10.2:8000/api/v1

### 2. Restart Expo App

CRITICAL: You must restart the Expo dev server after changing environment variables:

cd 0xmart-mobile
npm start -- --clear

Press 'r' to reload the app, or scan the QR code again.

### 3. Verify Connection

Check the Expo terminal logs. You should see:
[API] Base URL: http://172.20.10.2:8000/api/v1

## Troubleshooting

### Issue: "Network request failed"

1. Check if backend is accessible:
   - Open browser: http://172.20.10.2:8000/api/v1/docs
   
2. Check firewall:
   - Windows: Allow Node.js through Windows Firewall
   
3. Verify same network:
   - Computer and phone MUST be on same WiFi/hotspot

### Issue: IP Address Changed

If your IP changes:
1. Find new IP: ipconfig
2. Update .env file with new IP
3. Restart both backend and Expo

## Current Configuration

Your Computer IP: 172.20.10.2
Backend Port: 8000
Full API URL: http://172.20.10.2:8000/api/v1
