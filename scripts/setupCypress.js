const path = require("path");
const loadJson = require("load-json-file");
const writeJson = require("write-json-file");
const fs = require("fs");
const { green } = require("chalk");
const getState = require("./getState");

const PROJECT_FOLDER = ".";

(async () => {
    const cypressExampleConfigPath = path.resolve(PROJECT_FOLDER, "example.cypress.json");
    const cypressConfigPath = path.resolve(PROJECT_FOLDER, "cypress.json");
    if (fs.existsSync(cypressConfigPath)) {
        console.log(`⚠️  ${green("cypress.json")} already exists, skipping.`);
        return;
    } else {
        fs.copyFileSync(cypressExampleConfigPath, cypressConfigPath);
    }

    const cypressConfig = await loadJson.sync(cypressConfigPath);

    const apiStateFile = getState("api");
    const appsStateFile = getState("apps");

    cypressConfig.baseUrl = appsStateFile.outputs.cdn.url + "/admin";
    cypressConfig.env.SITE_URL = appsStateFile.outputs.cdn.url;
    cypressConfig.env.ADMIN_URL = appsStateFile.outputs.cdn.url + "/admin";
    cypressConfig.env.API_URL = apiStateFile.outputs.cdn.url;
    cypressConfig.env.GRAPHQL_API_URL = apiStateFile.outputs.cdn.url + "/graphql";

    cypressConfig.env.AWS_COGNITO_USER_POOL_ID = apiStateFile.outputs.cognito.userPool.Id;
    cypressConfig.env.AWS_COGNITO_CLIENT_ID = apiStateFile.outputs.cognito.appClients[0].ClientId;

    await writeJson(cypressConfigPath, cypressConfig);

    console.log(
        `✅️ Created cypress.json config file! To open Cypress, just run "cypress open" in your terminal.`
    );

    console.log("ℹ️ Created config:");
    console.log(JSON.stringify(cypressConfig, null, 4));
})();