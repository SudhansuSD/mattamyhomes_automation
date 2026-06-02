import { MarketPage } from '../../pages/MarketPage';
import { getEnvConfig } from '../environments/envConfig';

const ENVIRONMENT_LOCATION_OVERRIDES = {
  STAGE: {
    USA: {
      country: 'USA',
      queryParam: 'country=USA',
      market: 'Phoenix',
      mpc: [{
        name: 'Wellen Park - Master-Planned Community',
        market: ['Sarasota and Bradenton', 'Sarasota-Bradenton', 'Sarasota/Bradenton'],
        url: '/florida/sarasota-bradenton/venice/wellen-park'
      }],
      community: 'Landmarke',
      communityPath: '/arizona/phoenix/san-tan-valley/landmarke-50s',
      qmiAddress: '294 W FLAX DR',
      qmiPath: '/arizona/phoenix/san-tan-valley/landmarke-50s/crimson/294-w-flax-dr',
      planName: 'Aqua',
      expectedPlanPath: '/arizona/phoenix/san-tan-valley/landmarke-50s/aqua',
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
          name: 'Sustainability',
          url: '/about/sustainability'
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
      markets: [
        {
          name: 'Charlotte',
          url: '/north-carolina/charlotte'
        },
        {
          name: 'Dallas-Fort Worth',
          url: '/texas/dallas-fort-worth'
        },
        {
          name: 'Fort Lauderdale',
          url: '/florida/fort-lauderdale'
        },
        {
          name: 'Jacksonville-St. Augustine',
          url: '/florida/jacksonville-st-augustine'
        },
        {
          name: 'Naples-Fort Myers',
          url: '/florida/naples-fort-myers'
        },
        {
          name: 'Orlando',
          url: '/florida/orlando'
        },
        {
          name: 'Palm Beach',
          url: '/florida/palm-beach'
        },
        {
          name: 'Palm City-Stuart',
          url: '/florida/palm-city-stuart'
        },
        {
          name: 'Phoenix',
          url: '/arizona/phoenix'
        },
        {
          name: 'Port St. Lucie',
          url: '/florida/port-st-lucie'
        },
        {
          name: 'Raleigh',
          url: '/north-carolina/raleigh'
        },
        {
          name: 'Sarasota and Bradenton || Sarasota-Bradenton',
          url: '/florida/sarasota-bradenton'
        },
        {
          name: 'Tampa',
          url: '/florida/tampa'
        },
        {
          name: 'Tucson',
          url: '/arizona/tucson'
        }
      ]
    },
    CAN: {
      country: 'CAN',
      queryParam: 'country=CAN',
      market: 'Calgary',
      community: 'Yorkville',
      communityPath: '/alberta/calgary/calgary/yorkville',
      condoCommunity: 'Martha James Condominiums',
      condoPlan: {
        name: 'M2ad',
        url: '/ontario/gta/burlington/martha-james-condominiums/m2ad',
        community: 'Martha James Condominiums',
        market: 'Greater Toronto Area',
      },
      qmiAddress: '48 YORKSTONE CRESCENT SW',
      qmiPath: '/alberta/calgary/calgary/yorkville/fullerton/48-yorkstone-crescent-sw',
      planName: 'Fullerton',
      expectedPlanPath: '/alberta/calgary/calgary/yorkville/fullerton',
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
      markets: [
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
    },
  },
  PROD: {
    USA: {
      country: 'USA',
      queryParam: 'country=USA',
      market: 'Phoenix',
      mpc: [{
        name: 'Wellen Park - Master-Planned Community',
        market: ['Sarasota and Bradenton', 'Sarasota-Bradenton', 'Sarasota/Bradenton'],
        url: '/florida/sarasota-bradenton/venice/wellen-park'
      }],
      community: 'Landmarke',
      communityPath: '/arizona/phoenix/san-tan-valley/landmarke-50s',
      qmiAddress: '629 W RIPARIAN DR',
      qmiPath: '/arizona/phoenix/san-tan-valley/landmarke-50s/aqua/629-w-riparian-dr',
      planName: 'Aqua',
      expectedPlanPath: '/arizona/phoenix/san-tan-valley/landmarke-50s/aqua',
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
          name: 'Sustainability',
          url: '/about/sustainability'
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
      markets: [
        {
          name: 'Charlotte',
          url: '/north-carolina/charlotte'
        },
        {
          name: 'Dallas-Fort Worth',
          url: '/texas/dallas-fort-worth'
        },
        {
          name: 'Fort Lauderdale',
          url: '/florida/fort-lauderdale'
        },
        {
          name: 'Jacksonville-St. Augustine',
          url: '/florida/jacksonville-st-augustine'
        },
        {
          name: 'Naples-Fort Myers',
          url: '/florida/naples-fort-myers'
        },
        {
          name: 'Orlando',
          url: '/florida/orlando'
        },
        {
          name: 'Palm Beach',
          url: '/florida/palm-beach'
        },
        {
          name: 'Palm City-Stuart',
          url: '/florida/palm-city-stuart'
        },
        {
          name: 'Phoenix',
          url: '/arizona/phoenix'
        },
        {
          name: 'Port St. Lucie',
          url: '/florida/port-st-lucie'
        },
        {
          name: 'Raleigh',
          url: '/north-carolina/raleigh'
        },
        {
          name: 'Sarasota and Bradenton || Sarasota-Bradenton',
          url: '/florida/sarasota-bradenton'
        },
        {
          name: 'Tampa',
          url: '/florida/tampa'
        },
        {
          name: 'Tucson',
          url: '/arizona/tucson'
        }
      ]
    },
    CAN: {
      country: 'CAN',
      queryParam: 'country=CAN',
      market: 'Greater Toronto Area',
      community: 'Yorkville',
      communityPath: '/ontario/gta/caledon/yorkville',
      condoCommunity: 'Martha James Condominiums',
      condoPlan: {
        name: 'M2ad',
        url: '/ontario/gta/burlington/martha-james-condominiums/m2ad',
        community: 'Martha James Condominiums',
        market: 'Greater Toronto Area',
      },
      qmiAddress: '634 Newlove St.',
      qmiPath: '/ontario/simcoe/innisfil/lakehaven/sawyer/634-newlove-st',
      planName: 'Sawyer',
      expectedPlanPath: '/ontario/simcoe/innisfil/lakehaven/sawyer',
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
      markets: [
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
    },
  }
} as const;

export const LOCATIONS = ENVIRONMENT_LOCATION_OVERRIDES.STAGE;

type EnvName = keyof typeof ENVIRONMENT_LOCATION_OVERRIDES;
export type LocationKey = keyof typeof ENVIRONMENT_LOCATION_OVERRIDES[EnvName];
type WidenLocationValue<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
  ? WidenLocationValue<U>[]
  : T extends object
  ? { -readonly [K in keyof T]: WidenLocationValue<T[K]> }
  : T;
type RawLocationConfig = WidenLocationValue<
  typeof ENVIRONMENT_LOCATION_OVERRIDES[EnvName][LocationKey]
>;
export type LocationConfig = RawLocationConfig & {
  expectedPlanUrlPart: string;
};

declare const process: { env: { LOCATION?: string } };

export function getLocationKey(
  overrideLocation?: LocationKey
): LocationKey {
  const rawKey =
    overrideLocation ??
    (process?.env?.LOCATION as string | undefined) ??
    'USA'; // Default location if not specified
  const key = rawKey.toUpperCase() as LocationKey;
  const envName = getEnvConfig().envName as EnvName;

  if (!ENVIRONMENT_LOCATION_OVERRIDES[envName][key]) {
    throw new Error(`Invalid LOCATION provided: ${rawKey}`);
  }

  return key;
}

export function getLocationConfig(
  overrideLocation?: LocationKey
): LocationConfig {
  const envName = getEnvConfig().envName as EnvName;
  const key = getLocationKey(overrideLocation);
  const location = ENVIRONMENT_LOCATION_OVERRIDES[envName][key];

  return {
    ...location,
    expectedPlanUrlPart: location.expectedPlanPath,
  } as unknown as LocationConfig;
}
