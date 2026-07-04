// ==========================
// DOM ELEMENTS
// ==========================

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const loading = document.querySelector(".loading");
const error = document.querySelector(".error");

const avatar = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const username = document.getElementById("username");
const joinDate = document.getElementById("joinDate");
const bio = document.getElementById("bio");

const repos = document.getElementById("repos");
const followers = document.getElementById("followers");
const following = document.getElementById("following");

const locationEl = document.getElementById("location");
const company = document.getElementById("company");

const website = document.getElementById("website");
const twitter = document.getElementById("twitter");

const repoList = document.getElementById("repoList");

const playerOne = document.getElementById("playerOne");
const playerTwo = document.getElementById("playerTwo");

const battleBtn = document.getElementById("battleBtn");

const battleResult = document.getElementById("battleResult");

// ==========================
// EVENT LISTENERS
// ==========================

searchBtn.addEventListener("click", () => {

    const username = searchInput.value.trim();

    if (username !== "") {
        getUser(username);
    }

});

searchInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        searchBtn.click();

    }

});

battleBtn.addEventListener("click", battleUsers);

// ==========================
// FETCH USER
// ==========================

async function getUser(user) {

    loading.classList.remove("hidden");
    error.classList.add("hidden");

    repoList.innerHTML = "";

    try {

        const response = await fetch(
            `https://api.github.com/users/${user}`
        );

        if (!response.ok) {

            throw new Error("User Not Found");

        }

        const data = await response.json();

        displayUser(data);

        getRepositories(data.repos_url);

    }

    catch {

        error.classList.remove("hidden");

    }

    finally {

        loading.classList.add("hidden");

    }

}

// ==========================
// DISPLAY USER
// ==========================

function displayUser(user) {

    avatar.src = user.avatar_url;

    nameEl.textContent = user.name || "No Name";

    username.textContent = "@" + user.login;

    bio.textContent = user.bio || "No Bio Available";

    repos.textContent = user.public_repos;

    followers.textContent = user.followers;

    following.textContent = user.following;

    joinDate.textContent =
        "Joined " + formatDate(user.created_at);

    locationEl.textContent =
        "📍 " + (user.location || "Not Available");

    company.textContent =
        "🏢 " + (user.company || "Not Available");

    if (user.blog) {

        website.href = user.blog;

        website.textContent = "🌐 Portfolio";

    }

    else {

        website.removeAttribute("href");

        website.textContent = "🌐 Not Available";

    }

    if (user.twitter_username) {

        twitter.href =
            `https://twitter.com/${user.twitter_username}`;

        twitter.textContent =
            "@"+user.twitter_username;

    }

    else {

        twitter.removeAttribute("href");

        twitter.textContent = "🐦 Not Available";

    }

}

// ==========================
// FETCH REPOSITORIES
// ==========================

async function getRepositories(url) {

    try {

        const response = await fetch(url);

        const repositories = await response.json();

        const latestFive = repositories
            .sort((a,b)=>

                new Date(b.created_at)-new Date(a.created_at)

            )
            .slice(0,5);

        repoList.innerHTML = "";

        latestFive.forEach(repo=>{

            const li = document.createElement("li");

            const link = document.createElement("a");

            link.href = repo.html_url;

            link.target="_blank";

            link.textContent = repo.name;

            li.appendChild(link);

            repoList.appendChild(li);

        });

    }

    catch(err){

        console.log(err);

    }

}

// ==========================
// DATE FORMATTER
// ==========================

function formatDate(date){

    const options={

        day:"numeric",

        month:"short",

        year:"numeric"

    };

    return new Date(date).toLocaleDateString(
        "en-GB",
        options
    );

}

// ==========================
// DEFAULT USER
// ==========================

getUser("octocat");

async function battleUsers(){

    const userOne = playerOne.value.trim();

    const userTwo = playerTwo.value.trim();

    if(!userOne || !userTwo){

        alert("Enter both usernames");

        return;

    }

    try{

        const [user1,user2] = await Promise.all([

            fetch(`https://api.github.com/users/${userOne}`).then(res=>res.json()),

            fetch(`https://api.github.com/users/${userTwo}`).then(res=>res.json())

        ]);

        const [repos1,repos2] = await Promise.all([

            fetch(user1.repos_url).then(res=>res.json()),

            fetch(user2.repos_url).then(res=>res.json())

        ]);

        const stars1 = repos1.reduce(

            (total,repo)=>total+repo.stargazers_count,

            0

        );

        const stars2 = repos2.reduce(

            (total,repo)=>total+repo.stargazers_count,

            0

        );

        displayBattle(user1,user2,stars1,stars2);

    }

    catch{

        battleResult.innerHTML="<h2>User Not Found</h2>";

    }

}

function displayBattle(user1,user2,stars1,stars2){

    let winner;
    let loser;

    if(stars1>=stars2){

        winner=user1;
        loser=user2;

    }

    else{

        winner=user2;
        loser=user1;

    }

    battleResult.innerHTML=`

        <div class="profile-card">

            <div>

                <h2 class="winner">
                    🏆 Winner
                </h2>

                <p>${winner.login}</p>

            </div>

            <div>

                <h2 class="loser">
                    ❌ Loser
                </h2>

                <p>${loser.login}</p>

            </div>

        </div>

    `;

}