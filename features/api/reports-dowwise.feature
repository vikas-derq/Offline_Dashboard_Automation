@api
Feature: Day-of-week-wise (dowwise) counts report API
  As an API automation engineer
  I want to verify the day-of-week-wise counts endpoint
  So that day-of-week traffic report responses are validated

  Scenario: Valid request without a zone_id filter returns day-of-week entries
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
      | time_interval        | 5                         |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "America/New_York"
    And the response body should contain day-of-week entries

  Scenario: A zone_id with no matching data returns the full grid with zero values
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
      | time_interval        | 5                         |
      | zone_id[]            | Zone_1                    |
    Then the response status should be 200
    And every entry should have a zero aggregation value

  Scenario: Timezone is UTC by default when not specified
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | time_interval        | 5                         |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "utc"
    And the response body should contain day-of-week entries

  Scenario: Default class_type still succeeds since it is optional
    When I request dowwise counts with the following query parameters:
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
      | time_interval        | 5                         |
    Then the response status should be 200
    And the response body should contain day-of-week entries

  Scenario: Missing time_interval is rejected
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: Invalid time_interval value is rejected
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
      | time_interval        | 7                         |
    Then the response status should be 422

  Scenario: Missing sid is rejected
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
      | time_interval        | 5                         |
    Then the response status should be 422

  Scenario: Unknown sid is rejected
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-000                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
      | time_interval        | 5                         |
    Then the response status should be 422

  Scenario: Missing start timestamp is rejected
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
      | time_interval        | 5                         |
    Then the response status should be 422

  Scenario: Missing end timestamp is rejected
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timezone             | America/New_York          |
      | time_interval        | 5                         |
    Then the response status should be 422

  Scenario: An invalid timezone is rejected
    When I request dowwise counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | Not/AZone                   |
      | time_interval        | 5                         |
    Then the response status should be 422

  Scenario: Missing X-Customer-API-Key header is rejected
    When I request dowwise counts without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I request dowwise counts without the X-FEClient-Key header
    Then the response status should be 401
