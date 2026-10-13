@api
Feature: CPU health summary report API
  As an API automation engineer
  I want to verify the CPU health summary endpoint
  So that device health report responses are validated

  Scenario: Valid request returns CPU health entries
    When I request the cpu health summary with the following query parameters:
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
    Then the response status should be 200
    And the response body should contain cpu health entries

  Scenario: Missing sid is rejected
    When I request the cpu health summary with the following query parameters:
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
    Then the response status should be 422

  Scenario: An empty sid value is rejected
    When I request the cpu health summary with the following query parameters:
      | sid                  |                          |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
    Then the response status should be 422

  Scenario: Unknown sid returns an empty result instead of an error
    When I request the cpu health summary with the following query parameters:
      | sid                  | site-000                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
    Then the response status should be 200
    And the response body should have no cpu health entries

  Scenario: Missing start timestamp still succeeds since it is not required for this endpoint
    When I request the cpu health summary with the following query parameters:
      | sid                  | site-247                |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
    Then the response status should be 200
    And the response body should contain cpu health entries

  Scenario: Missing end timestamp still succeeds since it is not required for this endpoint
    When I request the cpu health summary with the following query parameters:
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timezone             | America/New_York         |
    Then the response status should be 200
    And the response body should contain cpu health entries

  Scenario: Missing both timestamps still succeeds since neither is required for this endpoint
    When I request the cpu health summary with the following query parameters:
      | sid                  | site-247                |
      | timezone             | America/New_York         |
    Then the response status should be 200
    And the response body should contain cpu health entries

  Scenario: An invalid timezone is rejected
    When I request the cpu health summary with the following query parameters:
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | Not/AZone                 |
    Then the response status should be 422

  Scenario: Missing X-Customer-API-Key header is rejected
    When I request the cpu health summary without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I request the cpu health summary without the X-FEClient-Key header
    Then the response status should be 401
