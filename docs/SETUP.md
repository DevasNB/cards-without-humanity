# Setup Guide 🛠️

This guide will help you set up **Cartas Sem Humanidade** on your local machine for development or testing.

---

## Prerequisites

Before starting, make sure you have the following installed:

- [Node.js (v18+)](https://nodejs.org/en/)  
- [npm (v9+)](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/)  
- [Angular CLI (v18.2.12)](https://angular.io/cli)  
- A code editor (recommended: [VS Code](https://code.visualstudio.com/))  

---

## Clone the Repository

```bash
git clone https://github.com/your-username/cartas-contra-tugas.git
cd cartas-contra-tugas
```

## Setup (Database)

You will need the file ```.env```. 

To acquire, please contact the dev team in [README](../README.md) under the **Team** section.

## Setup (Angular)

1. In the root folder, install dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

2. Run the development server:
    ```bash
    ng serve
    ```
    or
    ```bash
    npm run start
    ```

3. Open your browser at http://localhost:4200 to see the app.

   |The app will automatically reload if you change any source file.

## Additional Notes

- To run tests:
    ```bash
    ng test
    ```

- Use **linting** before committing:
    ```bash
    ng lint
    ```