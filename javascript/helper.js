// Helper functions for data manipulation.

/** 
 *   data: list of data entries
 *   email: email of user
 *   returns list of all data entries for a person
 */
function getPersonData(data, email) {
    return data.filter(d => {
        return d.Email == email
    });
}

/** 
 *   personData: list of data entries
 *   activity: activity to filter by
 *   returns list of personData entries by activity
 */
function getPersonDataByActivity(personData, activity) {
    return personData.filter(d => d.Activity.substring(0, 2) == activity);
}

function getPersonDataByActivityType(personData, type) {
    return personData.filter(d => d.Activity.substring(0, 1) == type);
}

function getPersonDataByActivities(personData, list) {
    return personData.filter(d => list.includes(d.Activity.substring(0, 2)));
}

function getPersonDataByActivitiesAndMood(personData, actList, moodList) {
    return personData.filter(d => actList.includes(d.Activity.substring(0, 2)))
        .filter(d => moodList.includes(d.Feeling));
}

function getDataByPTypePData(everyoneData, typesData, pData, pType, column, cValue) {
    // list of ppl with personality type
    let filteredList = typesData
        .filter(d => d.Personality == pType)
        .map(d => d["What's your email?"]);

    let filteredEmailList = pData.filter(d => d[column] == cValue)
                                    .map(d => d["What's your email?"])
                                    .filter(d => filteredList.includes(d));
    let everyoneList = pData.filter(d => d[column] == cValue).map(d => d["What's your email?"]);

    let data1 = everyoneData.filter(d => filteredEmailList.includes(d.Email));
    let data2 = everyoneData.filter(d => everyoneList.includes(d.Email));

    return [{
        "percent": filteredEmailList.length/filteredList.length, 
        "fMood": getFrequencyByKey("Feeling", data1).keys().next().value, 
        "fAttitude": getFrequencyByKey("Reason", data1).keys().next().value
    }, 
    {
        "percent": everyoneList.length/typesData.length,
        "fMood": getFrequencyByKey("Feeling", data2).keys().next().value, 
        "fAttitude": getFrequencyByKey("Reason", data2).keys().next().value
    }];
}

function getDataByPTypeValue(everyoneData, typesData, pType, value) {
    let filteredList = typesData
        .filter(d => d.Personality == pType);

    let filteredListWithValue = filteredList.filter(d => d.Values == value).map(d => d["What's your email?"]);
    let everyoneListWithValue = typesData.filter(d => d.Values == value).map(d => d["What's your email?"]);

    let data1 = everyoneData.filter(d => filteredListWithValue.includes(d.Email));
    let data2 = everyoneData.filter(d => everyoneListWithValue.includes(d.Email));

    return [{
        "percent": filteredListWithValue.length/filteredList.length, 
        "fMood": getFrequencyByKey("Feeling", data1).keys().next().value, 
        "fAttitude": getFrequencyByKey("Reason", data1).keys().next().value
    }, 
    {
        "percent": everyoneListWithValue.length/typesData.length,
        "fMood": getFrequencyByKey("Feeling", data2).keys().next().value, 
        "fAttitude": getFrequencyByKey("Reason", data2).keys().next().value
    }];
}

function getActivityListByPType(everyoneData, typesData, pType) {
    let emailList = typesData
        .filter(d => d.Personality == pType)
        .map(d => d["What's your email?"]);

    return everyoneData.filter(d => emailList.includes(d.Email));
}

function getPersonalizedPType(email, typesData) {
    return typesData
        .filter(d => d["What's your email?"] == email)
        .map(d => d.Personality);
}

