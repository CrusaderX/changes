npm run build
git add .
git commit -m "build"
git push --delete origin v4
git tag --delete v4
git tag v4
git push --tags
