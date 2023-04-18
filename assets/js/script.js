const githubUsername = `sergiorodriguezdev`
const githubScreenshotFolder = `README-assets`
const githubReposUrl = `https://api.github.com/users/${githubUsername}/repos`
const githubFolderUrl = `https://api.github.com/repos/${githubUsername}/{repositoryName}/contents/${githubScreenshotFolder}/`
const portfolioMetadataUrl = `https://api.github.com/repos/sergiorodriguezdev/portfolio-2.0/contents/assets/portfolio-metadata/portfolio-metadata.json?ref=main`;

var myGhRepos = [];
var portfolioData = [];
var portfolioInfo = {};
var aboutMe = {};

var aboutMeDescription = document.getElementById("about-me-description");
var portfolioDataDiv = document.querySelector("#portfolio-data .row");
var projectDetailsModal = document.getElementById("project-details-modal");
var portfolioInfoDescription = document.getElementById("portfolio-description");
var portfolioInfoUpcoming = document.getElementById("portfolio-upcoming");

var screenshotThumbs = document.querySelectorAll(".screenshot-thumbnail");
var screenshotLarge = document.getElementById("screenshot-large");


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

    populateProjectModal(parseInt(card.dataset.repoId));
});

function init() {
    getRepoData();

    // portfolioData = JSON.parse(localStorage.getItem("portfolio-data"));
    // portfolioInfo = JSON.parse(localStorage.getItem("portfolio-info"));
    // aboutMe = JSON.parse(localStorage.getItem("portfolio-about-me"));

    // renderAboutMe();
    // renderPortfolio();
    // renderPortfolioInfo();
}

