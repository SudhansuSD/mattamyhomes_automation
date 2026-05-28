// const LOCATIONS = {
//   USA: {
//     country: 'USA',
//     queryParam: 'country=USA',
//     market: 'Phoenix',
//     community: 'Landmarke',
//     qmiAddress: '315 W FLAX DR',
//     qmiPath: '/arizona/phoenix/san-tan-valley/landmarke-50s/mahogany/315-w-flax-dr',
//   },
//   CAN: {
//     country: 'CAN',
//     queryParam: 'country=CAN',
//     market: 'Greater Toronto Area',
//     community: 'Yorkville',
//     qmiAddress: '634 Newlove St.',
//     qmiPath: '/ontario/simcoe/innisfil/lakehaven/sawyer/634-newlove-st',
//   },
// };

// function getMobileLocation() {
//   const key = (process.env.LOCATION || 'USA').toUpperCase();

//   if (!LOCATIONS[key]) {
//     throw new Error(`Invalid LOCATION provided for mobile Appium tests: ${key}`);
//   }

//   return LOCATIONS[key];
// }

// function getCommunityPath(location = getMobileLocation()) {
//   return location.qmiPath.split('/').filter(Boolean).slice(0, -2).join('/');
// }

// module.exports = {
//   getCommunityPath,
//   getMobileLocation,
// };
