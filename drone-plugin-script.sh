#!/bin/sh

PLUGIN_API_HOST="localhost"
PLUGIN_API_PORT="8002"
PLUGIN_API_TOKEN="38512221696296b6c9cfbd4a05344c4c5e82d35d736b8dbd1b70008e7c72ae35dac3b29db8bc1c065a53addd41a8f328cf52adf8feea3cdae1f86a45297182a4"
PLUGIN_APPLICATION="beerpal"
PLUGIN_NAMESPACE="dev"
PLUGIN_DEPLOYMENT="client-web"
PLUGIN_IMAGE="gcr.io/beerpal/service-api:dev-latest"

# PLUGIN_API_HOST
PLUGIN_API_HOST=${PLUGIN_API_HOST:-"localhost"}
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

curl -S -s --fail -X POST -H "Content-type: application/json" -H "Authorization: Bearer ${PLUGIN_API_TOKEN}" -d "${JSON_BODY}" ${URL}

echo ""
echo "Successfully Finish..."
exit 0

