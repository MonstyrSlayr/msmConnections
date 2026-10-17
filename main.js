import { shuffle, createConnections } from "./createConnections.js";

const WRONG_GUESS_COUNT = 4

let daGame = null;

function loadNewGame()
{
    let daGame = null;

    while (daGame == null || daGame.classDiversityScore < 1)
    {
        daGame = createConnections(false);
    }

    return daGame;
}

// daGame = loadNewGame();
daGame = createConnections(false);
console.log(daGame.daConditionals);
console.log(daGame.daMonsters);

function makeMonsterRect(mon)
{
    const daRect = document.createElement("div");
    daRect.classList.add("monsterRect");

        const daCheck = document.createElement("input");
        daCheck.id = mon.id + "checkbox";
        daCheck.type = "checkbox";
        daRect.appendChild(daCheck);

        const daSquare = document.createElement("img");
        daSquare.src = mon.square;
        daSquare.alt = mon.name + " image";
        daRect.appendChild(daSquare);

        const daName = document.createElement("label");
        daName.textContent = mon.name;
        daName.htmlFor = daCheck.id;
        daRect.appendChild(daName);
    
    daRect.addEventListener("click", () =>
    {
        daCheck.checked = !daCheck.checked;

        if (daCheck.checked)
        {
            daRect.classList.add("selected");
        }
        else
        {
            daRect.classList.remove("selected");
        }
    });

    return daRect;
}

const monsterRectsDiv = document.getElementById("monsterRects");

for (const mon of shuffle([...daGame.daMonsters]))
{
    const myRect = makeMonsterRect(mon);
    monsterRectsDiv.appendChild(myRect);
}
