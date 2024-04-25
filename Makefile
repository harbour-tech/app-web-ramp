# DEV environment
DEV_BUCKET="harbour-site-dev-snap-e89f141"
DEV_DIST_ID="E2J5FXIGVU5J0B"
# PROD environment
PROD_BUCKET="site-snap-harbour-fi-013e336"
PROD_DIST_ID="E2LTT3YBWEFXKV"


.PHONY: app/deploy/dev
app/deploy/dev:
	npm i --workspace=packages/site && npm run build --workspace=packages/site
	aws s3 sync packages/site/dist/. s3://${DEV_BUCKET} --no-cli-pager --profile harbor
	aws cloudfront create-invalidation --distribution-id ${DEV_DIST_ID} --paths "/*" --no-cli-pager --profile harbor

# TODO: --mode production
.PHONY: app/deploy/prod
app/deploy/prod:
	npm i --workspace=packages/site && npm run build --workspace=packages/site
	aws s3 sync packages/site/dist/. s3://${PROD_BUCKET} --no-cli-pager --profile harbor-prod
	aws cloudfront create-invalidation --distribution-id ${PROD_DIST_ID} --paths "/*" --no-cli-pager --profile harbor-prod
