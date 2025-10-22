#!/bin/bash

# Este script te ayudará a subir los archivos a GitHub
# Necesitarás ejecutar estos comandos manualmente en tu terminal local

echo "📦 Preparando archivos para GitHub..."

# Configurar git
git config user.email "andrelahud@gmail.com"
git config user.name "André Lahud"

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Add complete finance app with Supabase integration"

echo ""
echo "✅ Archivos preparados para subir a GitHub"
echo ""
echo "🔑 Para subir los archivos, necesitas autenticarte con GitHub"
echo ""
echo "Opción 1: Usar GitHub CLI (recomendado)"
echo "  gh auth login"
echo "  git push -u origin main"
echo ""
echo "Opción 2: Usar Personal Access Token"
echo "  1. Ve a: https://github.com/settings/tokens"
echo "  2. Crea un nuevo token con permisos 'repo'"
echo "  3. Ejecuta: git remote set-url origin https://TU_TOKEN@github.com/andrelahud-art/andre-financies.git"
echo "  4. Ejecuta: git push -u origin main"
echo ""
