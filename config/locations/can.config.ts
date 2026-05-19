
export const CAN = {
  country: 'CAN',
  queryParam: 'country=CAN',
  market: 'Greater Toronto Area',
  community: 'Yorkville',
  condoCommunity: 'Martha James Condominiums',
  condoPlan: {
    name: 'M2ad',
    url: '/ontario/gta/burlington/martha-james-condominiums/m2ad',
    community: 'Martha James Condominiums',
    market: 'Greater Toronto Area',
  },
  qmiAddress: '634 Newlove St.',
  qmiPath: '/ontario/simcoe/innisfil/lakehaven/sawyer/634-newlove-st',
  planName: 'Brinkley I',
  expectedPlanUrlPart: '/brinkley-i',
  aboutUsLinks: [
    {
      name: 'About Us',
      url: '/about/about-mattamy'
    },
    {
      name: 'Community Involvement',
      url: '/about/community-involvement'
    },
    {
      name: 'Media and Investor Relations',
      url: '/about/media-and-investor-relations'
    },
    {
      name: 'Careers',
      url: '/about/careers'
    }
  ],
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
