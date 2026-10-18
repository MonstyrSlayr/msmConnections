import { Monster, getClasses, getRarities, getMonsters, getElements, getIslands, getActs } from "https://monstyrslayr.github.io/msmTools/monsters.js";

const RARITY = getRarities();
const MCLASS = getClasses();
const islands = getIslands();
const acts = getActs();
const elementSigils = getElements();

export const allConditionals = [];

class Conditional // different from the random monster generator one :)
{
    condition = function() { return false };
    description = "Includes no monsters.";
    id = "";
    label = "";
    inverseLabel = "";
    weight = 0;

    constructor (condition = Function, description = String, id = String, label = String, inverseLabel = String)
    {
        this.condition = condition;
        this.description = description;
        this.id = id;
        this.label = label;
        this.inverseLabel = inverseLabel;
        allConditionals.push(this);
    }

    getMonsterCountMatchingCondition(monsterSet = Array)
    {
        return [...monsterSet].filter((monster) => this.condition(monster)).length;
    }
}

class IslandConditional extends Conditional // i
{
    island;
    weight = 0.09;

    constructor (island)
    {
        super(function (monster = Monster) { return monster.islands.has(island) }, "This monster is on " + island.name.toUpperCase() + ".", "i" + island.codename, "Is on " + island.name.toUpperCase(), "Is not on " + island.name.toUpperCase());
        this.island = island;
    }
}

class AppearancesConditional extends Conditional // p
{
    numAppearances;
    weight = 0.12;

    constructor (numAppearances)
    {
        super(function (monster = Monster) { return monster.islands.size == this.numAppearances }, "This monster is on " + numAppearances + " islands.", "p" + numAppearances, "Is on " + numAppearances + " islands", "Is not on " + numAppearances + " islands");
        this.numAppearances = numAppearances;
    }
}

class ActConditional extends Conditional // a
{
    act;
    weight = 0.15;

    constructor (act)
    {
        super(function (monster = Monster) { return monster.acts.has(act) }, "This monster is in " + act.name.toUpperCase() + ".", "a" + act.name, "Is in " + act.name.toUpperCase(), "Is not in " + act.name.toUpperCase());
        this.act = act;
    }
}

class ElementConditional extends Conditional // e
{
    elementSigil;
    weight = 0.1;

    constructor (elementSigil)
    {
        super(function (monster = Monster) { return monster.elements.has(elementSigil) }, "This monster has the " + elementSigil.name.toUpperCase() + " element.", "e" + elementSigil.name, "Has the " + elementSigil.name.toUpperCase() + " element", "Does not have the " + elementSigil.name.toUpperCase() + " element");
        this.elementSigil = elementSigil;
    }
}

class LikeConditional extends Conditional // l
{
    like;
    weight = 0.6;

    constructor (like)
    {
        super(function (monster = Monster)
        {
            for (const daLike of monster.likes.values())
            {
                if (daLike.name == like)
                {
                    return true;
                }
            }
            return false; 
        }, "This monster likes " + like.toUpperCase() + ".", "l" + like.replace(" ", ""), "Likes " + like.toUpperCase(), "Does not like " + like.toUpperCase());
        this.like = like;
    }
}

class LikedByConditional extends Conditional // b
{
    daMonster;
    weight = 0.6;

    constructor (daMonster)
    {
        super(function (monster = Monster)
        {
            for (const daLike of daMonster.likes.values())
            {
                if (daLike.name == monster.name)
                {
                    return true;
                }
            }
            return false; 
        }, "This monster is liked by " + daMonster.name.toUpperCase() + ".", "b" + daMonster.name.replace(" ", ""), "Liked by " + daMonster.name.toUpperCase(), "Not liked by " + daMonster.name.toUpperCase());
        this.daMonster = daMonster;
    }
}

class EggConditional extends Conditional // g for eGg
{
    egg;
    weight = 0.75;

