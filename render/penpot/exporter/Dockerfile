FROM docker.io/penpotapp/exporter:2.15.3

USER root

COPY entrypoint-render.sh /opt/penpot-render/entrypoint-render.sh

RUN chmod +x /opt/penpot-render/entrypoint-render.sh \
  && chown -R penpot:penpot /opt/penpot-render

USER penpot:penpot

EXPOSE 10000

ENTRYPOINT ["/opt/penpot-render/entrypoint-render.sh"]
