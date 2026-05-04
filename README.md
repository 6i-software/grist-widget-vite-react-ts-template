Grist widget Vite react typescript template
===========================================

**Template (boilerplate)** pour créer des widgets pour [Grist](https://getgrist.com/) en utilisant l'écosystème vite + react + typescript.


## Stack technique

| Logiciel / Library       | Technologie | Version |
|:-------------------------| :--- | :--- |
| **Web build tools**      | Vite.js | `8.0.10` |
| **Framework**            | React | `19.2.5` |
| **Programming language** | TypeScript | `6.0.2` |
| **Container**            | Docker | `28.4` |


## Démarrage Rapide

### Développement

1. **Clonez le projet localement**
   ```bash
   git clone
   ```
   
2. **Installer les dépendances du projet** avec le gestionnaire de dépendances  [pnpm](https://pnpm.io/fr/installation)
   ```bash
   pnpm install
   ```

3. Configurez votre widget en modifiant la propriété `grist` du fichier `package.json` à la racine du projet. Cela permet d'inserer le widget en cours de développement dans le catalogue des widgets personnalisé de l'instance Grist.
    ```json
   /** ./package.json **/
    {
      "name": "@badi/grist-widget-title",
      "version": "0.0.1",
      "description": "A Grist widget for ...",
      (...)
      "grist": {
        "name": "Title widget (dev)",
        "url": "http://localhost:5173/index.html",
        "widgetId": "@badi/grist-widget-title",
        "published": true,
        "accessLevel": "none",
        "renderAfterReady": true,
        "description": "Lorem ipsupm dolor sit amet.",
        "isGristLabsMaintained": false,
        "authors": [{"name": "v20100v","url": "https://github.com/v20100v"}]
      }
    }
    ```
   
4. **Lancer l'environnement de développement local de Grist**

   ```bash
   pnpm dev
   ```
   
    Cette commande démarre une instance de Grist depuis un conteneur Docker en local http://localhost:8484, puis le serveur web local de Vite.js qui héberge à la fois le widget en cours de développement sur http://localhost:5173 et le manifest des widgets de Grist sur http://localhost:5173/manifest.json.

   > **Remarque**, si vous préférez isoler les logs, ouvrez deux terminaux (windows powershell) et lancer les commandes suivantes :
   >  - Terminal 1 : `pnpm grist-up ; pnpm grist-logs`
   >  - Terminal 2 : `pnpm vite`


### Build & preview

1. **Lancer l'environnement de preview local de Grist**

   ```bash
   pnpm preview
   ```

   Cette commande démarre le serveur de preview.

## Exemples d'utilisation

- **Lancer le widget en mode développement**  
  ```bash
  pnpm dev
  ```  
  Accédez à `http://localhost:5173` pour voir le widget en action dans Grist.

- **Construire le widget pour la production**  
  ```bash
  pnpm build
  ```  
  Les fichiers compilés sont placés dans le dossier `dist/` et peuvent être déployés.

- **Prévisualiser le widget**  
  ```bash
  pnpm preview
  ```  
  Démarre une instance locale de Grist avec le widget intégré, disponible à `http://localhost:8484`.



