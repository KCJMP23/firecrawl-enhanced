#!/bin/bash

files=(
  "app/api/collaboration/auth/route.ts"
  "app/api/design-dna/extract/route.ts"
  "app/api/deploy/route.ts"
  "app/api/health/route.ts"
  "app/api/pdf/query/route.ts"
  "app/api/pdf/[id]/route.ts"
  "app/api/pdf/upload/route.ts"
  "app/api/usage/analytics/route.ts"
  "app/api/clone/route.ts"
  "app/api/errors/route.ts"
  "app/api/export/route.ts"
  "app/api/credits/balance/route.ts"
  "app/api/credits/purchase/route.ts"
  "app/api/animations/extract/route.ts"
  "app/api/stripe/webhook/route.ts"
  "app/api/stripe/portal/route.ts"
  "app/api/stripe/checkout/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    sed -i '' 's/const supabase = createClient()/const supabase = await createClient()/g' "$file"
    echo "Fixed $file"
  fi
done