ARG JAVA_RUNTIME_IMAGE=eclipse-temurin:27-jre-ubi10-minimal
FROM ${JAVA_RUNTIME_IMAGE}
WORKDIR /app
ARG APP_JAR
COPY --chown=1001:0 ${APP_JAR} /app/app.jar
RUN chmod -R g=u /app
ENV SERVER_PORT=8080
EXPOSE 8080
USER 1001:0
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
