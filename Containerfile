ARG JAVA_RUNTIME_IMAGE=docker.io/library/eclipse-temurin:27-jre-ubi10-minimal
FROM ${JAVA_RUNTIME_IMAGE}
WORKDIR /app
ARG APP_JAR
COPY --chown=1001:0 ${APP_JAR} /app/app.jar
COPY --chown=1001:0 backend/target/classes/fr/intformation/shared/infrastructure/ContainerHealthcheck.class /app/health/fr/intformation/shared/infrastructure/ContainerHealthcheck.class
RUN chmod -R g=u /app
ENV SERVER_PORT=8080
EXPOSE 8080
USER 1001:0
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 CMD ["java", "-cp", "/app/health", "fr.intformation.shared.infrastructure.ContainerHealthcheck"]
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