function getDataByPType(everyoneData, typesData, pType, activity, f, moodList = []) {
    let emailList = typesData
        .filter(d => d.Personality == pType)
        .map(d => d["What's your email?"]);

    let filteredData = everyoneData.filter(d => emailList.includes(d.Email));
    let filteredActivityData;
    if (moodList.length != 0) {
        filteredActivityData = f(filteredData, activity, moodList);
    } else {
        filteredActivityData = f(filteredData, activity);
    }
    
    let groupActivityData;
    if (moodList.length != 0) {
        groupActivityData = f(everyoneData, activity, moodList);
    } else {
        groupActivityData = f(everyoneData, activity);
    }

    if (moodList.length != 0) {
        return [{
            "percent": filteredActivityData.length/getPersonDataByActivities(filteredData, activity).length, 
            "fMood": getFrequencyByKey("Feeling", groupActivityData).keys().next().value, 
            "fAttitude": getFrequencyByKey("Reason", groupActivityData).keys().next().value
        }, 
        {
            "percent": groupActivityData.length/getPersonDataByActivities(everyoneData, activity).length,
            "fMood": getFrequencyByKey("Feeling", groupActivityData).keys().next().value, 
            "fAttitude": getFrequencyByKey("Reason", groupActivityData).keys().next().value
        }];
    }

    return [{
        "percent": filteredActivityData.length/filteredData.length, 
        "fMood": getFrequencyByKey("Feeling", groupActivityData).keys().next().value, 
        "fAttitude": getFrequencyByKey("Reason", groupActivityData).keys().next().value
    }, 
    {
        "percent": groupActivityData.length/everyoneData.length,
        "fMood": getFrequencyByKey("Feeling", groupActivityData).keys().next().value, 
        "fAttitude": getFrequencyByKey("Reason", groupActivityData).keys().next().value
    }];
}

/** 
 *   str: column name in excel, ie Activity, Reason, Feeling
 *   data: list of data entries 
 *   index: used for split (ie. "b5" or "Intellectual")
 *   returns sorted map of keys to frequency, ie ("b5: 24")
 */
function getFrequencyByKey(str, data, index = 0) {
    let map = new Map();
    for (var i = 0; i < data.length; i++) {
        let key = data[i][str].split(":")[index];
        if (!map.has(key)) {
            map.set(key, 1);
        } else {
            map.set(key, map.get(key) + 1);
        }
    }

    let sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
    return sortedMap;
}

/** 
 *   data: list of data entries
 *   returns sorted map divided first by str1 then by str2
 */
function getFrequencyByKeys(str1, str2, data) {
    let map = {};
    for (var i = 0; i < data.length; i++) {
        let key = data[i][str1].split(":")[0];
        let key2 = data[i][str2];
        if (!(key in map)) {
            map[key] = {};
            map[key][key2] = 1
        } else {
            map[key][key2] = !(key2 in map[key]) ? 1 : (map[key][key2] + 1);
        }
    }

    // var sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
    return map;
}

/** 
 *   data: list of data entries
 *   returns sorted map divided first by str1 then by str2, then by str3
 */
function getFrequencyByThreeKeys(str1, str2, str3, keyList, data) {
    let map = {};
    for (var i = 0; i < data.length; i++) {

        let key = data[i][str1].split(":")[0];
        if (keyList.indexOf(key) != -1) {
            let key2 = data[i][str2];
            let key3 = data[i][str3];
            if (!(key in map)) {
                map[key] = {};
                map[key][key2] = {};
                map[key][key2][key3] = 1;
            } else if (!(key2 in map[key])) {
                map[key][key2] = {};
                map[key][key2][key3] = 1;
            } else if (!(key3 in map[key][key2])) {
                map[key][key2][key3] = 1;
            } else {
                map[key][key2][key3] = map[key][key2][key3] + 1;
            }
        }
    }

    return map;
}

function createMapFromPersonality(data, key, convertLongToShortMap = null) {
    let finalMap = {};

    for (var i = 0; i < data.length; i++) {
        let email = data[i]["What's your email?"];
        let value = data[i][key];
        if (convertLongToShortMap != null) {
            finalMap[email] = convertLongToShortMap[value];
        } else {
            finalMap[email] = value;
        }
    }

    return finalMap;
}

function getFrequencyFromPersonalityMap(personData, personalityMap, key, index = 0) {
    let map = {};
    for (var i = 0; i < personData.length; i++) {
        let email = personData[i]["Email"];
        if (email in personalityMap) {
            let key1 = personalityMap[email];
            let key2 = personData[i][key].split(":")[index];

            if (!(key1 in map)) {
                map[key1] = {};
                map[key1][key2] = 1
            } else {
                map[key1][key2] = !(key2 in map[key1]) ? 1 : (map[key1][key2] + 1);
            }
        }
    }

    return map;
}

/**
 *   keyList: list of keys, usually top 5/6 keys
 *   map: map of (all) keys to list of frequencies, ie "b5: {"Good": 3, "Ok": 5}"
 *   returns map of keys in keyList to mode of second breakdown, ie "b5: Ok"
 */
