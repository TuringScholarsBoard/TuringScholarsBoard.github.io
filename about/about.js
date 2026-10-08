fetch("/data/board_members.json", { cache: "no-store" })
    .then(response => response.json())
    .then(members => {
        const currentBoard = document.getElementById("current-board");
        const pastBoard = document.getElementById("past-board");

        // parse for each member
        members.forEach((member, index) => {
            const card = document.createElement("div");
            card.className = "boardmember";
            
            // slice to reference grad year and add string
            const grad =  "'" + String(member.graduatingYear).slice(-2);

            // inner card html 
            card.innerHTML = `
                <img src="${member.headshot}" alt="${member.name}">
                <div class="info">
                    <div>
                        <h3 class="name"></h3>
                        <p class="title"></p>
                    </div>
                    <div>
                        <p class="grad"></p>
                        <a class="email"></a>
                    </div>
                </div>
                <p class="description"></p>
            `;
            
            // get data from the json file
            card.querySelector(".name").textContent = member.name;
            card.querySelector(".title").textContent = member.position;
            card.querySelector(".grad").textContent = grad;
            card.querySelector(".email").textContent = member.email;
            //emails need an href to be effective
            card.querySelector(".email").href = "mailto:" + member.email;
            card.querySelector(".description").textContent = member.description;

            //pick the section based on the flag
            card.style.animationDelay = (index * 0.1) + "s";
            if (member.current) {
                currentBoard.appendChild(card);
            } else {
                pastBoard.appendChild(card);
            }
        });
    })
    .catch(error => console.error("Could not load board_members.json:", error));