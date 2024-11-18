const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const readline = require("readline");

// URL de connexion MongoDB Atlas
const url = "mongodb+srv://pseudo:mot_de_passe@cluster/nom_bdd?retryWrites=true&w=majority&tls=true";
const dbName = "GameForge";  // Nom de la base de données
let db;
let client;  // Déclare le client pour pouvoir fermer la connexion plus tard

// Créer une interface readline pour interagir avec l'utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function connect() {
  client = new MongoClient(url);
  await client.connect();
  db = client.db(dbName);
  console.log("Connecté à MongoDB !");
}

// --- CREATE : Ajouter un joueur ---
async function createPlayer() {
  const pseudo = await askQuestion("Entrez le pseudo du joueur : ");
  const classe = await askQuestion("Entrez la classe du joueur : ");
  const niveau = await askQuestion("Entrez le niveau du joueur : ");
  
  const competences = await askQuestion("Entrez les IDs des compétences (séparés par des virgules) : ");
  const inventaire = [];  // L'inventaire reste vide à la création
  
  const player = {
    player_id: uuidv4(),  // Génère un UUID pour le joueur
    pseudo,
    classe,
    niveau: parseInt(niveau),
    competences: competences.split(","), //separer les ids par "," sans espace
    inventaire,
    date_connexion: new Date()
  };

  const result = await db.collection("profil_joueur").insertOne(player);
  console.log(`Joueur ${pseudo} créé avec succès !`);
}

// --- READ : Afficher tous les joueurs ---
async function viewPlayers() {
    const playersCollection = db.collection("profil_joueur");
    const players = await playersCollection.find().toArray();
  
    console.log("Liste des joueurs :");
    for (let player of players) {
      const competences = await getCompetences(player.competences);
      const inventaire = await formatInventory(player.inventaire);  // Utilisation de la nouvelle fonction pour formater l'inventaire
      
      console.log(`\nID: ${player.player_id} - Pseudo: ${player.pseudo}, Classe: ${player.classe}, Niveau: ${player.niveau}`);
      console.log(`Compétences: ${competences.join(", ")}`);
      console.log(`Inventaire: ${inventaire}`);
      console.log(`Date de dernière connexion: ${player.date_connexion}`);
    }
  }
  
  // Fonction pour formater l'inventaire avec les quantités des objets
  async function formatInventory(inventory) {
    // Récupère les objets de l'inventaire
    const objectsCollection = db.collection("objet");
    const objectDetails = await objectsCollection.find({ _id: { $in: inventory } }).toArray();
  
    // Compter les occurrences des objets
    const objectCount = {};
    inventory.forEach((objId) => {
      if (objectCount[objId]) {
        objectCount[objId]++;
      } else {
        objectCount[objId] = 1;
      }
    });
  
    // Crée un tableau avec le nom et la quantité de chaque objet
    const inventoryString = objectDetails.map((object) => {
      const count = objectCount[object._id];
      return `${object.nom} x${count}`;
    }).join(", ");
  
    return inventoryString;
  }
  

// --- UPDATE : Modifier un joueur ---
async function updatePlayer() {
  const playerId = await askQuestion("Entrez l'ID du joueur à modifier : ");
  
  const player = await db.collection("profil_joueur").findOne({ player_id: playerId });
  if (!player) {
    console.log("Joueur non trouvé !");
    return;
  }

  console.log(`Joueur trouvé : ${player.pseudo} (Classe: ${player.classe}, Niveau: ${player.niveau})`);
  
  const pseudo = await askQuestion(`Modifier le pseudo (actuel: ${player.pseudo}): `) || player.pseudo;
  const classe = await askQuestion(`Modifier la classe (actuel: ${player.classe}): `) || player.classe;
  const niveau = await askQuestion(`Modifier le niveau (actuel: ${player.niveau}): `) || player.niveau;
  const competences = await askQuestion(`Modifier les compétences (actuel: ${player.competences.join(", ")}): `) || player.competences.join(", ");
  
  const updatedPlayer = {
    pseudo,
    classe,
    niveau: parseInt(niveau),
    competences: competences.split(","),
    date_connexion: new Date()
  };

  const result = await db.collection("profil_joueur").updateOne({ player_id: playerId }, { $set: updatedPlayer });
  if (result.modifiedCount > 0) {
    console.log(`Joueur ${player.pseudo} mis à jour avec succès.`);
  } else {
    console.log("Aucune modification apportée.");
  }
}

