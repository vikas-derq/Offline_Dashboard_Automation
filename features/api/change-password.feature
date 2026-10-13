@api
Feature: Customer change password API
  As an API automation engineer
  I want to verify the customer change password endpoint
  So that password update responses are validated

  # This endpoint throttles change-password attempts per authenticated customer
  # (observed ~4 requests before a 429 that took ~12 minutes to clear), so scenarios
  # that authenticate are kept few and spaced out. Scenarios that fail header auth
  # before reaching the throttled action are not affected and are not spaced.

  Scenario: Incorrect current password is rejected
    When I send a change password request with current password "wrong-current-password" and new password "NewPassw0rd!1"
    Then the response status should be 422

  Scenario: New password same as current password is rejected
    When I send a change password request with the configured customer's current password and the same new password
    Then the response status should be 422

  Scenario: New password that does not meet complexity rules is rejected
    When I send a change password request with the configured customer's current password and new password "1234567"
    Then the response status should be 422

  Scenario: Missing current_password field is rejected
    When I send a change password request with the following details:
      | password              | NewPassw0rd!1 |
      | password_confirmation | NewPassw0rd!1 |
    Then the response status should be 400

  Scenario: Missing X-Customer-API-Key header is rejected
    When I send a change password request without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I send a change password request without the X-FEClient-Key header
    Then the response status should be 401
