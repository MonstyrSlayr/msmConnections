import { shuffle, createConnections, GROUPS, MONSTERS_IN_GROUP } from "./createConnections.js";

let mistakes = 0;

let daGame = null;
let freezeInputs = false;

const monsterRectsDiv = document.getElementById("monsterRects");
const submitButton = document.getElementById("submitButton");
const deselectButton = document.getElementById("deselectButton");
const shuffleButton = document.getElementById("shuffleButton");
const restartButton = document.getElementById("restartButton");

const mistakesCounter = document.getElementById("mistakesCounter");

let connectionColors = ["#f9df6d", "#a0c35a", "#b0c4ef", "#ba81c5"];

function loadNewGame()
{
    monsterRectsDiv.innerHTML = "";
    submitButton.classList.add("disabled");
    deselectButton.classList.add("disabled");
    restartButton.classList.add("disabled");

    document.getElementById("success").classList.add("gone");
    document.getElementById("loading").classList.remove("gone");

    mistakes = 0;
    mistakesCounter.textContent = mistakes;

    connectionColors = shuffle(connectionColors);
    daGame = null;

    while (daGame == null || daGame.classDiversityScore < 1)
    {
        daGame = createConnections(false);
    }

    document.getElementById("loading").classList.add("gone");

    for (const mon of shuffle([...daGame.daMonsters]))
    // for (const mon of daGame.daMonsters)
    {
        const myRect = makeMonsterRect(mon);
        monsterRectsDiv.appendChild(myRect);
    }
}

loadNewGame();

function getSelectedMonsterCount()
{
    return daGame.daMonsters.filter(wrapper => wrapper.isSelected).length;
}

function updateGrid(updateFunction, time = 150)
{
    const elements = [...document.querySelectorAll(".monsterRect"), ...document.querySelectorAll(".groupRect")];

    // First: Record the current positions
    const oldPositions = new Map();

    elements.forEach(element =>
    {
        oldPositions.set(element, element.getBoundingClientRect());
    });

    // Apply the changes to the grid
    updateFunction();

    // Last, Invert, Play
    elements.forEach(element =>
    {
        const oldRect = oldPositions.get(element);

        if (!oldRect)
        {
            return;
        }

        const newRect = element.getBoundingClientRect();

        const deltaX = oldRect.left - newRect.left;
        const deltaY = oldRect.top - newRect.top;

        if (deltaX === 0 && deltaY === 0)
        {
            return;
        }

        element.animate(
            [
                {
                    transform: `translate(${deltaX}px, ${deltaY}px)`
                },
                {
                    transform: "translate(0, 0)"
                }
            ],
            {
                duration: time,
                easing: "ease-out"
            }
        );
    });
}

function makeMonsterRect(monWrapper)
{
    const daRect = document.createElement("div");
    daRect.classList.add("monsterRect");
    monWrapper.daRect = daRect;

        const daSquare = document.createElement("img");
        daSquare.src = monWrapper.monster.square;
        daSquare.alt = monWrapper.monster.name + " image";
        daRect.appendChild(daSquare);

        const daName = document.createElement("label");
        daName.textContent = monWrapper.monster.name;
        daRect.appendChild(daName);
    
    daRect.addEventListener("click", () =>
    {
        if (freezeInputs) return;

        monWrapper.isSelected = !monWrapper.isSelected;

        if (monWrapper.isSelected)
        {
            daRect.classList.add("selected");
            monWrapper.isSelected = true;
        }
        else
        {
            daRect.classList.remove("selected");
            monWrapper.isSelected = false;
        }

        const selectedMonsterCount = getSelectedMonsterCount();

        selectedMonsterCount > 0 ? deselectButton.classList.remove("disabled") : deselectButton.classList.add("disabled");
        selectedMonsterCount == MONSTERS_IN_GROUP ? submitButton.classList.remove("disabled") : submitButton.classList.add("disabled");
    });

    return daRect;
}

function makeGroupRect(daCondWrapper, monWrappers)
{
    const daRect = document.createElement("div");
    daRect.classList.add("groupRect");

        const monBalcony = document.createElement("div");
        monBalcony.classList.add("monBalcony");
        daRect.appendChild(monBalcony);

            for (const monWrapper of monWrappers)
            {
                const daSquare = document.createElement("img");
                daSquare.src = monWrapper.monster.square;
                daSquare.alt = monWrapper.monster.name + " image";
                monBalcony.appendChild(daSquare);
            }
        
        const daConditionText = document.createElement("h2");
        daConditionText.textContent = daCondWrapper.conditional.label;
        daRect.appendChild(daConditionText);

    return daRect;
}