function findMode(keyList, map) {
    let finalMap = {};

    keyList.forEach(function(id) {
        var keys = Object.keys(map[id]);
        var maxKey = "";
        var maxValue = 0;

        keys.forEach(function(reason) {
            if (map[id][reason] > maxValue) {
                maxKey = reason;
                maxValue = map[id][reason]
            }
        });

        finalMap[id] = maxKey;
    });

    return finalMap;
}

function getAverageFromList(lst) {
    return lst.reduce((a, b) => a + b, 0) / lst.length
}

/**
 *   keyList: list of keys, usually top 5/6 keys
 *   map: map of (all) keys to list of frequencies, ie "b5: {"Good": 3, "Ok": 5}"
 *   returns map of keys in keyList to average moodLegend, starts at 0
 */
function findAvgMood(keyList, map, isRounded = true) {
    let finalMap = {};

    keyList.forEach(function(id) {
        let keys = Object.keys(map[id]);
        let value = 0;
        let count = 0;

        keys.forEach(function(mood) {
            value = value + map[id][mood] * (moodList.indexOf(mood));
            count = count + map[id][mood];
        });

        finalMap[id] = isRounded ? Math.round(value / count) : value / count;
    });

    return finalMap;
}

function getAverage(list) {
    return list.reduce((a, b) => a + b, 0) / list.length
}

function findAvgMoodByKey(personData, key, value, isRounded = true) {
    let filteredData = personData.filter(d => d[key] == value);
    var value = 0;

    for (var d of filteredData) {
        value += moodList.indexOf(d.Feeling);
    }

    return Math.round(value / filteredData.length);
}

/**
 *   keyList: list of keys, usually top 5/6 keys
 *   map: map of (all) keys to list of frequencies, ie "b5: {"Good": 3, "Ok": 5}"
 *   avgMap: map of keys to averages, ie "b5: 2.722"
 *   returns map of keys in keyList to average moodLegend, starts at 0
 */
function findStdDevMood(keyList, map, avgMap) {
    let finalMap = {};

    keyList.forEach(function(id) {
        let keys = Object.keys(map[id]);
        let value = 0;
        let count = 0;

        keys.forEach(function(mood) {
            value = value + map[id][mood] * Math.pow(moodList.indexOf(mood) - avgMap[id], 2);
            count = count + map[id][mood];
        });

        finalMap[id] = Math.sqrt(value / count);
    });

    return finalMap;
}

function calculateStdDev(list, avg) {
    var total = 0;

    for (var n of list) {
        total += Math.pow(n - avg, 2);
    }
    return Math.sqrt(total / list.length);
}

function findStdDevWithAvg(personData, key, value, avg) {
    let filteredData = personData.filter(d => d[key] == value);
    var value = 0;

    for (var item of filteredData) {
        value += item.Feeling * Math.pow(moodList.indexOf(item.Feeling) - avg, 2);
    }

    return Math.sqrt(value / filteredData.length);

}

function getTotalFrequencyFromMap(data) {
    let keys = Object.keys(data);
    let count = 0;

    keys.forEach(function(key) {
        count += data[key];
    });

    return count;
}

function getKeyWithHighestValue(map) {
    let max = 0;
    let maxKey = "";
    let keyList = Object.keys(map);

    keyList.forEach(function(d) {
        if (map[d] > max) {
            max = map[d];
            maxKey = d;
        }
    });

    return maxKey;
}

// Return users whose answer for [personalityDataKey] matches [category], in the form of their emails.
// Example usage: return users whose daily stressor is work.
function getEmailListForCategory(personalityData, category, personalityDataKey) {
    return personalityData.filter(p => {
        return p[personalityDataKey].includes(categoryShortToLongMap[category]);
    }).map(p => {
        return p[keys.personality.email];
    })
}

// Initialize count map for long-term versus short-term personalityData records.
// Example map structure: {long: {}, short: {}}
function initializeCountMaps(countMaps) {
    countMaps.forEach(map => {
        map["long"] = {};
        map["short"] = {};
    });
}

// Increments count of map[type][key].
// Example map structure: {long: {act1: 9, act2: 17}, short: {act1: 12, act2: 14}}
function incrementCategorySubMapCount(map, type, key) {
    let count = map[type][key];
    map[type][key] = count == null ? 1 : count + 1;
}

