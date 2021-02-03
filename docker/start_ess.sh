#!/bin/bash

DEFAULT_GATEWAY=`ip route show | grep "default via" | grep -E -o "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]"`

sed -i -e "s#sqlalchemy.url =.*#sqlalchemy.url = $SQLALCHEMY_URL#g" \
       -e "s#pwh.pyramid_session.secret =.*#pwh.pyramid_session.secret = ${SESSION_SECRET}#g" \
       -e "s#app.email.smtp_host =.*#app.email.smtp_host = ${EMAIL_SMTP_HOST}#g" \
       -e "s#app.email.ssl =.*#app.email.ssl = ${EMAIL_SMTP_SSL}#g" \
       -e "s#app.email.username =.*#app.email.username = ${EMAIL_SMTP_USERNAME}#g" \
       -e "s#app.email.password =.*#app.email.password = ${EMAIL_SMTP_PASSWORD}#g" \
       -e "s#app.email.sender =.*#app.email.sender = ${EMAIL_SENDER}#g" \
       -e "s#trusted_proxy =.*#trusted_proxy = ${DEFAULT_GATEWAY}#g" \
       /etc/ess/production.ini

# Setup the database
ess -c /etc/ess/production.ini init-db
while [ $? -ne 0 ]
do
    sleep 10
    ess -c /etc/ess/production.ini init-db
done

# Run the web application
pserve /etc/ess/production.ini