submitButton.addEventListener("click", () =>
{
    if (freezeInputs) return;

    const selectedMonsters = daGame.daMonsters.filter(wrapper => wrapper.isSelected).reverse();

    if (selectedMonsters.length == MONSTERS_IN_GROUP)
    {
        const daConditional = selectedMonsters[0].daConditional;

        if (selectedMonsters.every(wrapper => wrapper.daConditional == daConditional))
        {
            freezeInputs = true;

            // 1. move them to the top
            updateGrid(() =>
            {
                for (const wrapper of selectedMonsters)
                {
                    monsterRectsDiv.removeChild(wrapper.daRect);
                    monsterRectsDiv.prepend(wrapper.daRect);
                }
            }, 300);

            // 2. make them do a little jump
            setTimeout(() =>
            {
                let i = MONSTERS_IN_GROUP;
                for (const wrapper of selectedMonsters)
                {
                    const myTime = i * 60;

                    setTimeout(() =>
                    {
                        wrapper.daRect.classList.add("jumpy");
                    }, myTime);

                    i--;
                }
            }, 900);

            // 3. be cool
            setTimeout(() =>
            {
                updateGrid(() =>
                {
                    for (const wrapper of selectedMonsters)
                    {
                        monsterRectsDiv.removeChild(wrapper.daRect);
                        wrapper.isSelected = false;
                    }

                    const daConditionalWrapper = daGame.daConditionals.find(wrapper => wrapper.conditional == daConditional);
                    daConditionalWrapper.isSubmitted = true;

                    const daGroupRect = makeGroupRect(daConditionalWrapper, selectedMonsters);
                    monsterRectsDiv.prepend(daGroupRect);
                    daGroupRect.style.backgroundColor = connectionColors[daGame.daConditionals.filter(wrapper => wrapper.isSubmitted).length - 1];
                });

                submitButton.classList.add("disabled");
                deselectButton.classList.add("disabled");

                freezeInputs = false;

                if (daGame.daConditionals.filter(wrapper => wrapper.isSubmitted).length == GROUPS)
                {
                    document.getElementById("success").classList.remove("gone");
                    restartButton.classList.remove("disabled");
                }
            }, 900 + ((MONSTERS_IN_GROUP + 4) * 60));
        }
        else
        {
            mistakes++;
            mistakesCounter.textContent = mistakes;

            for (const wrapper of selectedMonsters)
            {
                wrapper.daRect.classList.add("wrongy");
                mistakesCounter.classList.add("wrongy");

                setTimeout(() =>
                {
                    wrapper.daRect.classList.remove("wrongy");
                    mistakesCounter.classList.remove("wrongy");
                }, 1500);
            }
        }
    }
    else
    {
        for (const wrapper of selectedMonsters)
        {
            wrapper.daRect.classList.add("wrongy");

            setTimeout(() =>
            {
                wrapper.daRect.classList.remove("wrongy");
            }, 1500);
        }
    }
});

deselectButton.addEventListener("click", () =>
{
    if (freezeInputs) return;

    for (const wrapper of daGame.daMonsters)
    {
        wrapper.isSelected = false;
        wrapper.daRect.classList.remove("selected");
    }

    submitButton.classList.add("disabled");
    deselectButton.classList.add("disabled");
});

shuffleButton.addEventListener("click", () =>
{
    if (freezeInputs) return;

    updateGrid(() =>
    {
        const awesomeRects = [];

        for (const child of monsterRectsDiv.children)
        {
            if (child.classList.contains("monsterRect"))
            {
                awesomeRects.push(child);
                monsterRectsDiv.removeChild(child);
            }
        }

        for (const child of shuffle(awesomeRects))
        {
            monsterRectsDiv.appendChild(child);
        }
    });
});

restartButton.addEventListener("click", () =>
{
    if (daGame.daConditionals.filter(wrapper => wrapper.isSubmitted).length < GROUPS) return;

    loadNewGame();
});
