@api
Feature: Peak-hour-factor (PHF) counts report API
  As an API automation engineer
  I want to verify the PHF turning-movement counts endpoint
  So that peak-hour-factor report responses are validated

  Scenario: Valid single-day request returns approach movement entries
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-22T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "America/New_York"
    And the response body should contain approach movement entries

  Scenario: A zone_id with no matching data returns the full grid with zero values
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-22T23:59:59      |
      | timezone             | America/New_York          |
      | zone_id[]            | Zone_1                    |
    Then the response status should be 200
    And every entry should have a zero aggregation value

  Scenario: Default class_type still succeeds since it defaults to all vehicle classes
    When I request phf counts with the following query parameters:
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-22T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 200
    And the response body should contain approach movement entries

  Scenario: Timezone is UTC by default and a UTC-aligned single day still succeeds
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-22T23:59:59      |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "utc"
    And the response body should contain approach movement entries

  Scenario: A timestamp range spanning two days is rejected
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-23T23:59:59      |
      | zone_id[]            | Zone_1                    |
    Then the response status should be 422

  Scenario: A timestamp range spanning two days is rejected even with an explicit timezone
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-23T23:59:59      |
      | timezone             | America/New_York          |
      | zone_id[]            | Zone_1                    |
    Then the response status should be 422

  Scenario: A partial (half) day range is rejected
    When I request phf counts with the following query parameters:
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-22T12:00:00      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: Missing sid is rejected
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-22T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: Unknown sid is rejected
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-000                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-22T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: Missing start timestamp is rejected
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[end]       | 2026-08-22T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: Missing end timestamp is rejected
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: An invalid timezone is rejected
    When I request phf counts with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-08-22T00:00:00      |
      | timestamp[end]       | 2026-08-22T23:59:59      |
      | timezone             | Not/AZone                  |
    Then the response status should be 422

  Scenario: Missing X-Customer-API-Key header is rejected
    When I request phf counts without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I request phf counts without the X-FEClient-Key header
    Then the response status should be 401
