# TITANIC INSIGHT: Etude d'un jeux de donnée de 891 passagers

## Contraintes techniques

- Utilisez Node.js, Express et un moteur de rendu comme pug ou twing. React peut-être également utiliser pour la partie "front".

- Si vous n'avez pas vu Node.js vous pouvez utiliser Symfony pour la partie API et React ou Angular.

- Vous devez également créer une persistance pour les données avec MySQL ou MongoDB avec Mongoose pour Node.js et l'intégrer à l'API ou à l'application.

- Il faudra également mettre en place une page de login pour consulter/lancer la création des statistiques.

## Analyse des données & pages à réalisées

_Vous pouvez utiliser MongoDB, pour analyser les données. Suivez dans ce cas les étapes ci-dessous._

1. Importez les données au format CSV à l'adresse suivante : https://raw.githubusercontent.com/hkacmaz/Titanic-Passenger-Survivors/master/train.csv

Puis tapez la ligne de commande suivante, notez l'option **headerline** qui indique les clés des valeurs du Dataset.

```bash
mongoimport --db titanic --collection passengers --type=csv --headerline --file train.csv --drop
```

2. Créez la page de login, page principale de l'application. Une fois connecté on sera redirigé vers la page pour lancer les analyses statistiques.

3. Créez la page de recherche à proprement parlée, elle comportera un menu principale permettant de se connecter et déconnecter.

```text
Sex : [] Age : [] Classe []
[Analyser]
```

Une fois la recherche effectuée vous redirigerez l'utilisateur vers une page proposant un graphique de votre choix pour expliciter chacun des résultats. Un bouton Reset permettra d'effacer la recherche et de revenir à la page précédente.

```text

Graphique

[Reset]

```

4. Améliorez maintenant l'analyse des données

Introduisez les éléments suivants dans la recherche

- La moyenne

- L'écart type

5. Proposez une autre recherche sur l'analyse de ses données.

## Interpretation des consignes

- Utilisant un jeux de donnée fixes les analyses n'ont pas a être réalisées de façon dynamique ce qui nous obligerait a des calculs intensifs inutiles (dans le cadre d'un jeu de données dynamique une approche par collection d'aggregation serait tout a fait pertinente également)
- Une étape de seed a donc été mis en place pour insérer les données des passagers et effectuer les analyses sur le jeux de donnée.
- Afin d'obtenir un temps de réponse correct les analyses sont stockées directement dans une collection séparée, il ne reste plus qu'a les servir a l'interface via une API minimaliste utilisant Express JS
- L'api est authentifié via un jeton utilisant le standard JWT.
- Seul un utilisateur connecté peut avoir accès aux analyses.
- L'ensemble des paramètres de l'API sont filtrés, dans le but de mitiger une eventuelle injection.
- Le frontend est constitué d'un serveur node séparé servant une application REACT JS.
- Afin d'autoriser l'accès aux ressources distantes sur l'API depuis le frontend (serveur distant), des règles cors ont été mises en place.
- La recherche peut être effectuer au moyen d'une barre de recherche redirigeant l'utilisateur vers la page est la section correspondant a l'analyse souhaitée lors du clique sur un résultat proposé par autocompletion.

## Démarrage rapide (dev only)

### API

0. Installer l'ensemble des dépendances du projet

```bash
npm i
```

1. Configurer les variables d'environnement

- A la racine du projet créer un fichier .env.developement

```bash
touch .env.development
```

- Referencer les paramètres suivants avec vos propres configurations

```
DB_USERNAME=XXXXX
DB_PASSWORD="XXXXXXXXXXXXXXXX"
DB_HOST=127.0.0.1
DB_PORT=27017
DB_NAME=titanic
JWT_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXX"
JWT_ISSUER=titanic
JWT_EXP=86400
SERVER_HOST=127.0.0.1
SERVER_PORT=8000
```

2. Lancer le serveur de developement (HMR actif) pour verifier vos configurations puis le couper

```
npm run dev
```

3. Lancer le script depopulation de la base de donnée

```
npm run seed
```

4. Lancer le serveur de developement (HMR actif)

```
npm run dev
```

### Client - React APP

0. Installer l'ensemble des dépendances du projet

```bash
npm i
```

1. Configurer les variables d'environnement

- A la racine du projet créer un fichier .env

```bash
touch .env
```

- Referencer les paramètres suivants avec vos propres configurations

```
REACT_APP_BASE_URL="http://localhost:8000"
REACT_APP_CURRENT_USER_COOKIE_NAME=token
```

2. Lancer le serveur de developement (HMR actif)

```
npm run start
```
