
export const CAN = {
  country: 'CAN',
  queryParam: 'country=CAN',
  market: 'Greater Toronto Area',
  community: 'Yorkville',
  condoCommunity: 'Martha James Condominiums',
  qmiAddress: '1230 148 Avenue NW',
  qmiPath: '/alberta/calgary/calgary/carrington/brinkley-ii/1230-148-avenue-nw',
  planName: 'Brinkley I',
  expectedPlanUrlPart: '/brinkley-i',
  markets:[
    {
      name: 'Greater Toronto Area || GTA',
      url: '/ontario/gta'
    }, 
    {
      name: 'Calgary',
      url: '/alberta/calgary' 
    },
    {
      name: 'Edmonton',
      url: '/alberta/edmonton'
    },
    {
      name: 'Ottawa',
      url: '/ontario/ottawa'
    },
    {
      name: 'Simcoe',
      url: '/ontario/simcoe'
    },
    {
      name: 'Kitchener-Waterloo-Guelph',
      url: '/ontario/kitchener-waterloo-guelph'
    }
  ]
} as const;
