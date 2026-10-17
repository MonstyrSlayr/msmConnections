import { allConditionals, countMonstersInConditionals, getConditionalsForMonster, getMonstersInConditionals, monsters } from "./script.js";

// NON-CONS: CLASS, RARITY, ELEMENT COUNT, REQUIRED BY, SIZE

// FIX: minor inflatterer on lux lumens, epic wubbox release years

const GROUPS = 4;
const MONSTERS_IN_GROUP = 4;
const SPECIFICITY_CURVE = (x) => { return x * x * x };

class ConditionalWrapper
{
    conditional;
    specificity;
    monCount;

    constructor(conditional, specificity)
    {
        this.conditional = conditional;
        this.specificity = specificity;
        this.monCount = [];
    }
}

class ConnectionsGame
{
    daMonsters;
    daConditionals;
    classDiversityScore;

    constructor(daConditionals, daMonsters)
    {
        this.daConditionals = daConditionals;
        this.daMonsters = daMonsters;
        this.classDiversityScore = this.calculateClassDiversityScore();
    }

    calculateClassDiversityScore()
    {
        const TYPE = 2;
        const monsterClasses = {};

        for (const mon of this.daMonsters)
        {
            const monClass = mon.class;

            if (Object.hasOwn(monsterClasses, monClass))
            {
                monsterClasses[monClass]++;
            }
            else
            {
                monsterClasses[monClass] = 1;
            }
        }

        let curScore = 1;

        // TYPE 0
        // subtracts from 1 for every monster with a duplicate class after the first monster of that class
        // 0: all monsters are the same class, 1: all monsters are different classes
        if (TYPE == 0)
        {
            Object.keys(monsterClasses).forEach(mclass =>
            {
                if (monsterClasses[mclass] > 1)
                {
                    curScore -= ((monsterClasses[mclass] - 1)/(this.daMonsters.length - 1));
                }
            });
        }

        // TYPE 1
        // class duplicates are counted, only punish if duplicates == 4
        // 0: 4 groups of 4, 1: no groups of 4
        else if (TYPE == 1)
        {
            Object.keys(monsterClasses).forEach(mclass =>
            {
                if (monsterClasses[mclass] == MONSTERS_IN_GROUP)
                {
                    curScore -= 1/GROUPS;
                }
            });
        }

        // TYPE 2
        // similar to type 1, but only subtracts if every monster in a group is the same class
        // 0: 4 groups of 4, 1: no groups of 4
        else if (TYPE == 2)
        {
            for (let i = 0; i < GROUPS; i++)
            {
                const subMonsters = this.daMonsters.slice(i * GROUPS, (i + 1) * GROUPS);
                if (subMonsters.every(mon => mon.class == subMonsters[0].class))
                {
                    curScore -= 1/GROUPS;
                }
            }
        }

        return curScore;
    }
}

