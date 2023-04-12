const githubUsername = `sergiorodriguezdev`
const githubScreenshotFolder = `README-assets`
const githubReposUrl = `https://api.github.com/users/${githubUsername}/repos`
const githubFolderUrl = `https://api.github.com/repos/${githubUsername}/{repositoryName}/contents/${githubScreenshotFolder}/`
const whatisthis = `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` // fix this!

var myGhRepos = [];
var portfolioData = [];

var portfolioDataDiv = document.querySelector("#portfolio-data .row");

function init() {
    // getRepoData();

    portfolioData = JSON.parse(localStorage.getItem("portfolio-data"));
    renderPortfolio();
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

    }

    localStorage.setItem("portfolio-data", JSON.stringify(portfolioData));
}

function renderPortfolio() {

    for(const item of portfolioData) {

        var col = document.createElement("div");
        col.classList.add("col");
    
        var card = document.createElement("div");
        card.classList.add("card");
        card.classList.add("h-100");

        var image = document.createElement("img");
        image.style.objectFit = "cover";
        // image.style.opacity = "0.7";
        image.classList.add("img-thumbnail");
        image.classList.add("h-100");

        if(item.screenshots) {
            image.setAttribute("src", item.screenshots[0].download_url);
        } else {
            image.setAttribute("src", "./assets/images/portfolio-placeholder.png");
        }

        var cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardBody.classList.add("text-center");

        cardBody.append(image);

        var cardFooter = document.createElement("div");
        cardFooter.classList.add("card-footer");
    
        var repoName = document.createElement("small");
        repoName.classList.add("text-body-secondary");
        repoName.textContent = ` ${item.name}`;

        var btnGroup = document.createElement("div");
        btnGroup.classList.add("btn-group");
        btnGroup.classList.add("float-end");

        var linkGitHub = document.createElement("a");
        linkGitHub.setAttribute("href", item.html_url);
        linkGitHub.setAttribute("target", "_blank");
        linkGitHub.setAttribute("data-bs-toggle", "tooltip");
        linkGitHub.setAttribute("data-bs-title", "Go to GitHub Repo");
        linkGitHub.classList.add("btn");
        linkGitHub.classList.add("btn-outline-secondary");
        linkGitHub.classList.add("border");
        linkGitHub.classList.add("border-0");

        var iconGitHub = document.createElement("i");
        iconGitHub.classList.add("bi");
        iconGitHub.classList.add("bi-github");

        var linkApp = document.createElement("a");
        linkApp.setAttribute("href", item.homepage);
        linkApp.setAttribute("target", "_blank");
        linkApp.setAttribute("data-bs-toggle", "tooltip");
        linkApp.setAttribute("data-bs-title", "Launch App");
        linkApp.classList.add("btn");
        linkApp.classList.add("btn-outline-secondary");
        linkApp.classList.add("border");
        linkApp.classList.add("border-0");

        var iconRocketLaunch = document.createElement("i");
        iconRocketLaunch.classList.add("bi");
        iconRocketLaunch.classList.add("bi-rocket-takeoff-fill");

        var linkDetails = document.createElement("a");
        linkDetails.setAttribute("href", "");
        linkDetails.setAttribute("target", "_blank");
        linkDetails.setAttribute("data-bs-toggle", "tooltip");
        linkDetails.setAttribute("data-bs-title", "View Project Details");
        linkDetails.classList.add("btn");
        linkDetails.classList.add("btn-outline-secondary");
        linkDetails.classList.add("border");
        linkDetails.classList.add("border-0");

        var iconOpenModal = document.createElement("i");
        iconOpenModal.classList.add("bi");
        iconOpenModal.classList.add("bi-box-arrow-up-right");

        linkGitHub.append(iconGitHub);
        linkApp.append(iconRocketLaunch);
        linkDetails.append(iconOpenModal);

        btnGroup.append(linkGitHub);
        btnGroup.append(linkApp);
        btnGroup.append(linkDetails);
    
        cardFooter.append(repoName);
        cardFooter.append(document.createElement("br"));
        cardFooter.append(btnGroup);
    
        card.append(cardBody);
        card.append(cardFooter);
        col.append(card);
    
        portfolioDataDiv.append(col);
    }
}

async function fetchGithubData(url) {
    try {
        var response = await fetch(url, {
            cache: "force-cache", // force cache
            headers: {
                "Authorization": "Bearer " + whatisthis,
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

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))