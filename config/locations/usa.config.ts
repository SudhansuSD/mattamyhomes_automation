export const USA = {
  country: 'USA',
  queryParam: 'country=USA',
  market: 'Phoenix',
  community: 'Landmarke',
  qmiAddress: '263 W FLAX DR',
  planName: 'Aqua',
  expectedPlanUrlPart: 'landmarke-50s/aqua',
  markets: [{
    name: 'Phoenix',
    url: '/arizona/phoenix'
  },
  {
    name: 'Tampa',
    url: '/florida/tampa'
  },
  {
    name: 'Orlando',
    url: '/florida/orlando'
  },
  {
    name: 'Tucson',
    url: '/arizona/tucson'
  },
  {
    name: 'Sarasota and Bradenton',
    url: '/florida/sarasota-bradenton'
  },
  {
    name: 'Raleigh',
    url: '/north-carolina/raleigh'
  },
  {
    name: 'Charlotte',
    url: '/north-carolina/charlotte'
  },
  {
    name: 'Palm City - Stuart',
    url: '/florida/palm-city-stuart'
  },
  {
    name: 'Palm Beach',
    url: '/florida/palm-beach'
  },
  {
    name: 'Fort Lauderdale',
    url: '/florida/fort-lauderdale'
  },
  {
    name: 'Dallas-Fort Worth',
    url: '/texas/dallas-fort-worth'
  }
  ]
} as const;
