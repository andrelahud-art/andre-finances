#!/bin/bash

# Script para preparar el deploy a Vercel con Supabase

echo "🚀 Preparando aplicación para producción con Supabase..."

# 1. Cambiar al schema de PostgreSQL
echo "📄 Cambiando al schema de PostgreSQL..."
cp prisma/schema-postgresql.prisma prisma/schema.prisma

# 2. Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

echo "✅ Aplicación lista para deploy a Vercel!"
echo ""
echo "📋 INSTRUCCIONES PARA VERCEL:"
echo "1. Ve a tu dashboard de Vercel"
echo "2. Agrega estas variables de entorno:"
echo "   - DATABASE_URL: postgresql://postgres:Contabilidad007@db.jdkrtnrhcyjtmbwtatsc.supabase.co:5432/postgres?sslmode=require"
echo "   - DIRECT_URL: postgresql://postgres:Contabilidad007@db.jdkrtnrhcyjtmbwtatsc.supabase.co:5432/postgres?sslmode=require"
echo "   - NEXTAUTH_SECRET: andre-finances-secret-key-2025"
echo "   - SKIP_AUTH: true"
echo "3. Haz push del código"
echo "4. Ejecuta las migraciones: npx prisma db push"