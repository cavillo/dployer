# #!/bin/sh

cd client
  npm i --silent
  cd ..

cd api
  npm i --silent
  cd ..

cd drone-plugin
  npm i --silent
  cd ..

echo 'finish installing modules'
