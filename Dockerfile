FROM danieldent/meteor:1.1.0.2
MAINTAINER Daniel Dent (https://www.danieldent.com/)
COPY . /opt/src
WORKDIR /opt/src
RUN meteor build .. --directory \
    && cd ../bundle/programs/server \
    && npm install \
    && rm -rf /opt/src
WORKDIR /opt/bundle
USER nobody
ENV PORT 3000
CMD ["/usr/local/bin/node", "main.js"]