async function getRepoData() {

    // Fetch all my GH repos
    myGhRepos = await (fetchGithubData(githubReposUrl));
    console.log(myGhRepos)

    // Filter out repos to build portfolio dataset
    portfolioData = myGhRepos.filter((el) => {
        return el.has_pages && el.homepage && el.name !== "portfolio-2.0";
    });
    

    // fetch repo metadata JSON file
    var portfolioMetadata = await (fetchGithubData(portfolioMetadataUrl));
    portfolioMetadata = atob(portfolioMetadata.content); // Convert from base64
    portfolioMetadata = JSON.parse(portfolioMetadata);
    console.log(portfolioMetadata)

    // add portfolio metadata to main dataset
    aboutMe = portfolioMetadata.about_me;
    portfolioInfo = portfolioMetadata.portfolio_v2_info;
    console.log(portfolioInfo)
    
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

    renderAboutMe();
    renderPortfolio();
    renderPortfolioInfo();
    // localStorage.setItem("portfolio-data", JSON.stringify(portfolioData));
    // localStorage.setItem("portfolio-info", JSON.stringify(portfolioInfo));
    // localStorage.setItem("portfolio-about-me", JSON.stringify(aboutMe));
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

function renderAboutMe() {
    aboutMeDescription.innerText = aboutMe.description; // used innerText to support new line chars coming from JSON
}

function renderPortfolioInfo() {
    portfolioInfoDescription.innerText = portfolioInfo.project_description; // used innerText to support new line chars coming from JSON

    for (const item of portfolioInfo.upcoming_features) {
        var liEl = document.createElement("li");
        liEl.classList.add("list-group-item");
        liEl.textContent = item;

        portfolioInfoUpcoming.append(liEl);
    }
}

function populateProjectModal(projectId) {
    var findProject = function(arr, repoId) {
        return (arr.filter((item) => item.id === repoId))[0]; // This should only return one result
    };

    var project = findProject(portfolioData, projectId);
    
    var projectName = document.getElementById("project-name");
    projectName.textContent = project.portfolio_metadata.friendly_name;

    var projectGithubLink = document.getElementById("project-github-link");
    projectGithubLink.setAttribute("href", project.html_url);

    var projectAppLink = document.getElementById("project-app-link");
    projectAppLink.setAttribute("href", project.homepage);

    // var screenshotsCollapsibleBtn = document.querySelector(".accordion-button");
    // screenshotsCollapsibleBtn.classList.add("collapsed");

    // var screenshotCollapsibleBody = document.querySelector(".accordion-collapse");
    // screenshotCollapsibleBody.classList.remove("show");

    var projectScreenshotCarousel = document.getElementById("project-screenshot-carousel-inner");
    var carouselIndicator = document.getElementById("screenshot-indicators");

    // delete div child elements from carousel div element
    while(projectScreenshotCarousel.firstChild) projectScreenshotCarousel.removeChild(projectScreenshotCarousel.lastChild);

    while(carouselIndicator.firstChild) carouselIndicator.removeChild(carouselIndicator.lastChild);


    if(!project.screenshots || project.screenshots.length === 0) {
        var carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");


        var projectScreenshot = document.createElement("img");
        projectScreenshot.setAttribute("src", "./assets/images/portfolio-placeholder.png");
        projectScreenshot.setAttribute("alt", "portfolio-placeholder");
        // projectScreenshot.classList.add("d-block");
        // projectScreenshot.classList.add("w-100");
        // projectScreenshot.classList.add("img-fluid");

        carouselItem.append(projectScreenshot);

        projectScreenshotCarousel.append(carouselItem);
    } else {
        var carouselNavArr = [];
        var i;
        
        for(i = 0; i < Math.ceil(project.screenshots.length / 4); i++) {
            var carouselItem = document.createElement("div");
            carouselItem.classList.add("carousel-item");

            var carouselNav = document.createElement("div");

            carouselNav.classList.add("row");
            carouselNav.classList.add("row-cols-2");
            carouselNav.classList.add("row-cols-lg-4");
            carouselNav.classList.add("justify-content-evenly");
            carouselNav.classList.add("g-3");

            carouselItem.append(carouselNav);
            projectScreenshotCarousel.append(carouselItem);

            carouselNavArr.push(carouselNav);

            var indicator = document.createElement("button");
            indicator.setAttribute("type", "button");
            indicator.setAttribute("data-bs-target", "#projects-screenshot-carousel");
            indicator.setAttribute("data-bs-slide-to", i);
            indicator.classList.add("bg-light");

            carouselIndicator.append(indicator);

            if (i === 0) {
                carouselItem.classList.add("active");
                indicator.classList.add("active");
            }
        }

        // console.log(carouselNavArr[0].children)

        i = 0;

        // for (const screenshot of project.screenshots) {
        for (var j = 0; j < project.screenshots.length; j++) {
            // var carouselItem = document.createElement("div");
            // carouselItem.classList.add("carousel-item");

            var projectScreenshot = document.createElement("img");

            projectScreenshot.setAttribute("src", project.screenshots[j].download_url);
            projectScreenshot.setAttribute("alt", project.screenshots[j].name.replace(".png", ""));
            projectScreenshot.classList.add("screenshot-thumbnail");
            // projectScreenshot.classList.add("w-100");
            // projectScreenshot.classList.add("img-fluid");
            projectScreenshot.addEventListener("click", setScreenshotLarge);

            carouselNavArr[Math.floor(j / 4)].append(projectScreenshot);

            if (j === 0) {
                screenshotLarge.setAttribute("src", project.screenshots[j].download_url);
            }
        }
    }

    // set the first carousel item as active (per bootstrap's example)
    // projectScreenshotCarousel.firstChild.classList.add("active");

    var carouselPrevBtn = document.getElementById("previous-button");
    var carouselNextBtn = document.getElementById("next-button");
    
    
    // hide carousel navigation buttons
    if(project.screenshots && project.screenshots.length > 4) {
        carouselPrevBtn.classList.remove("visually-hidden");
        carouselNextBtn.classList.remove("visually-hidden");
        carouselIndicator.classList.remove("visually-hidden");

    } else {
        carouselPrevBtn.classList.add("visually-hidden");
        carouselNextBtn.classList.add("visually-hidden");
        carouselIndicator.classList.add("visually-hidden");
    }
    if(project.screenshots && project.screenshots.length > 0) {
        screenshotLarge.closest(".card").classList.remove("visually-hidden");
        
    } else {
        screenshotLarge.closest(".card").classList.add("visually-hidden");


    }

    var projectDescription = document.getElementById("project-description");
    projectDescription.innerText = project.portfolio_metadata.project_description; // used innerText to support new line chars coming from JSON

    var projectTopics = document.getElementById("project-topics");

    // delete li child elements from ul element
    while(projectTopics.firstChild) projectTopics.removeChild(projectTopics.lastChild);

    for (const topic of project.topics) {
        var spanEl = document.createElement("span");
        spanEl.classList.add("badge");
        spanEl.classList.add("rounded-pill");
        spanEl.classList.add("text-bg-primary");
        spanEl.classList.add("text-wrap");
        spanEl.textContent = topic;

        projectTopics.append(spanEl);
        projectTopics.append("\n"); // have to add a line break for pills to be spaced horizontally
    }
}

function setScreenshotLarge(event) {
    event.preventDefault();

    var imgUrl = event.target.getAttribute("src");
    screenshotLarge.setAttribute("src", imgUrl);
}

async function fetchGithubData(url) {
    try {
        var response = await fetch(url, {
            // cache: "force-cache",
            headers: {
                "Authorization": "Bearer " + atob("Z2hwX2lNajhMNWdKVDhja2JOQ3pQck5OYmNtdkFKVllpZjRHSGVYMA=="),
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

function loadBootstrap() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

}

init();
loadBootstrap();