# France Geo

Documentation du projet de cartographie géographique de la France, composé d'une API Spring Boot et d'une interface React/Leaflet.

## 1. Objectif du projet

Le projet permet de :

- visualiser les régions, départements et communes de France sur une carte interactive ;
- naviguer dans la hiérarchie géographique depuis les régions jusqu'aux communes ;
- afficher les informations d'une zone sélectionnée (nom, code, population) ;
- importer les données géographiques depuis des sources externes et les stocker dans MongoDB ;
- recalculer les populations agrégées au niveau département et région.

## 2. Vue d'ensemble de l'architecture

Le projet est divisé en deux applications distinctes :

- `france-geo-api` : backend Java/Spring Boot, base MongoDB, file d'import RabbitMQ ;
- `france-geo-ihm/react-ts` : frontend React + TypeScript + Leaflet, interface cartographique.

### Schéma de fonctionnement

1. L'application backend charge les données géographiques depuis des sources publiques (GeoJSON de France et API gouvernementale).
2. Les zones sont stockées en base MongoDB.
3. L'API expose des endpoints pour obtenir les régions, les enfants d'une zone, et l'élément géographique ciblé par un point.
4. Le frontend appelle l'API pour afficher les données sur la carte.
5. L'utilisateur clique sur une zone pour naviguer dans les niveaux hiérarchiques.

## 3. Structure du dépôt

```text
projet-france/
├── README.md
├── france-geo-api/
│   ├── src/
│   ├── docker-compose.yml
│   ├── pom.xml
│   └── mvnw
└── france-geo-ihm/
    └── react-ts/
        ├── src/
        ├── package.json
        └── vite.config.ts
```

## 4. Backend : France Geo API

### 4.1 Technologie

- Java 21
- Spring Boot 3.5
- Spring Web
- Spring Data MongoDB
- RabbitMQ
- WebClient (appels HTTP vers des services externes)
- MongoDB Atlas-like local via Docker

### 4.2 Rôle des composants

- `GeoController` : expose les endpoints HTTP publics.
- `AdminController` : déclenche les imports et le recalcul des populations.
- `GeoImportService` : télécharge les données GeoJSON et les transforme en objets métier.
- `GeoService` : contient la logique métier pour les requêtes sur les zones.
- `GeoAdapters` : implémentation du port secondaire, accès MongoDB.
- `ZoneRepository` : repository MongoDB avec requêtes géospatiales.
- `RabbitMQConfig` : configuration de la queue et de l'échange RabbitMQ.
- `ImportConsumer` : écoute la file d'import et lance les traitements associés.

### 4.3 Modèle métier

Les zones géographiques sont représentées par une entité métier `ZoneGeographique` :

- `code`
- `nom`
- `type` (`REGION`, `DEPARTEMENT`, `COMMUNE`)
- `parentCode`
- `geometrie`
- `population`

Les données géométriques sont stockées comme un objet GeoJSON/Simplified geometry compatible avec MongoDB.

### 4.4 Flux d'import

Les imports se déroulent via RabbitMQ :

- `REGION` : import des régions depuis GitHub GeoJSON ;
- `DEPARTEMENT` : import des départements à partir de l'API gouvernementale ;
- `COMMUNE` : import des communes pour un département donné.

Chaque message est consommé par `ImportConsumer`, puis traité par `GeoImportService`.

### 4.5 Recalcul de population

La méthode `updateAllPopulation()` cumule :

- populations des communes vers le département parent ;
- populations des départements vers la région parent.

## 5. Frontend : IHM React

### 5.1 Technologie

- React 19
- TypeScript
- Vite
- Leaflet + react-leaflet
- Axios

### 5.2 Composants clés

- `FranceMap` : conteneur principal de la carte.
- `MapLayer` : affichage des GeoJSON sur la carte, gestion du clic et du survol.
- `ArianeFil` : navigation hiérarchique de type breadcrumb.
- `ZoneModal` : panneau d'information lié à une commune ou zone sélectionnée.
- `useFranceGeo` : hook central de gestion de la navigation et des appels API.

