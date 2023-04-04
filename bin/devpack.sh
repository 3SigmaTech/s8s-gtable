
npm run deploy
npm pack --pack-destination ~/Repos/
echo "Updating package in S8S API Rep"
cd ../s8s-api/
npm update s8s-gtable
echo "Broadcasting javascript file update"
echo "" >> ./public/js/index.ts