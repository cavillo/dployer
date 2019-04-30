#!/bin/bash

PLUGIN_API_HOST=${PLUGIN_API_HOST:-"localhost"}
PLUGIN_API_PORT=${PLUGIN_API_PORT:-"8002"}

PLUGIN_API_TOKEN="9f6dbdb1178e8873bdbb11a8a924b9d04d4a61785e9badfba1feb7ca38e6ed60f2d00facb9aa82c932f8e9519ff5e81609598b7f0492ba0a736930e755cbc596"
PLUGIN_APPLICATION="beerpal"
PLUGIN_NAMESPACE="dev"
PLUGIN_DEPLOYMENT="hello-world"
PLUGIN_IMAGE="hello-world"
PLUGIN_PORT_BINDINGS="8002:8003"

echo '--------- DPLOYER DRONE PLUGIN ---------'
echo 'Settings:'
echo "--- PLUGIN_API_HOST           = ${PLUGIN_API_HOST}"
echo "--- PLUGIN_API_PORT           = ${PLUGIN_API_PORT}"
echo "--- PLUGIN_API_TOKEN          = ***SECRET***"
echo "--- PLUGIN_APPLICATION        = ${PLUGIN_APPLICATION}"
echo "--- PLUGIN_NAMESPACE          = ${PLUGIN_NAMESPACE}"
echo "--- PLUGIN_DEPLOYMENT         = ${PLUGIN_DEPLOYMENT}"
echo "--- PLUGIN_IMAGE              = ${PLUGIN_IMAGE}"
echo "--- PLUGIN_PORT_BINDINGS      = ${PLUGIN_PORT_BINDINGS}"

# Verifying settings
# PLUGIN_API_HOST
PLUGIN_API_HOST=$(echo "${PLUGIN_API_HOST}" | sed -e 's|^[^/]*//||' -e 's|/.*$||')
if [ -z "$PLUGIN_API_HOST" ]
then
  echo 'Error: Missing API_HOST...'
  exit 1
fi

# PLUGIN_API_PORT
PLUGIN_API_PORT=${PLUGIN_API_PORT:-"8002"}
if [ -z "$PLUGIN_API_PORT" ]
then
  echo 'Error: Missing API_PORT...'
  exit 1
fi

# PLUGIN_API_TOKEN
if [ -z "$PLUGIN_API_TOKEN" ]
then
  echo 'Error: Missing API_TOKEN...'
  exit 1
fi

# PLUGIN_APPLICATION
if [ -z "$PLUGIN_APPLICATION" ]
then
  echo 'Error: Missing APPLICATION...'
  exit 1
fi

# PLUGIN_NAMESPACE
if [ -z "$PLUGIN_NAMESPACE" ]
then
  echo 'Error: Missing NAMESPACE...'
  exit 1
fi

# PLUGIN_DEPLOYMENT
if [ -z "$PLUGIN_DEPLOYMENT" ]
then
  echo 'Error: Missing DEPLOYMENT...'
  exit 1
fi

# PLUGIN_IMAGE
if [ -z "$PLUGIN_IMAGE" ]
then
  echo 'Error: Missing IMAGE...'
  exit 1
fi

PORT_BINDINGS=""
PORTS=(${PLUGIN_PORT_BINDINGS//;/ })
echo $PORTS
for PORT in "${PORTS[@]}"
do
    IFS=': ' read -r -a PORT <<< "$PLUGIN_PORT_BINDINGS"
    echo "adding $PORT"
    PORT_BINDING="{\"${PORT[0]}\": [\"127.0.0.1\",\"${PORT[1]}\"]}"
    PORT_BINDINGS="${PORT_BINDINGS},${PORT_BINDING}"
done
JSON_PORT_BINDINGS="[${PORT_BINDINGS}]"

JSON_BODY="{\"image\": \"${PLUGIN_IMAGE}\",\"application\": \"${PLUGIN_APPLICATION}\",\"namespace\": \"${PLUGIN_NAMESPACE}\",\"deployment\": \"${PLUGIN_DEPLOYMENT}\", \"portBindings\":[${JSON_PORT_BINDINGS}]}"
URL="http://${PLUGIN_API_HOST}:${PLUGIN_API_PORT}/api/containers"

echo "Dploying..."
echo "|"
echo "|   curl -X POST"
echo "|     -H \"Content-type: application/json\""
echo "|     -H \"Authorization: Bearer *TOKEN*\""
echo "|     -d \"${JSON_BODY}\""
echo "|   ${URL}"
echo "|"

# if curl --fail -X POST -H "Content-type: application/json" -H "Authorization: Bearer ${PLUGIN_API_TOKEN}" -d "${JSON_BODY}" ${URL}; then
#   echo ""
#   echo "Successfully Finish..."
#   exit 0
# else
#   echo ""
#   echo "Failed..."
#   exit 1
# fi;