    constructor (egg)
    {
        super(function (monster = Monster)
        {
            for (const daInv of monster.inventory.values())
            {
                if (daInv.name.replace("Rare ", "").replace("Epic ", "") == egg)
                {
                    return true;
                }
            }
            return false; 
        }, "This monster's inventory requires a " + egg.toUpperCase() + " EGG of any rarity.", "g" + egg, "Inventory requires " + egg.toUpperCase() + " EGG of any rarity", "Inventory does not require " + egg.toUpperCase() + " EGG of any rarity, or does not have egg inventory");
        this.egg = egg;
    }
}

class BedsConditional extends Conditional // 🛏️ (sue me)
{
    beds;
    weight = 0.06;

    constructor(beds)
    {
        super(function (monster = Monster) { return monster.beds == beds; }, "This monster takes up " + beds + " beds in a standard castle.", "🛏️" + beds, "Uses " + beds + " BEDS", "Does not use " + beds + " BEDS")
        this.beds = beds;
    }
}

class LevelConditional extends Conditional // v for leVel
{
    level;
    weight = 0.08;

    constructor(level)
    {
        super(function (monster = Monster) { return monster.levelAvailable == level; }, "This monster becomes available to buy or breed by LEVEL " + level + ".", "v" + level, "Available at LEVEL " + level, "Availability starts at a level other than LEVEL " + level)
        this.level = level;
    }
}

class TimeLimitConditional extends Conditional // t
{
    timeLimit;
    weight = 0.1;

    constructor(timeLimit)
    {
        super(function (monster = Monster) { return monster.timeLimit == timeLimit; }, "This monster's inventory has a time limit of " + timeLimit + " DAYS.", "t" + timeLimit, "Inventory time limit of " + timeLimit + " DAYS", "Time limit other than " + timeLimit + " DAYS, or no time limit")
        this.timeLimit = timeLimit;
    }
}

class FirstDiscoveredConditional extends Conditional // f
{
    firstDiscovered;
    weight = 1;

    constructor(firstDiscovered)
    {
        super(function (monster = Monster) { return monster.firstDiscovered == firstDiscovered; }, "This monster was first discovered by " + firstDiscovered.toUpperCase() + ".", "f" + firstDiscovered, "First discovered by " + firstDiscovered.toUpperCase(), "Not first discovered by " + firstDiscovered)
        this.firstDiscovered = firstDiscovered;
    }
}

class ReleaseYearConditional extends Conditional // y
{
    year;
    weight = 0.7;

    constructor(year)
    {
        super(function (monster = Monster) { return monster.releaseYear == year; }, "This monster was released in " + year + ".", "y" + year, "Released in " + year, "Not released in " + year)
        this.year = year;
    }
}

class LetterCountConditional extends Conditional // r
{
    letterCount;
    weight = 0.1;

    constructor(letterCount)
    {
        super(function (monster = Monster) { return monster.name.length == letterCount; }, "This monster has " + letterCount + " characters in their name.", "r" + letterCount, "Exactly " + letterCount + " CHARACTERS IN NAME (including spaces)", "Not exactly " + letterCount + " CHARACTERS IN NAME (including spaces)")
        this.letterCount = letterCount;
    }
}

class RegexConditional extends Conditional // x
{
    regex;
    weight = 0.1;

    constructor(regex)
    {
        super(function (monster = Monster) { return regex.test(monster.name); }, "This monster's name matches " + regex, "x" + regex, "MATCHES " + regex, "DOES NOT MATCH " + regex)
        this.regex = regex;
    }
}

class DoubleLetterConditional extends RegexConditional // d
{
    regex;
    weight = 0.1;

    constructor(doubleLetter)
    {
        super(doubleLetter);

        this.id = "d" + doubleLetter.source;
        this.description = "This monster has \"" + doubleLetter.source + "\" in their name.";
        this.label = "NAME INCLUDES \"" + doubleLetter.source + "\"";
        this.inverseLabel = "NAME DOES NOT INCLUDE \"" + doubleLetter.source + "\"";
    }
}

