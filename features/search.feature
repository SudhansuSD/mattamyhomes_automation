Feature: Search homes by country

  @PRICESEARCHFILTER
Scenario: Search homes with price filter
  Given I open Mattamy Homes website for "<country>"
  When I search for market "<market>"
  And I select min price "$400K" and max price "$500K"
  Then search results should be displayed

Examples:
  | country | market  |
  | CAN     | Calgary |
  | USA     | Phoenix |

  @BEDBATHFILTER
Scenario: Search homes with bed & bath filter
  Given I open Mattamy Homes website for "<country>"
  When I search for market "<market>"
  And I apply bed & bath filter with "3+" beds and "2+" baths
  Then search results should display communities with applied bed & bath filter
  Examples:
  | country | market  |
  | CAN     | Calgary |
  | USA     | Phoenix |