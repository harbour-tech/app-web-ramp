# DEV environment
DEV_BUCKET="harbour-site-dev-snap-e89f141"
DEV_DIST_ID="E2J5FXIGVU5J0B"
# PROD environment
PROD_BUCKET="site-snap-harbour-fi-013e336"
PROD_DIST_ID="E2LTT3YBWEFXKV"
BUGSNAG_API_KEY="e285fb66c0e35636856bf5f0ca605a1c"

.PHONY: app/deploy/dev
app/deploy/dev: app/deps
	npm i && npm run build:staging
	aws s3 sync packages/site/dist/. s3://${DEV_BUCKET} --no-cli-pager --profile harbor
	aws cloudfront create-invalidation --distribution-id ${DEV_DIST_ID} --paths "/*" --no-cli-pager --profile harbor
	@cd packages/site/dist/assets && \
	hash=$$(ls index-*.js | sed -e 's/index-\(.*\)\.js/\1/') && \
	echo "Build hash: $$hash" && \
	fullPath=$$(pwd) && \
	ls -la && \
	npx bugsnag-source-maps upload-browser --api-key ${BUGSNAG_API_KEY} --bundle $$fullPath/index-$$hash.js --source-map $$fullPath/index-$$hash.js.map --bundle-url https://dev-snap.harborapps-nonprod.link/assets/index-$$hash.js --overwrite

# TODO: --mode production
.PHONY: app/deploy/prod
app/deploy/prod: app/deps
	npm i && npm run build
	aws s3 sync packages/site/dist/. s3://${PROD_BUCKET} --no-cli-pager --profile harbor-prod
	aws cloudfront create-invalidation --distribution-id ${PROD_DIST_ID} --paths "/*" --no-cli-pager --profile harbor-prod
	@cd packages/site/dist/assets && \
	hash=$$(ls index-*.js | sed -e 's/index-\(.*\)\.js/\1/') && \
	echo "Build hash: $$hash" && \
	fullPath=$$(pwd) && \
	ls -la && \
	npx bugsnag-source-maps upload-browser --api-key ${BUGSNAG_API_KEY} --bundle $$fullPath/index-$$hash.js --source-map $$fullPath/index-$$hash.js.map --bundle-url https://snap.harbour.fi/assets/index-$$hash.js --overwrite

.PHONY: app/deps
app/deps:
	npm install