// Update counts of activities/attitudes/moods from [records] for [type].
// Example usage: updateCountMapFromRecords(longTermRecords, "long", activityCountMap, reasonCountMap, moodCountMap)
// Example structure for moodCountMap: {long: {mood1: 9, mood2: 17}, short: {mood1: 12, mood2: 14}}
function updateCountMapFromRecords(records, type, activityCountMap, reasonCountMap, moodCountMap) {
    records.forEach(record => {
        // Only update category maps if record has Bad or Awful for Feeling.
        if (negativeMoods.includes(record["Feeling"])) {
            let activity = record["Activity"].substring(0, 2);
            let reason = record["Reason"];
            let mood = record["Feeling"];

            incrementCategorySubMapCount(activityCountMap, type, activity);
            incrementCategorySubMapCount(reasonCountMap, type, reason);
            incrementCategorySubMapCount(moodCountMap, type, mood);
        }
    });
}


// Given a map, create a new map using the values as keys
function groupMapByValue(data) {
    let finalMap = {};
    let keys = Object.keys(data);

    for (var i = 0; i < keys.length; i++) {
        if (!(data[keys[i]] in finalMap)) {
            finalMap[data[keys[i]]] = [keys[i]];
        } else {
            finalMap[data[keys[i]]].push(keys[i])
        }
    }
    return finalMap;
}

function calculatePercentageByKey(data, key) {
    let total = 0;
    for (var k of Array.from(data.keys())) {
        total += data.get(k);
    }

    return data.get(key) / total;
}

function getCountMapNegativePercentageFromRecords(records, type, activityCountMap, reasonCountMap, moodCountMap) {
    updateCountMapFromRecords(records, type, activityCountMap, reasonCountMap, moodCountMap);
    // Divide count of Bad/Awful feelings by total records for each activity.
    Object.keys(activityCountMap[type]).forEach(a => {
        let totalRecordCountForActivity = records.filter(record => { return record["Activity"].substring(0, 2) == a }).length
        activityCountMap[type][a] = activityCountMap[type][a] / totalRecordCountForActivity
    })
}

function getTopThreeActivities(activityMap, exclusionList) {
    let keysIter = activityMap.keys();
    let finalList = [];

    while (finalList.length < 3) {
        var key = keysIter.next().value;
        if (!exclusionList.includes(key + ":")) {
            finalList.push(key + ":");
        }
    }

    return finalList;
}

function getPercentageOfActivities(activityList, aggregateList, exclusionList) {
    let count = 0;
    for (var activity of activityList) {
        count += getPersonDataByActivity(aggregateList, activity.substring(0, 2)).length;
    }

    let dCount = 0;
    for (var act of exclusionList) {
        dCount += getPersonDataByActivity(aggregateList, act.substring(0, 2)).length;
    }

    return count / (aggregateList.length - dCount);
}

function getPercentageOfActivitiesWithExclusion(activityList, aggregateList, exclusionList) {
    let count = 0;
    let dCount = 0;
    let tempList = activityList.filter(d => {
        return !exclusionList.includes(d + ":");
    });

    for (var activity of tempList) {
        // console.log(activity)
        count += getPersonDataByActivity(aggregateList, activity).length;
    }

    return count / aggregateList.length;
}

function getDistinctActivitiesAvg(dataList, everyoneData, exclusionList) {
    let count = 0;

    for (var email of dataList) {
        var personData = getPersonData(everyoneData, email);
        let tempList = personData.filter(d => {
            return !exclusionList.includes(d.Activity.substring(0, 3));
        });
        count += getFrequencyByKey("Activity", tempList).size;
    }

    return count / dataList.length;
}

function getDistinctActivitiesWithExclusion(data, exclusionList) {
    let finalSet = new Set();
    for (var item of Array.from(data.keys())) {
        if (!exclusionList.includes(item + ":")) {
            finalSet.add(item);
        }
    }
    return finalSet;
}

// Compare functions.

// Compare moods by amazing to awful.
function compareMoods(a, b) {
    let moodList = ["Awful", "Bad", "Ok", "Good", "Amazing"];
    if (moodList.indexOf(a) == -1 || moodList.indexOf(b) == -1) {
        console.error("compareMoods invalid inputs - " + a + ", " + b);
        return 0;
    }
    return moodList.indexOf(b) - moodList.indexOf(a);
}

// Compare personData activites by most to least entries.
function compareKeyList(a, b, personData) {
    return getPersonDataByActivity(personData, b).length - getPersonDataByActivity(personData, a).length;
}