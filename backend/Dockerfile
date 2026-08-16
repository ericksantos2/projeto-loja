FROM maven:3.9-eclipse-temurin-26
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
EXPOSE 8080
CMD ["mvn", "compile", "spring-boot:run", "-Dspring-boot.run.main-class=com.ericksantos2.api_produtos.ApiProdutosApplication"]