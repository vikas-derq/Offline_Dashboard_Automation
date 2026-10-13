@api
Feature: Zonewise counts report API
  As an API automation engineer
  I want to verify the zonewise counts report endpoint
  So that traffic count report responses are validated

  Scenario: Valid request without a zone_id filter returns counts per zone and interval
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
      | time_interval        | 5                        |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "America/New_York"
    And the response body should contain zone entries with an interval breakdown

  Scenario: A zone_id with no matching data returns an empty result
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
      | time_interval        | 5                        |
      | zone_id[]            | Zone_1                   |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "America/New_York"
    And the response body should have no zone entries

  Scenario: Timezone is UTC by default when not specified
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | time_interval        | 5                        |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "utc"
    And the response body should contain zone entries with an interval breakdown

  Scenario: time_interval is optional and aggregates across the whole range when omitted
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
    Then the response status should be 200
    And the response body should contain zone entries without an interval breakdown

  Scenario: Invalid time_interval value is rejected
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
      | time_interval        | 7                        |
    Then the response status should be 422

  Scenario: Missing sid is rejected
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
      | time_interval        | 5                        |
    Then the response status should be 422

  Scenario: Unknown sid is rejected
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | sid                  | site-000                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
      | time_interval        | 5                        |
    Then the response status should be 422

  Scenario: Missing start timestamp is rejected
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | sid                  | site-247                |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | America/New_York         |
      | time_interval        | 5                        |
    Then the response status should be 422

  Scenario: Missing end timestamp is rejected
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timezone             | America/New_York         |
      | time_interval        | 5                        |
    Then the response status should be 422

  Scenario: An invalid timezone is rejected
    When I request zonewise counts with the following query parameters:
      | class_type[]        | vehicle                |
      | sid                  | site-247                |
      | timestamp[start]     | 2026-08-20T01:01:00     |
      | timestamp[end]       | 2026-08-22T01:01:00     |
      | timezone             | Not/AZone                 |
      | time_interval        | 5                        |
    Then the response status should be 422

  Scenario: Missing X-Customer-API-Key header is rejected
    When I request zonewise counts without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I request zonewise counts without the X-FEClient-Key header
    Then the response status should be 401