class NonAlphaNumericConditional extends RegexConditional // n
{
    regex;
    weight = 0.1;

    constructor(regex, characterName)
    {
        super(regex);

        this.id = "n" + regex.source.replace("\\", "");
        this.description = "This monster has " + characterName + " (" + regex.source.replace("\\", "") + ") in their name.";
        this.label = "NAME INCLUDES " + characterName + " (" + regex.source.replace("\\", "") + ")";
        this.inverseLabel = "NAME DOES NOT INCLUDE " + characterName + " (" +regex.source.replace("\\", "") + ")";
    }
}

class SubsetConditional extends Conditional // s
{
    ids;
    weight = 0.7;

    constructor(ids, subsetName)
    {
        super(function (monster = Monster) { return ids.includes(monster.id) }, "This monster is " + subsetName, "s" + subsetName, subsetName, "NOT " + subsetName)
        this.ids = ids;
    }
}

export const monsters = await getMonsters();
// export const defaultConditional = new Conditional(function (monster = Monster) {return true;}, "This monster is a MONSTER. This monster is a singing monster in My Singing Monsters.", "d", "Is a MONSTER", "Is not a MONSTER");

export function countMonstersInConditionals(monsterGroup, conditionals, inverses)
{
    let num = 0;
    for (const monster of monsterGroup)
    {
        let countMonster = true;
        for (let i = 0; i < conditionals.length; i++)
        {
            const condit = conditionals[i];
            const inverse = inverses[i];
            if ((!inverse && !condit.condition(monster)) || (inverse && condit.condition(monster)))
            {
                countMonster = false;
                break;
            }
        }
        if (countMonster) num++;
    }
    return num;
}

export function getMonstersInConditionals(monsterGroup, conditionals, inverses)
{
    const mons = [];
    for (const monster of monsterGroup)
    {
        let countMonster = true;
        for (let i = 0; i < conditionals.length; i++)
        {
            const condit = conditionals[i];
            const inverse = inverses[i];
            if ((!inverse && !condit.condition(monster)) || (inverse && condit.condition(monster)))
            {
                countMonster = false;
                break;
            }
        }
        if (countMonster) mons.push(monster);
    }
    return mons;
}

export function getConditionalsForMonster(monster, conditionals)
{
    const returnConditionals = [];
    for (const conditional of conditionals)
    {
        if (conditional.condition(monster))
        {
            returnConditionals.push(conditional);
        }
    }
    return returnConditionals;
}

function getMonsterByName(name)
{
    return monsters.find((monster) => name == monster.name);
}

new SubsetConditional(
    monsters.filter(mon => mon.acts.size > 0).map(mon => mon.id), "IN ANY ACT"
);

new SubsetConditional(
    [
        "z09", "bcde", "be", "e", "ace", "gl", "d", "a",
        "bcde_rare", "be_rare", "e_rare", "ace_rare", "gl_rare", "d_rare", "a_rare"
    ],
    "PLAYABLE IN MSM KARAOKE"
);

new SubsetConditional(
    [
        "be", "ae", "ade", "ace", "e", "bcde", "n"
    ],
    "PLAYABLE IN MSM PLAYGROUND"
);

new SubsetConditional(
    [
        ...["gjklm", "i05_maj", "i05_min", "VOC_05", "VOC_06"],
        ...monsters.filter(mon => [MCLASS.SHUGAFAM, MCLASS.BBSQUAD, MCLASS.LEGENDARY].includes(mon.class)).map(mon => mon.id)
    ],
    "COLLABORATION MONSTER"
);