// --- DELETE : Supprimer un joueur ---
async function deletePlayer() {
  const playerId = await askQuestion("Entrez l'ID du joueur à supprimer : ");
  
  const player = await db.collection("profil_joueur").findOne({ player_id: playerId });
  if (!player) {
    console.log("Joueur non trouvé !");
    return;
  }

  const result = await db.collection("profil_joueur").deleteOne({ player_id: playerId });
  if (result.deletedCount > 0) {
    console.log(`Joueur ${player.pseudo} supprimé avec succès.`);
  } else {
    console.log("Erreur lors de la suppression.");
  }
}


// --- CREATE : Ajouter une compétence ---
async function createCompetence() {
  const nom = await askQuestion("Entrez le nom de la compétence : ");
  const description = await askQuestion("Entrez la description de la compétence : ");
  const niveau_max = await askQuestion("Entrez le niveau maximum de la compétence : ");
  const classe_requise = await askQuestion("Entrez la classe requise pour cette compétence : ");

  const newCompetence = {
    _id: uuidv4(),
    nom,
    description,
    niveau_max: parseInt(niveau_max),
    classe_requise
  };

  const result = await db.collection("competence").insertOne(newCompetence);
  console.log(`Compétence ${newCompetence.nom} créée avec succès !`);
}

// --- READ : Afficher toutes les compétences ---
async function viewCompetences() {
  const competencesCollection = db.collection("competence");
  const competences = await competencesCollection.find().toArray();

  console.log("Liste des compétences :");
  competences.forEach((competence) => {
    console.log(`\nID: ${competence._id}`);
    console.log(`Nom: ${competence.nom}`);
    console.log(`Description: ${competence.description}`);
    console.log(`Niveau max: ${competence.niveau_max}`);
    console.log(`Classe requise: ${competence.classe_requise}`);
    });
}

// Fonction pour obtenir les informations des compétences à partir de leurs IDs
async function getCompetences(competencesIds) {
    const competencesCollection = db.collection("competence");
    const competences = await competencesCollection.find({ _id: { $in: competencesIds } }).toArray();
    return competences.map(comp => comp.nom);  // Récupère le nom des compétences
  }

// --- UPDATE : Modifier une compétence ---
async function updateCompetence() {
  const compId = await askQuestion("Entrez l'ID de la compétence à modifier : ");
  
  const competence = await db.collection("competence").findOne({ _id: compId });
  if (!competence) {
    console.log("Compétence non trouvée !");
    return;
  }

  console.log(`Compétence trouvée : ${competence.nom}`);
  
  const nom = await askQuestion(`Modifier le nom (actuel: ${competence.nom}): `) || competence.nom;
  const description = await askQuestion(`Modifier la description (actuel: ${competence.description}): `) || competence.description;
  const niveau_max = await askQuestion(`Modifier le niveau max (actuel: ${competence.niveau_max}): `) || competence.niveau_max;
  const classe_requise = await askQuestion(`Modifier la classe requise (actuel: ${competence.classe_requise}): `) || competence.classe_requise;

  const updatedCompetence = {
    nom,
    description,
    niveau_max: parseInt(niveau_max),
    classe_requise
  };

  const result = await db.collection("competence").updateOne({ _id: compId }, { $set: updatedCompetence });
  if (result.modifiedCount > 0) {
    console.log(`Compétence ${competence.nom} mise à jour avec succès.`);
  } else {
    console.log("Aucune modification apportée.");
  }
}

