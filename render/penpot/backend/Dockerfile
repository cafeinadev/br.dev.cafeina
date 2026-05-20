FROM docker.io/penpotapp/backend:2.15.3

USER root

COPY entrypoint-render.sh proxy.js /opt/penpot-render/

RUN chmod +x /opt/penpot-render/entrypoint-render.sh \
  && chown -R penpot:penpot /opt/penpot-render

USER penpot:penpot

EXPOSE 10000

ENTRYPOINT ["/opt/penpot-render/entrypoint-render.sh"]
