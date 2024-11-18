# Gestion CRUD pour MongoDB
Ce projet est une application en Node.js permettant de gérer des joueurs, des compétences, et des objets via MongoDB. Elle utilise une architecture CRUD (Create, Read, Update, Delete) pour interagir avec une base de données et offre une interface en ligne de commande intuitive.

## Contenu du dépôt
crud.js : Script principal du projet, contenant la logique des différentes commandes CRUD.
data_comp.json : Exemple de document représentant une compétence dans la base de données.
data_joueur.json : Exemple de document représentant un joueur dans la base de données.
data_objet.json : Exemple de document représentant un objet dans la base de données.
### Fonctionnalités principales
#### Joueurs :
Ajouter, afficher, modifier, et supprimer des joueurs.
Ajouter des objets à l'inventaire des joueurs.
#### Compétences :
Ajouter, afficher, modifier, et supprimer des compétences.
#### Objets :
Ajouter, afficher, modifier, et supprimer des objets.

### Installation et configuration
#### Prérequis: 
Node.js (version ≥ 14.x)
MongoDB (local ou Atlas)

#### Étapes
##### Clonez ce dépôt :
``git clone <URL_DU_DEPOT_GIT>``
``cd <nom_du_repertoire_du_projet>``

##### Installez les dépendances :
``npm install``

##### Configurez la connexion MongoDB dans le fichier crud.js :
``const url = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/GameForge?retryWrites=true&w=majority";``
Remplacez <username> et <password> par vos identifiants MongoDB.

##### Lancez le script :
`` crud.js``

### Liste des commandes
- ``createPlayer`` : Créer un nouveau joueur.
- ``viewPlayers`` : Afficher la liste des joueurs.
- ``updatePlayer`` : Modifier un joueur existant.
- ``deletePlayer`` : Supprimer un joueur.
- ``createCompetence`` : Créer une nouvelle compétence.
- ``viewCompetences`` : Afficher la liste des compétences.
- ``updateCompetence`` : Modifier une compétence existante.
- ``deleteCompetence`` : Supprimer une compétence.
- ``createObject`` : Créer un nouvel objet.
- ``viewObjects`` : Afficher la liste des objets.
- ``updateObject`` : Modifier un objet existant.
- ``deleteObject`` : Supprimer un objet.
- ``addObjectToPlayerInventory`` : Ajouter un objet à l'inventaire d'un joueur.
- ``help`` : Afficher l'aide avec la liste des commandes.
- ``exit`` : Quitter l'application.