const lowercaseCond = new RegexConditional(/^[a-z]/);
lowercaseCond.id = "xlowercase";
lowercaseCond.description = "This monster's name begins with a lowercase letter.";
lowercaseCond.label = "NAME BEGINS WITH LOWERCASE LETTER";
lowercaseCond.inverseLabel = "NAME DOES NOT BEGIN WITH LOWERCASE LETTER";

const bookendsCond = new RegexConditional(/^(.).*\1$/);
bookendsCond.id = "xbookends";
bookendsCond.description = "This monster's name begins and ends with the same letter.";
bookendsCond.label = "NAME BEGINS AND ENDS WITH SAME LETTER";
bookendsCond.inverseLabel = "NAME DOES NOT BEGIN AND END WITH SAME LETTER";

const fullDoubleLetter = new DoubleLetterConditional(/([a-zA-Z])\1/);
fullDoubleLetter.id = "d";
fullDoubleLetter.description = "This monster has a double letter in their name.";
fullDoubleLetter.label = "NAME CONTAINS DOUBLE LETTER";
fullDoubleLetter.inverseLabel = "NAME DOES NOT CONTAIN DOUBLE LETTER";

for (const doubleLetter of [/aa/, /bb/, /dd/, /ee/, /gg/, /ii/, /ll/, /mm/, /oo/, /rr/, /uu/])
{
    new DoubleLetterConditional(doubleLetter);
}

const fullNonAlpha = new NonAlphaNumericConditional(/[^a-zA-Z0-9 ()]/, "");
fullNonAlpha.id = "n";
fullNonAlpha.description = "This monster has a non-alphanumeric character in their name.";
fullNonAlpha.label = "NAME CONTAINS NON-ALPHANUMERIC CHARACTER";
fullNonAlpha.inverseLabel = "NAME DOES NOT CONTAIN NON-ALPHANUMERIC CHARACTER";

