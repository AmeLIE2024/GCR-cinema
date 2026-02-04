/*fetch('/.env')
    .then((response) => response.text())
    .then((response) => response.split("=").pop())
    .then((api_key) => {

    })*/

async function getApiKey(){
    const env = await fetch('./env')
    const apiKeyText = env.text()
    const API_KEY = apiKeyText.split('=').pop()

    return API_KEY;
}
