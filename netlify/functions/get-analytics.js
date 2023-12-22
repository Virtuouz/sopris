import fetch from "node-fetch";
import { schedule } from "@netlify/functions";
const axios = require("axios");
const { GristDocAPI } = require("grist-api");

const siteID = "d7ef9b0e-0df2-48fb-a8a1-dedb43206576";
const DOC_URL = "https://grist.vynxlabs.dev/rr18tFHCZN5E";

const now = Date.now();
//always has to be an even amount of hours greater than 0
const hour = 10;
const hoursAgo = now - hour * 60 * 60 * 1000;

const pageViews = `
https://app.netlify.com/access-control/analytics-api/v2/${siteID}/pageviews?from=${hoursAgo}&to=${now}&timezone=-0700&resolution=hour`;
const uniqueVisitors = `https://app.netlify.com/access-control/analytics-api/v2/${siteID}/visitors?from=${hoursAgo}&to=${now}&timezone=-0700&resolution=hour`;

const authTokenNetlify = process.env.NETLIFY_TOKEN;
const authTokenGrist = process.env.GRIST_TOKEN;
const headers = { headers: { Authorization: `Bearer ${authTokenNetlify}` } };

const handler = schedule("0 * * * *", async () => {
  const analyticsToPull = [
    ["HourlyPageViews", pageViews],
    ["HourlyUniqueVisitors", uniqueVisitors],
  ];
  const resourceAnalyticsToPull = [
    { table: "HourlyTopPages", endpoint: "pages" },
    { table: "HourlyTopSources", endpoint: "sources" },
    { table: "HourlyTopNotFound", endpoint: "not_found" },
  ];

  for (i in analyticsToPull) {
    let table = analyticsToPull[i][0];
    let analyticsCall = analyticsToPull[i][1];
    let data = await getAnalytics(analyticsCall);

    let records = [];
    for (index in data) {
      let unixTimestamp = data[index][0];
      let count = data[index][1];
      console.log(unixTimestamp, count);
      records.push({ Unix: unixTimestamp, Count: count });
    }

    console.log(records);
    await syncTables(table, records, ["Unix"]);
  }

  //always use even number of hours
  let timestamps = getTimeStamps(hour);
  let recordsToPush = [];
  while (timestamps.length > 0) {
    let earlyHour = timestamps.pop();
    let lateHour = timestamps.pop();
    console.log(timestamps.length);
    for (i in resourceAnalyticsToPull) {
      let url = `https://app.netlify.com/access-control/analytics-api/v2/${siteID}/ranking/${resourceAnalyticsToPull[i].endpoint}?from=${earlyHour}&to=${lateHour}&timezone=-0700&limit=15`;
      let records = [];
      let data = await getAnalytics(url);
      let table = resourceAnalyticsToPull[i].table;
      for (x in data) {
        records.push({
          Identifier: `${lateHour}-${data[x].resource}`,
          Unix: `${lateHour}`,
          Resource: `${data[x].resource}`,
          Count: `${data[x].count}`,
        });
      }
      recordsToPush.push({ table: table, records: records });
    }
  }
  let mergedData = mergeTableData(recordsToPush);
  mergedData.forEach(async (item) => {
    const { table, records } = item;
    await syncTables(table, records, ["Identifier"]);
  });

  console.log("DOne");
});

function mergeTableData(inputArray) {
  // Create an empty object to store merged results
  const mergedData = {};

  // Iterate through the inputArray
  inputArray.forEach((item) => {
    const { table, records } = item;

    // Check if the table key already exists in mergedData
    if (!mergedData[table]) {
      // If not, create a new entry with the records
      mergedData[table] = records;
    } else {
      // If yes, merge the records by concatenating the arrays
      mergedData[table] = mergedData[table].concat(records);
    }
  });

  const mergedArray = Object.entries(mergedData).map(([table, records]) => ({
    table,
    records,
  }));

  console.log(mergedArray);
  return mergedArray;
}
function getTimeStamps(hoursToGoBack) {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current Unix timestamp in seconds

  const timestamps = [];

  for (let i = 0; i < hoursToGoBack; i++) {
    const timestamp = currentTimestamp - i * 3600 - (currentTimestamp % 3600); // Align with the start of each hour
    timestamps.push(timestamp * 1000);
  }

  return timestamps;
}

async function syncTables(table, records, idCol) {
  const gristAPI = new GristDocAPI(DOC_URL, {
    apiKey: authTokenGrist,
  });
  try {
    await gristAPI
      .syncTable(table, records, idCol)
      .then((response) => console.log(response));
  } catch (error) {
    console.log(error);
  }
}

async function getAnalytics(analyticsCall) {
  try {
    const response = await axios.get(analyticsCall, headers);
    console.log(response.data); // You might want to print response.data instead of the entire response object
    return response.data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export { handler };
