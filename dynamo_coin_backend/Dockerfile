# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["dynamo_coin_backend.csproj", "./"]
RUN dotnet restore "dynamo_coin_backend.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "dynamo_coin_backend.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "dynamo_coin_backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Copy published files
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "dynamo_coin_backend.dll"]