// --- DELETE : Supprimer une compétence ---
async function deleteCompetence() {
  const compId = await askQuestion("Entrez l'ID de la compétence à supprimer : ");
  
  const competence = await db.collection("competence").findOne({ _id: compId });
  if (!competence) {
    console.log("Compétence non trouvée !");
    return;
  }

  const result = await db.collection("competence").deleteOne({ _id: compId });
  if (result.deletedCount > 0) {
    console.log(`Compétence ${competence.nom} supprimée avec succès.`);
  } else {
    console.log("Erreur lors de la suppression.");
  }
}

// --- CREATE : Ajouter un objet ---
async function createObject() {
  const nom = await askQuestion("Entrez le nom de l'objet : ");
  const description = await askQuestion("Entrez la description de l'objet : ");
  const type = await askQuestion("Entrez le type de l'objet (arme, potion, etc.) : ");
  const rarete = await askQuestion("Entrez la rareté de l'objet (commun, rare, épique) : ");
  const valeur = await askQuestion("Entrez la valeur de l'objet : ");

  const newObject = {
    _id: uuidv4(),  // Génère un UUID pour l'objet
    nom,
    description,
    type,
    rarete,
    valeur: parseInt(valeur)
  };

  const result = await db.collection("objet").insertOne(newObject);
  console.log(`Objet ${newObject.nom} créé avec succès !`);
}

// --- READ : Afficher tous les objets ---
async function viewObjects() {
  const objectsCollection = db.collection("objet");
  const objects = await objectsCollection.find().toArray();

  console.log("Liste des objets :");
  objects.forEach((object) => {
    console.log(`\nID: ${object._id}`);
    console.log(`Nom: ${object.nom}`);
    console.log(`Type: ${object.type}`);
    console.log(`Rareté: ${object.rarete}`);
    console.log(`Valeur: ${object.valeur}`);
    console.log(`Description: ${object.description}`);
  });
}

// --- UPDATE : Modifier un objet ---
async function updateObject() {
  const objectId = await askQuestion("Entrez l'ID de l'objet à modifier : ");
  
  const object = await db.collection("objet").findOne({ _id: objectId });
  if (!object) {
    console.log("Objet non trouvé !");
    return;
  }

  console.log(`Objet trouvé : ${object.nom} (Type: ${object.type}, Rareté: ${object.rarete}, Valeur: ${object.valeur})`);
  
  const nom = await askQuestion(`Modifier le nom (actuel: ${object.nom}): `) || object.nom;
  const description = await askQuestion(`Modifier la description (actuel: ${object.description}): `) || object.description;
  const type = await askQuestion(`Modifier le type (actuel: ${object.type}): `) || object.type;
  const rarete = await askQuestion(`Modifier la rareté (actuel: ${object.rarete}): `) || object.rarete;
  const valeur = await askQuestion(`Modifier la valeur (actuel: ${object.valeur}): `) || object.valeur;

  const updatedObject = {
    nom,
    description,
    type,
    rarete,
    valeur: parseInt(valeur)
  };

  const result = await db.collection("objet").updateOne({ _id: objectId }, { $set: updatedObject });
  if (result.modifiedCount > 0) {
    console.log(`Objet ${object.nom} mis à jour avec succès.`);
  } else {
    console.log("Aucune modification apportée.");
  }
}

// --- DELETE : Supprimer un objet ---
async function deleteObject() {
  const objectId = await askQuestion("Entrez l'ID de l'objet à supprimer : ");
  
  const object = await db.collection("objet").findOne({ _id: objectId });
  if (!object) {
    console.log("Objet non trouvé !");
    return;
  }

  const result = await db.collection("objet").deleteOne({ _id: objectId });
  if (result.deletedCount > 0) {
    console.log(`Objet ${object.nom} supprimé avec succès.`);
  } else {
    console.log("Erreur lors de la suppression.");
  }
}