export function shuffle(array)
{
    for (let i = array.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function createConnections(debug = false)
{
    const connectionsGroups = [];
    const connectionsMonsters = [];

    let jonsters = [...monsters];
    let allConditionalWrappers = [];

    for (const conditional of allConditionals)
    {
        const myCount = countMonstersInConditionals(monsters, [conditional], [false]);
        if (myCount < MONSTERS_IN_GROUP) continue;

        const myWrapper = new ConditionalWrapper(conditional, myCount / monsters.length);
        allConditionalWrappers.push(myWrapper);
    }

    allConditionalWrappers.sort((a, b) => a.specificity - b.specificity);
    let wrappersMemento = [...allConditionalWrappers];
    let jonstersMemento = [...jonsters];

    for (let i = 0; i < GROUPS; i++)
    {
        if (debug) console.log("current length of wrappers: " + allConditionalWrappers.length);
        
        if (allConditionalWrappers.length == 0) // dead end
        {
            const deadConditional = connectionsGroups.pop();
            for (let j = 0; j < MONSTERS_IN_GROUP; j++)
            {
                connectionsMonsters.pop();
            }

            if (debug) console.log("dead end at " + i + ", removing " + deadConditional.label);
            i--;

            allConditionalWrappers = wrappersMemento.filter(wrap => wrap.conditional != deadConditional);
            jonsters = [...jonstersMemento];

            for (const wr of allConditionalWrappers)
            {
                wr.monCount.pop();
            }
        }

        wrappersMemento = [...allConditionalWrappers];
        jonstersMemento = [...jonsters];

        if (allConditionalWrappers.length == 0)
        {
            if (debug) console.log("failure");
            return createConnections(debug);
        }

        // choose conditionals based on quadrants of specificity
        // const thingyMin = SPECIFICITY_CURVE(i / GROUPS) * allConditionalWrappers.length;
        const thingyMin = 0;
        const thingyMax = (SPECIFICITY_CURVE((i + 1) / GROUPS) * allConditionalWrappers.length) - 1;
        const thingy = Math.floor(Math.random() * (thingyMax - thingyMin) + thingyMin);
        const myWrapper = allConditionalWrappers[thingy];

        connectionsGroups.push(myWrapper.conditional);
        if (debug) console.log(myWrapper.conditional.label + " -----------------------");

        for (const wr of allConditionalWrappers)
        {
            wr.monCount.push(0);
        }

        for (let j = 0; j < MONSTERS_IN_GROUP; j++)
        {
            const conditionalFulfillingMonsters = jonsters.filter(mon => myWrapper.conditional.condition(mon));
            const daJonster = conditionalFulfillingMonsters[Math.floor(Math.random() * conditionalFulfillingMonsters.length)];
            connectionsMonsters.push(daJonster);
            if (debug) console.log(daJonster.name);

            // get all conditionals, except the one we're being cool about
            const myConditionals = getConditionalsForMonster(daJonster, allConditionalWrappers.filter(wrap => wrap != myWrapper).map(wrap => wrap.conditional));

            for (const cond of myConditionals)
            {
                const daWrapper = allConditionalWrappers.find(wrap => wrap.conditional == cond);

                daWrapper.monCount[daWrapper.monCount.length - 1]++;

                // remove conditional wrappers that get to 3 monsters (so we don't make accidental groups)
                let daSum = 0;

                for (const num of daWrapper.monCount)
                {
                    daSum += num;
                }

                if (daSum >= MONSTERS_IN_GROUP - 1)
                {
                    const daIndex = allConditionalWrappers.indexOf(daWrapper);
                    allConditionalWrappers.splice(daIndex, 1);

                    // remove all monsters who meet the conditional, and don't meet our special conditional
                    const illegalMonsters = getMonstersInConditionals(jonsters, [daWrapper.conditional], [false]);

                    const ogLength = jonsters.length;
                    jonsters = jonsters.filter(mon => !illegalMonsters.includes(mon) || conditionalFulfillingMonsters.includes(mon));
                    if (debug) console.log("removed " + (ogLength - jonsters.length) + " monsters from " + daWrapper.conditional.label);
                }
            }

            jonsters = jonsters.filter(mon => mon != daJonster);
        }

        allConditionalWrappers = allConditionalWrappers.filter(wrap => wrap != myWrapper);
        const ogLength = jonsters.length;
        jonsters = jonsters.filter(mon => !myWrapper.conditional.condition(mon));
        if (debug) console.log("removed " + (ogLength - jonsters.length) + " monsters from " + myWrapper.conditional.label);

        // filter out if purged monsters happened to invalidate the conditional
        allConditionalWrappers = allConditionalWrappers.filter(wrap => countMonstersInConditionals(jonsters, [wrap.conditional], [false]) >= MONSTERS_IN_GROUP);
    }

    return new ConnectionsGame(connectionsGroups, connectionsMonsters);
}

// let daGame = null;

// while (daGame == null || daGame.classDiversityScore < 1)
// {
//     daGame = createConnections(false);
// }

// console.log(daGame.daConditionals);
// console.log(daGame.daMonsters);
// console.log(shuffle([...daGame.daMonsters]));
// console.log(daGame.classDiversityScore);