### 5.3 Navigation UX

Le front-end suit l'architecture suivante :

- niveau courant initial : `REGION` ;
- le clic sur une région charge ses départements ;
- le clic sur un département charge ses communes ;
- le clic sur une commune affiche une modale avec ses détails ;
- l'ariane permet de revenir à un niveau précédent.

## 6. API REST exposée

Base URL backend : `http://localhost:8080`

### 6.1 Endpoints géographiques

#### GET `/zone/find`

Cherche une zone géographique à partir d'un point GPS.

Paramètres :

- `latitude` : latitude du point
- `longitude` : longitude du point

Réponse :

- `200 OK` avec la zone trouvée ;
- `404 Not Found` si aucune zone ne correspond.

#### GET `/zone/regions`

Retourne toutes les régions.

#### GET `/zone/children/{parentCode}`

Retourne les enfants d'un code parent, selon le type attendu.

Paramètres :

- `expectedType` : type attendu (`DEPARTEMENT` pour les départements, `COMMUNE` pour les communes)

### 6.2 Endpoints d'administration

Base URL admin : `http://localhost:8080/api/admin`

#### GET `/api/admin/launch-import`

Déclenche un import selon le type demandé.

Paramètres :

- `type` : `REGION`, `DEPARTEMENT`, `COMMUNE`

#### GET `/api/admin/compute-population`

Calcule les populations agrégées pour les départements et les régions.

## 7. Configuration et environnement

### 7.1 Base de données et message broker

Le fichier `france-geo-api/docker-compose.yml` démarre :

- MongoDB sur `localhost:27018`
- RabbitMQ sur `localhost:5673`
- RabbitMQ management UI sur `localhost:15673`

### 7.2 Configuration Spring

Le fichier `france-geo-api/src/main/resources/application.yaml` configure :

- le nom de l'application ;
- l'URI MongoDB ;
- le host et le port RabbitMQ.

## 8. Démarrage rapide

### 8.1 Prérequis

- Java 21
- Maven ou wrapper Maven (`./mvnw`)
- Node.js + npm
- Docker / Docker Compose

### 8.2 Démarrer les services infrastructure

```bash
cd france-geo-api
docker compose up -d
```

### 8.3 Démarrer l'API

```bash
cd france-geo-api
./mvnw spring-boot:run
```

### 8.4 Démarrer le frontend

```bash
cd france-geo-ihm/react-ts
npm install
npm run dev
```

Puis ouvrir :

- interface : `http://localhost:5173`
- backend API : `http://localhost:8080`

## 9. Points d'attention techniques

- Le frontend appelle directement l'API backend sur `localhost:8080`.
- L'API autorise le CORS pour `http://localhost:5173` dans `GeoController`.
- Les imports externes sont asynchrones via RabbitMQ ; les messages sont traduits en objets Java puis traités par le consommateur.
- Les données sont chargées en direct depuis des sources externes, ce qui rend le projet dépendant de la disponibilité de ces services.

## 10. Problèmes connus / améliorations possibles

- Les `TODO` présents dans le contrôleur indiquent qu'il conviendrait de renvoyer des DTO au lieu d'entités métier directes.
- La logique de navigation côté frontend est fonctionnelle, mais peut être renforcée avec une gestion plus explicite des états d'erreur et de chargement.
- Le système d'import est robuste pour un usage local, mais mérite des protections et une gestion de retry plus avancée pour un environnement production.

## 11. Ressources utiles

- `france-geo-api` : backend Spring Boot
- `france-geo-ihm/react-ts` : interface React/Leaflet
- Data sources GeoJSON :
  - GitHub France GeoJSON ;
  - API Geo Gouv (`geo.api.gouv.fr`).

## 12. Conclusion

Le projet est une application de visualisation territoriale de la France, construite autour d'une architecture backend/frontend claire. Il repose sur des données géographiques réelles et sur une logique de navigation hiérarchique pour parcourir les niveaux administratif de la France.
