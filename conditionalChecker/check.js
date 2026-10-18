import { getConditionalById, getMonstersInConditionals, monsters } from "../script.js";

const conditionalLabel = document.getElementById("conditionalLabel");
const daInput = document.getElementById("idInput");
const monsterRects = document.getElementById("monsterRects");

function makeMonsterRect(monster)
{
    const daRect = document.createElement("div");
    daRect.classList.add("monsterRect");

        const daSquare = document.createElement("img");
        daSquare.src = monster.square;
        daSquare.alt = monster.name + " image";
        daRect.appendChild(daSquare);

        const daName = document.createElement("label");
        daName.textContent = monster.name;
        daRect.appendChild(daName);

    return daRect;
}

daInput.value = "";

daInput.addEventListener("input", () =>
{
    conditionalLabel.textContent = "No conditional is connected.";
    monsterRects.innerHTML = "";

    const daConditional = getConditionalById(daInput.value);

    if (daConditional)
    {
        const daMonsters = getMonstersInConditionals(monsters, [daConditional], [false]);

        conditionalLabel.textContent = daMonsters.length + " monsters " + daConditional.label;

        for (const mon of daMonsters)
        {
            const daRect = makeMonsterRect(mon);
            monsterRects.appendChild(daRect);
        }
    }
})
