@api
Feature: Customer logout API
  As an API automation engineer
  I want to verify the customer logout endpoint
  So that session termination responses are validated

  Scenario: Logout ends the authenticated customer's session
    When I send a logout request
    Then the response status should be 200

  Scenario: Logout without an API key is rejected
    When I send a logout request without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Logout with an invalid API key is rejected
    When I send a logout request with an invalid X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Logout without the X-FEClient-Key header is rejected
    When I send a logout request without the X-FEClient-Key header
    Then the response status should be 401

  Scenario: Logging out twice rejects the second attempt
    When I send a logout request
    Then the response status should be 200
    When I send a logout request
    Then the response status should be 401
