module.exports = {
  /**
   * Returns back some attributes based on whether the
   * link is active or a parent of an active item
   *
   * @param {String} itemUrl The link in question
   * @param {String} pageUrl The page context
   * @returns {String} The attributes or empty
   */
  getLinkActiveState(itemUrl, pageUrl) {
    let response = "";

    if (itemUrl === pageUrl) {
      response = ' aria-current="page"';
    }

    if (itemUrl.length > 1 && pageUrl.indexOf(itemUrl) === 0) {
      response += " data-state=active";
    }

    return response;
  },
  /**
   * Filters out the passed item from the passed collection
   * and randomises and limits them based on flags
   *
   * @param {Array} collection The 11ty collection we want to take from
   * @param {Object} item The item we want to exclude (often current page)
   * @param {Number} limit=3 How many items we want back
   * @param {Boolean} random=true Wether or not this should be randomised
   * @returns {Array} The resulting collection
   */
  getSiblingContent(collection, item, limit = 3, random = true) {
    let filteredItems = collection.filter((x) => x.url !== item.url);

    if (random) {
      let counter = filteredItems.length;

      while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        counter--;

        let temp = filteredItems[counter];

        // Swap the last element with the random one
        filteredItems[counter] = filteredItems[index];
        filteredItems[index] = temp;
      }
    }

    // Lastly, trim to length
    if (limit > 0) {
      filteredItems = filteredItems.slice(0, limit);
    }

    return filteredItems;
  },
  getTodaysYear() {
    return new Date().getFullYear();
  },
  getToday() {
    const DAY = new Date();
    return DAY.getDay();
  },
  getNextEvent(collection) {
    const DAY = new Date();
    for (counter in collection) {
      const EVENTDAY = new Date(collection[counter].data.date);
      console.log(EVENTDAY, DAY);
      if (EVENTDAY > DAY) {
        console.log(collection[counter].data.title);
        return collection[counter];
      }
    }
    return null;
  },
  getNextEvents(collection, limit = 4) {
    const DAY = new Date();
    const EVENTS = new Array();
    for (counter in collection) {
      const EVENTDAY = new Date(collection[counter].data.date);
      console.log(EVENTDAY, DAY);
      if (EVENTDAY > DAY) {
        console.log(collection[counter].data.title);
        return collection[counter];
      }
    }
    return collection.slice(1, limit);
  },
  getDateInfo(date) {
    const DAY = new Date(date);
    const weekday = ["Sun.", "Mon.", "Tue.", "Wed.", "Thur.", "Fri.", "Sat."];
    const month = [
      "Jan.",
      "Feb.",
      "March",
      "April",
      "May",
      "June",
      "July",
      "Aug.",
      "Sept.",
      "Oct.",
      "Nov.",
      "Dec.",
    ];
    let afternoon = DAY.getHours() >11 && DAY.getHours() < 24 ? true : false;
    let minutes =
      DAY.getMinutes() < 10 ? "0" + DAY.getMinutes() : DAY.getMinutes();
    minutes+= afternoon ? "pm" :"am";
    let hours = afternoon ? DAY.getHours() - 12 : DAY.getHours();
    hours = DAY.getHours() == 12 || DAY.getHours() ==0 ? 12 : hours;
      
    let dateInfo = [
      [
        weekday[DAY.getDay()],
        hours,
        minutes,
        month[DAY.getMonth()],
        DAY.getDate(),
      ],
    ];
    //console.log(dateInfo);
    return dateInfo;
  },
  getTruncatedFaqSet(faq) {
    //console.log(faq[0]);
    return faq[0];
  },
  getMenuCategories(collection) {
    //console.log(collection)
    const CATEGORIES = new Array();
    for (counter in collection) {
      //console.log("-----------------------------------------------");
      //console.log(collection[counter].data.category);
      CATEGORIES.push(collection[counter].data.category);
      counter--;
    }
    return [...new Set(CATEGORIES)];
  },
  getSpecialDays(collection) {
    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const SPECIALDAYS = new Array();
    const DAYMAP = new Object();
    for (counter in collection) {
      console.log(collection[counter].data.day);
      let day = collection[counter].data.day;
      DAYMAP[day] = weekday[day];
    }
    for (i = 0; i < 8; i++) {
      if (DAYMAP[i]) {
        SPECIALDAYS.push([i, DAYMAP[i]]);
      }
      // weekday[counter]
    }
    console.log(SPECIALDAYS);
    return SPECIALDAYS;
  },
};
