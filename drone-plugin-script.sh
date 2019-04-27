#!/bin/sh

PLUGIN_API_HOST=${PLUGIN_API_HOST:-"localhost"}
PLUGIN_API_PORT=${PLUGIN_API_PORT:-"8002"}

# PLUGIN_API_TOKEN="123"
# PLUGIN_APPLICATION="dployer"
# PLUGIN_NAMESPACE="sandbox"
# PLUGIN_DEPLOYMENT="hello-world"
# PLUGIN_IMAGE="hello-world"

echo '--------- DPLOYER DRONE PLUGIN ---------'
echo 'Settings:'
echo "--- PLUGIN_API_HOST    = ${PLUGIN_API_HOST}"
echo "--- PLUGIN_API_PORT    = ${PLUGIN_API_PORT}"
echo "--- PLUGIN_API_TOKEN   = ${PLUGIN_API_TOKEN}"
echo "--- PLUGIN_APPLICATION = ${PLUGIN_APPLICATION}"
echo "--- PLUGIN_NAMESPACE   = ${PLUGIN_NAMESPACE}"
echo "--- PLUGIN_DEPLOYMENT  = ${PLUGIN_DEPLOYMENT}"
echo "--- PLUGIN_IMAGE       = ${PLUGIN_IMAGE}"

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

JSON_BODY="{\"image\": \"${PLUGIN_IMAGE}\",\"application\": \"${PLUGIN_APPLICATION}\",\"namespace\": \"${PLUGIN_NAMESPACE}\",\"deployment\": \"${PLUGIN_DEPLOYMENT}\"}"
URL="http://${PLUGIN_API_HOST}:${PLUGIN_API_PORT}/api/containers"

echo "Dploying..."
echo "|"
echo "|   curl -X POST"
echo "|     -H \"Content-type: application/json\""
echo "|     -H \"Authorization: Bearer *TOKEN*\""
echo "|     -d \"${JSON_BODY}\""
echo "|   ${URL}"
echo "|"

if curl --fail -X POST -H "Content-type: application/json" -H "Authorization: Bearer ${PLUGIN_API_TOKEN}" -d "${JSON_BODY}" ${URL}; then
  echo ""
  echo "Successfully Finish..."
  exit 0
else
  echo ""
  echo "Failed..."
  exit 1
fi;

