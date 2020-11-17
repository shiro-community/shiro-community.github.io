let data;
// TODO for jamal
let email = "piabocanegra2@gmail.com"; //hardcoded
let personData = [];
let width = 1000;
let height = 700;
let padding = 50;
let numIcons = 6;
let textColor = "#484848";
let greyColor = "#bbbbbb";
let backgroundColor = "#fff8eb";
let iconWidth = 70;

let attitudeList = ["want to", "have to", "both", "neither"];
let categories = ["relationships", "health", "work", "logistical"];
let dashArray2 = ["0.25 7", "5 7", "0.25 7 5 7", "1000"];
let moodList = ["Awful", "Bad", "Ok", "Good", "Amazing"];
let negativeMoods = ["Awful", "Bad"];
let ikigaiGroups = ['zen master', 'bohemian', 'worker', 'profiteer'];

let dashArray = {
    "I want to": "0.25 5",
    "I have to": "5 5",
    "I want to and have to": "0.25 5 5 5",
    "of something else; I neither want to nor have to": "1000"
};
let activityShortToLong = {}; // Configured later using everyoneData.
let attitudeLongtoShort = {
    "I want to": "want to",
    "I have to": "have to",
    "I want to and have to": "both",
    "of something else; I neither want to nor have to": "neither"
};
let attitudeShorttoLong = {
    "want to": "I want to",
    "have to": "I have to",
    "both": "I want to and have to",
    "neither": "of something else; I neither want to nor have to"
};
let colorHexArray = {
    "Awful": "#9f265b",
    "Bad": "#ca614d",
    "Ok": "#edc3a3",
    "Good": "#f2d878",
    "Amazing": "#ffc500",
    "Morning": "#F0B254",
    "Night": "#191760"
};
let categoryShortToLongMap = {
    "work": "Work/School",
    "health": "Health & well-being",
    "relationships": "Relationships",
    "logistical": "Logistical"
};
let balanceLongToShort = {
    "Yes, but I'm trying to be more focused on one aspect of my life": "yes unhappy",
    "No, but I'm trying to be more balanced": "no unhappy",
    "Yes, I'm happy with that": "yes happy",
    "No, but I'm happy with that": "no happy"
}
let balanceShortToLong1 = {
    "yes unhappy": "Yes, but I'm trying",
    "no unhappy": "No, but I'm trying",
    "yes happy": "Yes, I'm happy",
    "no happy": "No, but I'm "
}
let balanceShortToLong2 = {
    "yes unhappy": "to be more focused",
    "no unhappy": "to be more balanced",
    "yes happy": "with it",
    "no happy": "happy with it"
}
let moodToScore = {
    "Awful": 1,
    "Bad": 2,
    "Ok": 3,
    "Good": 4,
    "Amazing": 5
};
let scoreToMood = {
    1: "Awful",
    2: "Bad",
    3: "Ok",
    4: "Good",
    5: "Amazing"
};
let ikigaiKeyToLabel = {
    "worker": "Citizen",
    "bohemian": "Bohemian",
    "zen master": "Zen Master",
    "profiteer": "Profiteer"
};
let ikigaiColorHexArray = {
    "profiteer": "#9f265b",
    "worker": "#ca614d",
    "bohemian": "#edc3a3",
    "zen master": "#f2d878",
};

// morning (5am - 11:59 am), afternoon (12:00pm - 4:59pm), evening (5:00pm - 8:59pm), night (9:00pm - 4:59am).
let timeSegments = {
    morning: {
        title: "Morning",
        start: 0,
        end: 6,
        image: "5am_5pm"
    },
    afternoon: {
        title: "Afternoon",
        start: 7,
        end: 11,
        image: "12pm"
    },
    evening: {
        title: "Evening",
        start: 12,
        end: 15,
        image: "5am_5pm"
    },
    night: {
        title: "Night",
        start: 16,
        end: 23,
        image: "9pm"
    }
};

let keys = {
    personality: {
        shortTermStressor: "Which of the following daily stressors is most significant for you?",
        longTermStressor: "Which of the following long-term stressors is most significant for you?",
        email: "What's your email?",
        happiness: "I am generally happy with my life. ",
    },
    everyone: {
        email: "Email",
        mood: "Feeling",
        attitude: "Reason",
        activity: "Activity"
    },
    ikigai: {
        email: "Email",
        contribution: "Contribution",
        happiness: "Happiness",
        category: "Ikigai ",
        money: "Money",
        passion: "Passion",
        skill: "Skill"
    },
    time: {
        dateTime: "Time of Record (Adjusted to Time Zone)",
        mood: "How are you feeling?",
        morningNight: "Morning/Evening Person",
        attitude: "I was doing this activity because",
        activity: "In the last 10 min, what kind of activity were you doing?",
        email: "Email"
    },
    types: {
        occupation: "Time",
        email: "What's your email?",
        value: "Values",
        personality: "Personality"
    }
};

let occupationLongtoShort = {
    "Working for a company": "Company",
    "Working for my own venture": "Venture",
    "Looking for jobs": "Looking",
    "Studying": "Studying",
    "Caring for family and friends": "Caring",
    "Exploring and enjoying life": "Exploring",
    "Other": "Other"
};
