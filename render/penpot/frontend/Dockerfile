FROM docker.io/penpotapp/frontend:2.15.3

USER root

RUN mkdir -p /opt/penpot-render/templates \
  && cp /tmp/nginx.conf.template /opt/penpot-render/templates/nginx.conf.template \
  && cp /tmp/resolvers.conf.template /opt/penpot-render/templates/resolvers.conf.template \
  && rm -f /tmp/nginx.conf.template /tmp/resolvers.conf.template

COPY entrypoint-render.sh /opt/penpot-render/entrypoint-render.sh

RUN chmod +x /opt/penpot-render/entrypoint-render.sh \
  && chown -R penpot:penpot /opt/penpot-render

USER penpot:penpot

ENTRYPOINT ["/opt/penpot-render/entrypoint-render.sh"]
CMD ["nginx", "-g", "daemon off;"]
