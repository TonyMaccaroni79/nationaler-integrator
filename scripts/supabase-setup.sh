#!/usr/bin/env bash
# Supabase setup: link project, push schema, run seed.
# Requires: SUPABASE_ACCESS_TOKEN (from https://supabase.com/dashboard/account/tokens)
# Project ref is read from .env VITE_SUPABASE_URL

set -e
cd "$(dirname "$0")/.."

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN is not set."
  echo "Create a token at https://supabase.com/dashboard/account/tokens"
  echo "Then run: export SUPABASE_ACCESS_TOKEN=your_token"
  exit 1
fi

source .env 2>/dev/null || true
PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed -E 's|https://([^.]+).*|\1|')
if [ -z "$PROJECT_REF" ]; then
  echo "Error: Could not extract project ref from VITE_SUPABASE_URL in .env"
  exit 1
fi

echo "Linking project $PROJECT_REF..."
npx supabase link --project-ref "$PROJECT_REF"

echo "Pushing schema..."
npx supabase db push

echo "Running seed..."
npx supabase db query -f supabase/seed.sql --linked

echo "Done. Schema and seed applied."
