export default async function getSchedInfo(/* date */) {
  // The Anilist API does not provide a date-based airing schedule.
  // Return an empty array so the Schedule component shows "No data to display".
  return [];
}