for (const nonAlpha of [[/'/, "APOSTROPHE"], [/\$/, "DOLLAR SIGN"], [/-/, "EN DASH"]])
{
    new NonAlphaNumericConditional(nonAlpha[0], nonAlpha[1]);
}

export const islandConditionals = [];
islands.forEach(island =>
{
    islandConditionals.push(new IslandConditional(island));
});

export const actConditionals = [];
acts.forEach(act =>
{
    actConditionals.push(new ActConditional(act));
});

export const elementConditionals = [];
elementSigils.forEach(elementSigil =>
{
    elementConditionals.push(new ElementConditional(elementSigil));
});

export const appearancesConditionals = [];
export const likeConditionals = [];
export const likedByConditionals = [];
export const eggConditionals = [];
export const bedsConditionals = [];
export const levelConditionals = [];
export const timeConditionals = [];
export const firstConditionals = [];
export const yearConditionals = [];
export const letterCountConditionals = [];

const uniqueAppearances = new Set();
const uniqueCounts = new Set();
const uniqueLikes = new Set();
const uniqueMonsterLikes = new Set();
const uniqueEggs = new Set();
const uniqueReqs = new Set();
const uniqueSizes = new Set();
const uniqueBeds = new Set();
const uniqueLevels = new Set();
const uniqueTimes = new Set();
const uniqueFirsts = new Set();
const uniqueYears = new Set();
const uniqueLetterCounts = new Set();

monsters.forEach(monster =>
{
    uniqueAppearances.add(monster.islands.size);
    uniqueLetterCounts.add(monster.name.length);

    monster.likes.values().forEach(likeObj =>
    {
        uniqueLikes.add(likeObj.name);

        const maybeMonster = getMonsterByName(likeObj.name);

        if (maybeMonster) uniqueMonsterLikes.add(maybeMonster);
    });

    monster.inventory.values().forEach(eggObj =>
    {
        uniqueEggs.add(eggObj.name.replace("Rare ", "").replace("Epic ", ""));
    });

    if (monster.inventory.size > 0)
    {
        uniqueReqs.add(monster);
    }

    uniqueCounts.add(monster.elements.size);
    uniqueSizes.add(monster.size);
    uniqueBeds.add(monster.beds);
    if (monster.releaseYear != 0 && !isNaN(monster.releaseYear)) uniqueYears.add(monster.releaseYear);
    if (!isNaN(monster.levelAvailable)) uniqueLevels.add(monster.levelAvailable);
    if (monster.timeLimit != 0) uniqueTimes.add(monster.timeLimit);
    if (monster.firstDiscovered != "") uniqueFirsts.add(monster.firstDiscovered);
});

uniqueAppearances.values().forEach(numAppearances =>
{
    appearancesConditionals.push(new AppearancesConditional(numAppearances));
});
appearancesConditionals.sort((a, b) => a.numAppearances - b.numAppearances);

uniqueLikes.values().forEach(like =>
{
    likeConditionals.push(new LikeConditional(like));
});
likeConditionals.sort((a, b) => a.like.toLowerCase().localeCompare(b.like.toLowerCase()));

uniqueMonsterLikes.values().forEach(monster =>
{
    likedByConditionals.push(new LikedByConditional(monster));
});
likedByConditionals.sort((a, b) => a.daMonster.name.toLowerCase().localeCompare(b.daMonster.name.toLowerCase()));

uniqueEggs.values().forEach(egg =>
{
    eggConditionals.push(new EggConditional(egg));
});
eggConditionals.sort((a, b) => a.egg.toLowerCase().localeCompare(b.egg.toLowerCase()));

uniqueBeds.values().forEach(beds =>
{
    bedsConditionals.push(new BedsConditional(beds));
});
bedsConditionals.sort((a, b) => a.beds - b.beds);

uniqueLevels.values().forEach(level =>
{
    levelConditionals.push(new LevelConditional(level));
});
levelConditionals.sort((a, b) => a.level - b.level);

uniqueTimes.values().forEach(time =>
{
    timeConditionals.push(new TimeLimitConditional(time));
});
timeConditionals.sort((a, b) => a.timeLimit - b.timeLimit);

uniqueFirsts.values().forEach(first =>
{
    firstConditionals.push(new FirstDiscoveredConditional(first));
});
firstConditionals.sort((a, b) => a.firstDiscovered.toLowerCase().localeCompare(b.firstDiscovered.toLowerCase()));

uniqueYears.values().forEach(year =>
{
    yearConditionals.push(new ReleaseYearConditional(year));
});
yearConditionals.sort((a, b) => a.year - b.year);

uniqueLetterCounts.values().forEach(letterCount =>
{
    letterCountConditionals.push(new LetterCountConditional(letterCount));
});
letterCountConditionals.sort((a, b) => a.letterCount - b.letterCount);

export function getConditionalById(id)
{
    // error handling
    if (id == "rChild") id = "rYoung";
    
    for (const conditional of allConditionals)
    {
        if (conditional.id == id) // YESSSSS!!!!!
        {
            return conditional;
        }
    }
    return null;
}

const secretKey = "whatTheDogDoin";

// Utility: convert string <-> ArrayBuffer
function strToBuf(str)
{
    return new TextEncoder().encode(str);
}

function bufToStr(buf)
{
    return new TextDecoder().decode(buf);
}

// utility: derive a crypto key from a password
async function deriveKey(password)
{
    const enc = strToBuf(password);
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey
    (
        {
            name: "PBKDF2",
            salt: strToBuf("sudoku-salt"), // change salt if you want
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function decryptFile(file)
{
    const key = await deriveKey(secretKey);
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Extract IV (first 12 bytes)
    const iv = bytes.slice(0, 12);
    const encryptedData = bytes.slice(12);

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encryptedData
    );

    const jsonStr = bufToStr(decrypted);
    return JSON.parse(jsonStr);
}

export async function decryptFromURL(url)
{
    const response = await fetch(url);
    const blob = await response.blob();
    return decryptFile(blob);
}
