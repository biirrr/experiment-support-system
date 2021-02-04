FROM python:3.8

ARG ESS_USER="ess"
ARG ESS_UID="10000"
ARG ESS_GID="10000"

# Create the user
RUN groupadd --gid $ESS_GID $ESS_USER && \
    useradd --gid $ESS_GID --no-log-init --shell /bin/bash --uid $ESS_UID $ESS_USER

# Install base dependencies
RUN apt-get update && \
    apt-get dist-upgrade -y && \
    apt-get install -y tini

# Copy the application and configuration file
COPY ess-2.0.0a0-py3-none-any.whl /tmp/
COPY production.ini /etc/ess/production.ini

# Install the application
RUN python -m pip install /tmp/ess-2.0.0a0-py3-none-any.whl[postgresql]
COPY start_ess.sh /usr/bin/
RUN chmod a+x /usr/bin/start_ess.sh && \
    mkdir /var/lib/ess && \
    chmod 0755 /var/lib/ess && \
    chown -R ${ESS_USER}:${ESS_USER} /etc/ess && \
    chown -R ${ESS_USER}:${ESS_USER} /var/lib/ess

# Setup the running environment
USER ${ESS_UID}:${ESS_GID}
VOLUME [ "/var/lib/ess" ]
ENV LC_ALL=C
WORKDIR /var/lib/ess
EXPOSE 8080
ENTRYPOINT [ "tini", "--" ]
CMD [ "/usr/bin/start_ess.sh" ]
