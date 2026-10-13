@api
Feature: Customer login API
  As an API automation engineer
  I want to verify the customer login endpoint
  So that authentication responses are validated

  Scenario: Valid credentials log the customer in
    When I send a login request with the configured customer credentials
    Then the response status should be 200

  Scenario: Invalid credentials are rejected
    When I send a login request with email "user@derq.com" and password "wrong-password"
    Then the response status should be 401

  Scenario: Unknown email is rejected
    When I send a login request with email "nobody-here@example.com" and password "123456"
    Then the response status should be 401

  Scenario: Malformed email format is rejected
    When I send a login request with email "not-an-email" and password "123456"
    Then the response status should be 401

  Scenario: Missing password is rejected
    When I send a login request with the following details:
      | email | user@derq.com |
    Then the response status should be 401

  Scenario: Missing email is rejected
    When I send a login request with the following details:
      | password | 123456 |
    Then the response status should be 401

  Scenario: Empty request body is rejected
    When I send a login request with an empty body
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I send a login request with the configured customer credentials and no X-FEClient-Key header
    Then the response status should be 401

  Scenario: Invalid X-FEClient-Key header is rejected
    When I send a login request with the configured customer credentials and an invalid X-FEClient-Key header
    Then the response status should be 401
