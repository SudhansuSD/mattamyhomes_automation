@HOME
Feature: Search functionality on Mattamy Homes homepage
  As a home buyer
  I want to search by market or community
  So that I can view relevant communities and homes
    

  @MARKETSEARCH
  Scenario Outline: Search homes by market
    Given I open Mattamy Homes website for "<country>"
    When I search for market "<market>"
    Then search results should display communities for the selected market

    Examples:
      | country | market   |
      | CAN     | Calgary  |
      | CAN     | GTA      |
      | USA     | Phoenix  |   

  @COMMUNITYSEARCH
  Scenario Outline: Search homes by community
    Given I open Mattamy Homes website for "<country>"
    When I search for community "<community>"
    Then community details page should be displayed

    Examples:
      | country | community |
      | CAN     | Yorkville |
      | USA     | Blackhawk |

