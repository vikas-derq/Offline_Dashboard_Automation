@api
Feature: System downtime report API
  As an API automation engineer
  I want to verify the system downtime endpoint
  So that device uptime/downtime report responses are validated

  Scenario: Valid request returns hourly downtime entries by default
    When I request system downtime with the following query parameters:
      | sid                  | site-247                  |
      | timestamp[start]     | 2026-08-22T00:00:00       |
      | timestamp[end]       | 2026-08-24T23:59:59       |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "UTC"
    And the response body's meta.grouping.aggregation_interval should be 60
    And the response body should contain downtime entries

  # Note: the lowercase "interval" param actually works - "Interval" (capitalized, as used in
  # some example requests) is silently ignored and the default 60-minute bucket is used instead.
  Scenario: A lowercase interval query parameter changes the bucket granularity
    When I request system downtime with the following query parameters:
      | sid                  | site-247                  |
      | timestamp[start]     | 2026-08-22T00:00:00       |
      | timestamp[end]       | 2026-08-24T23:59:59       |
      | interval             | 15                         |
    Then the response status should be 200
    And the response body's meta.grouping.aggregation_interval should be 15
    And the response body should contain downtime entries

  Scenario: A capitalized Interval query parameter is silently ignored
    When I request system downtime with the following query parameters:
      | sid                  | site-247                  |
      | timestamp[start]     | 2026-08-22T00:00:00       |
      | timestamp[end]       | 2026-08-24T23:59:59       |
      | Interval             | 15                         |
    Then the response status should be 200
    And the response body's meta.grouping.aggregation_interval should be 60

  Scenario: An explicit timezone is honored
    When I request system downtime with the following query parameters:
      | sid                  | site-247                  |
      | timestamp[start]     | 2026-08-22T00:00:00       |
      | timestamp[end]       | 2026-08-24T23:59:59       |
      | timezone             | America/New_York            |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "America/New_York"
    And the response body should contain downtime entries

  Scenario: An invalid timezone is rejected
    When I request system downtime with the following query parameters:
      | sid                  | site-247                  |
      | timestamp[start]     | 2026-08-22T00:00:00       |
      | timestamp[end]       | 2026-08-24T23:59:59       |
      | timezone             | Not/AZone                    |
    Then the response status should be 422

  Scenario: Missing sid is rejected
    When I request system downtime with the following query parameters:
      | timestamp[start]     | 2026-08-22T00:00:00       |
      | timestamp[end]       | 2026-08-24T23:59:59       |
    Then the response status should be 422

  # Note: unlike every other report endpoint, the sid value itself is not validated here -
  # an unknown site id is silently accepted and returns the exact same result as a valid one.
  Scenario: An unknown sid still succeeds since its value is not validated
    When I request system downtime with the following query parameters:
      | sid                  | site-000                  |
      | timestamp[start]     | 2026-08-22T00:00:00       |
      | timestamp[end]       | 2026-08-24T23:59:59       |
    Then the response status should be 200
    And the response body should contain downtime entries

  Scenario: Missing start timestamp is rejected
    When I request system downtime with the following query parameters:
      | sid                  | site-247                  |
      | timestamp[end]       | 2026-08-24T23:59:59       |
    Then the response status should be 422

  Scenario: Missing end timestamp is rejected
    When I request system downtime with the following query parameters:
      | sid                  | site-247                  |
      | timestamp[start]     | 2026-08-22T00:00:00       |
    Then the response status should be 422

  Scenario: Missing X-Customer-API-Key header is rejected
    When I request system downtime without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I request system downtime without the X-FEClient-Key header
    Then the response status should be 401