// --- ADD OBJECT TO PLAYER INVENTORY : Ajouter un objet à l'inventaire d'un joueur ---
async function addObjectToPlayerInventory() {
    const playerId = await askQuestion("Entrez l'ID du joueur auquel ajouter l'objet : ");
    
    // Cherche le joueur dans la base de données
    const player = await db.collection("profil_joueur").findOne({ player_id: playerId });
    if (!player) {
      console.log("Joueur non trouvé !");
      return;
    }
  
    console.log(`Joueur trouvé : ${player.pseudo} (Classe: ${player.classe}, Niveau: ${player.niveau})`);
    
    const objectId = await askQuestion("Entrez l'ID de l'objet à ajouter à l'inventaire : ");
    
    // Cherche l'objet dans la base de données
    const object = await db.collection("objet").findOne({ _id: objectId });
    if (!object) {
      console.log("Objet non trouvé !");
      return;
    }
  
    console.log(`Objet trouvé : ${object.nom} (Type: ${object.type}, Rareté: ${object.rarete}, Valeur: ${object.valeur})`);
  
    // Ajoute l'objet à l'inventaire du joueur
    const updatedInventory = [...player.inventaire, objectId];
    
    const updatedPlayer = {
      ...player,
      inventaire: updatedInventory
    };
  
    // Mets à jour le joueur avec l'objet ajouté
    const result = await db.collection("profil_joueur").updateOne({ player_id: playerId }, { $set: updatedPlayer });
    if (result.modifiedCount > 0) {
      console.log(`L'objet ${object.nom} a été ajouté à l'inventaire du joueur ${player.pseudo} avec succès.`);
    } else {
      console.log("Aucune modification apportée.");
    }
    promptCommand();
  }
  
  

// --- HELP : Liste les commandes disponibles ---
function displayHelp() {
  console.log(`
Commandes disponibles :
- createPlayer : Créer un nouveau joueur
- viewPlayers  : Afficher tous les joueurs et leurs détails
- updatePlayer : Mettre à jour un joueur existant
- deletePlayer : Supprimer un joueur existant

- createCompetence : Créer une nouvelle compétence
- viewCompetences  : Afficher toutes les compétences
- updateCompetence : Mettre à jour une compétence existante
- deleteCompetence : Supprimer une compétence existante

- createObject : Créer un nouvel objet
- viewObjects  : Afficher tous les objets
- updateObject : Mettre à jour un objet existant
- deleteObject : Supprimer un objet existant

- addObjectToPlayerInventory : Ajouter un objet à l'inventaire d'un joueur

- help : Afficher cette liste de commandes
- exit : Fermer la connexion à MongoDB et quitter l'application
  `);
}

// Fonction pour demander une entrée à l'utilisateur
function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Fonction de gestion des commandes de l'utilisateur
function promptCommand() {
    rl.question("Entrez une commande: ", async (cmd) => {
      try {
        switch (cmd) {
          case "createPlayer":
            await createPlayer();
            break;
          case "viewPlayers":
            await viewPlayers();
            break;
          case "updatePlayer":
            await updatePlayer();
            break;
          case "deletePlayer":
            await deletePlayer();
            break;
          case "createCompetence":
            await createCompetence();
            break;
          case "viewCompetences":
            await viewCompetences();
            break;
          case "updateCompetence":
            await updateCompetence();
            break;
          case "deleteCompetence":
            await deleteCompetence();
            break;
          case "createObject":
            await createObject();
            break;
          case "viewObjects":
            await viewObjects();
            break;
          case "updateObject":
            await updateObject();
            break;
          case "deleteObject":
            await deleteObject();
            break;
          case "help":
            displayHelp();
            break;
          case "addObjectToPlayerInventory":
            await addObjectToPlayerInventory();
            break;
          case "exit":
            console.log("Fermeture de la session...");
            await client.close();
            rl.close();
            console.log("Connexion fermée.");
            return; // Sortir de la fonction pour éviter de réappeler promptCommand
          default:
            console.log("Commande inconnue. Tapez 'help' pour la liste des commandes.");
        }
  
        // Rappeler la commande après l'exécution de la commande
        promptCommand();
      } catch (error) {
        console.error("Erreur lors de l'exécution de la commande:", error);
        promptCommand();
      }
    });
  }
  

async function start() {
  await connect();
  promptCommand();
}

start().catch(console.error);