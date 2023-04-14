const githubUsername = `sergiorodriguezdev`
const githubScreenshotFolder = `README-assets`
const githubReposUrl = `https://api.github.com/users/${githubUsername}/repos`
const githubFolderUrl = `https://api.github.com/repos/${githubUsername}/{repositoryName}/contents/${githubScreenshotFolder}/`
// const whatisthis = `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` // fix this!
const whatisthis = `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`;
const portfolioMetadataUrl = `https://api.github.com/repos/sergiorodriguezdev/portfolio-2.0/contents/assets/portfolio-metadata.json?ref=main`;

var myGhRepos = [];
var portfolioData = [];

var portfolioDataDiv = document.querySelector("#portfolio-data .row");
var projectDetailsModal = document.getElementById("project-details-modal");

// var easterEgg = document.querySelector(".btn.navbar-brand");
// easterEgg.addEventListener("click", (event) => {
//     var htmlEl = document.querySelector("html");
//     console.log(htmlEl.getAttribute("data-bs-theme"))
//     if(htmlEl.getAttribute("data-bs-theme") === "dark") {
//         htmlEl.setAttribute("data-bs-theme", "light");
//     } else {
//         htmlEl.setAttribute("data-bs-theme", "dark");
//     }
// });

// Populate modal
projectDetailsModal.addEventListener("show.bs.modal", (event) => {
    event.stopPropagation();
    
    // relatedTarget = link/button that opened modal
    // find closest card element (div ancestor)
    var card = event.relatedTarget.closest(".card");

    var findProject = function(arr, repoId) {
        return (arr.filter((item) => item.id === repoId))[0]; // This should only return one result
    };

    var project = findProject(portfolioData, parseInt(card.dataset.repoId));
    
    var projectName = document.getElementById("project-name");
    projectName.textContent = project.portfolio_metadata.friendly_name;

    var projectGithubLink = document.getElementById("project-github-link");
    projectGithubLink.setAttribute("href", project.html_url);

    var projectAppLink = document.getElementById("project-app-link");
    projectAppLink.setAttribute("href", project.homepage);

    var screenshotsCollapsibleBtn = document.querySelector(".accordion-button");
    screenshotsCollapsibleBtn.classList.add("collapsed");

    var screenshotCollapsibleBody = document.querySelector(".accordion-collapse");
    screenshotCollapsibleBody.classList.remove("show");

    var projectScreenshotCarousel = document.getElementById("project-screenshot-carousel-inner");

    // delete div child elements from carousel div element
    while(projectScreenshotCarousel.firstChild) projectScreenshotCarousel.removeChild(projectScreenshotCarousel.lastChild);

    if(!project.screenshots || project.screenshots.length === 0) {
        var carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");

        var projectScreenshot = document.createElement("img");
        projectScreenshot.setAttribute("src", "./assets/images/portfolio-placeholder.png");
        projectScreenshot.setAttribute("alt", "portfolio-placeholder");
        projectScreenshot.classList.add("d-block");
        projectScreenshot.classList.add("w-100");

        carouselItem.append(projectScreenshot);

        projectScreenshotCarousel.append(carouselItem);
    } else {
        for (const screenshot of project.screenshots) {
            var carouselItem = document.createElement("div");
            carouselItem.classList.add("carousel-item");

            var projectScreenshot = document.createElement("img");
            projectScreenshot.setAttribute("src", screenshot.download_url);
            projectScreenshot.setAttribute("alt", screenshot.name.replace(".png", ""));
            projectScreenshot.classList.add("d-block");
            projectScreenshot.classList.add("w-100");

            carouselItem.append(projectScreenshot);

            projectScreenshotCarousel.append(carouselItem);
        }
    }

    // set the first carousel item as active (per bootstrap's example)
    projectScreenshotCarousel.firstChild.classList.add("active");

    var carouselPrevBtn = document.querySelector(".carousel-control-prev");
    var carouselNextBtn = document.querySelector(".carousel-control-next");
    
    // hide carousel navigation buttons
    if(projectScreenshotCarousel.children.length > 1) {
        carouselPrevBtn.classList.remove("visually-hidden");
        carouselNextBtn.classList.remove("visually-hidden");
    } else {
        carouselPrevBtn.classList.add("visually-hidden");
        carouselNextBtn.classList.add("visually-hidden");
    }

    var projectDescription = document.getElementById("project-description");
    projectDescription.textContent = project.portfolio_metadata.project_description;

    var projectTopics = document.getElementById("project-topics")

    // delete li child elements from ul element
    while(projectTopics.firstChild) projectTopics.removeChild(projectTopics.lastChild);

    for (const topic of project.topics) {
        var liEl = document.createElement("li");
        liEl.classList.add("list-group-item");
        liEl.textContent = topic;

        projectTopics.append(liEl);
    }
});

