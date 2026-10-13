@api
Feature: API health
  As an API automation engineer
  I want a starter API feature
  So that new dashboard checks have a consistent home

  Scenario: API endpoint returns a response
    When I send a GET request to "/health"
    Then the response status should be 200
