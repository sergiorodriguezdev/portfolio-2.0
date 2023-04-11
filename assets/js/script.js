const githubUsername = `sergiorodriguezdev`
const githubScreenshotFolder = `README-assets`
const githubReposUrl = `https://api.github.com/users/${githubUsername}/repos`
const githubFolderUrl = `https://api.github.com/repos/${githubUsername}/{repositoryName}/contents/${githubScreenshotFolder}/`
const whatisthis = `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`

var myGhRepos = [];
var portfolioData = [];

var portfolioDataDiv = document.querySelector("#portfolio-data .row");

function init() {
    getRepoData();


}

async function getRepoData() {

    // Fetch all my GH repos
    myGhRepos = await fetchGithubData(githubReposUrl);
    
    // Filter out repos to build portfolio dataset
    portfolioData = myGhRepos.filter((el) => {
        return el.has_pages && el.homepage && el.name !== "portfolio-2.0";
    });
   
    // For each "portfolio-worthy" repo,
    //  fetch screenshots stored in README-assets folder
    for(const item of portfolioData) {
        var screenshotFolderUrl = githubFolderUrl.replace("{repositoryName}", item.name);
        var screenshots = await fetchGithubData(screenshotFolderUrl);

        if (screenshots !== null) {
            item.screenshots = [];
            for(const screenshot of screenshots) {
                // Only add PNG files found in README-assets folder to portfolio dataset
                if (screenshot.name.match(/\.png$/)) {
                    item.screenshots.push(screenshot);
                }
            }
        }

        // TO DO: fetch repo metadata (?) - unsure how I'm going to do this...

        var col = document.createElement("div");
        col.classList.add("col");

        var card = document.createElement("div");
        card.classList.add("card");
        card.classList.add("h-100");

        var cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        var repoName = document.createElement("h1");
        repoName.textContent = item.name;

        var repoUrl = document.createElement("a");
        repoUrl.textContent = "GITHUB";
        repoUrl.setAttribute("href", item.html_url)

        var homepageUrl = document.createElement("a");
        homepageUrl.textContent = "APP";
        homepageUrl.setAttribute("href", item.homepage)

        cardBody.append(repoName);
        cardBody.append(repoUrl);
        cardBody.append(homepageUrl);

        card.append(cardBody);
        col.append(card);

        portfolioDataDiv.append(col);
    }
}

async function fetchGithubData(url) {
    try {
        var response = await fetch(url, {
            cache: "force-cache", // force cache
            headers: {
                "Authorization": "Bearer " + whatisthis, // use token, expires 5/11/23
                "X-GitHub-Api-Version": "2022-11-28"
            }
        });
        if (!response.ok) {return null}
        var data = await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }

    return data;
}

init();