function init() {
    getRepoData();

    // portfolioData = JSON.parse(localStorage.getItem("portfolio-data"));

    // can this be improved...?
    var timerIndex = setTimeout(() => {
        // console.log(portfolioData)
        // renderPortfolio();
    }, 2000);
}

async function getRepoData() {

    // Fetch all my GH repos
    myGhRepos = await (fetchGithubData(githubReposUrl));

    // Filter out repos to build portfolio dataset
    portfolioData = myGhRepos.filter((el) => {
        return el.has_pages && el.homepage && el.name !== "portfolio-2.0";
    });
    

    // TO DO: fetch repo metadata (?) - unsure how I'm going to do this...
    var portfolioMetadata = await (fetchGithubData(portfolioMetadataUrl));
    portfolioMetadata = atob(portfolioMetadata.content); //base64
    portfolioMetadata = JSON.parse(portfolioMetadata);
    console.log(portfolioMetadata)
    
    // For each "portfolio-worthy" repo,
    //  fetch screenshots stored in README-assets folder
    for(const item of portfolioData) {
        var screenshotFolderUrl = githubFolderUrl.replace("{repositoryName}", item.name);
        var screenshots = await (fetchGithubData(screenshotFolderUrl));

        if (screenshots !== null) {
            item.screenshots = [];
            for(const screenshot of screenshots) {
                // Only add PNG files found in README-assets folder to portfolio dataset
                if (screenshot.name.match(/\.png$/)) {
                    item.screenshots.push(screenshot);
                }
            }
        }

        // add portfolio metadata to main dataset
        item.portfolio_metadata = portfolioMetadata.projects.filter((element) => element.id === item.id)[0];
    }

    renderPortfolio();
    // localStorage.setItem("portfolio-data", JSON.stringify(portfolioData));
}

function renderPortfolio() {

    var loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.remove();

    for(const item of portfolioData) {

        var col = document.createElement("div");
        col.classList.add("col");
    
        var card = document.createElement("div");
        card.classList.add("card");
        card.classList.add("h-100");
        card.dataset.repoId = item.id;

        var cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardBody.classList.add("text-center");

        var image = document.createElement("img");
        image.style.objectFit = "cover";
        image.classList.add("img-thumbnail");
        image.classList.add("h-100");

        if(item.screenshots) {
            image.setAttribute("src", item.screenshots[0].download_url);
        } else {
            image.setAttribute("src", "./assets/images/portfolio-placeholder.png");
        }

        var modalOverlayLink = document.createElement("a");
        modalOverlayLink.setAttribute("data-bs-toggle", "modal");
        modalOverlayLink.setAttribute("data-bs-target", "#project-details-modal");
        modalOverlayLink.classList.add("modal-link");

        var iconOpenModal = document.createElement("i");
        iconOpenModal.setAttribute("id", "modal-icon");
        iconOpenModal.classList.add("bi");
        iconOpenModal.classList.add("bi-box-arrow-up-right");

        modalOverlayLink.append(iconOpenModal);

        cardBody.append(image);
        cardBody.append(modalOverlayLink);

        var cardFooter = document.createElement("div");
        cardFooter.classList.add("card-footer");
    
        var repoName = document.createElement("small");
        repoName.classList.add("text-body-secondary");
        repoName.textContent = ` ${item.portfolio_metadata.friendly_name}`;

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

        var modalSpan = document.createElement("span");
        modalSpan.setAttribute("data-bs-toggle", "modal");
        modalSpan.setAttribute("data-bs-target", "#project-details-modal");

        modalSpan.append(linkDetails);

        btnGroup.append(linkGitHub);
        btnGroup.append(linkApp);
        btnGroup.append(modalSpan);
    
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
            // cache: "reload",
            headers: {
                "Authorization": "token " + whatisthis,
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