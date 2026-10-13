@api
Feature: Daywise counts report API
  As an API automation engineer
  I want to verify the daywise counts report endpoint
  So that traffic count report responses are validated

  Scenario: Valid request without a class_type filter returns counts per day
    When I request daywise counts with the following query parameters:
      | sid                  | site-247              |
      | timestamp[start]     | 2026-08-20T01:01:00   |
      | timestamp[end]       | 2026-08-22T01:01:00   |
      | timezone             | America/New_York       |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "America/New_York"
    And the response body should contain day entries

  Scenario: Valid request with a class_type filter returns counts per day
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | sid                  | site-247               |
      | timestamp[start]     | 2026-08-20T01:01:00    |
      | timestamp[end]       | 2026-08-22T01:01:00    |
      | timezone             | America/New_York        |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "America/New_York"
    And the response body should contain day entries

  Scenario: Timezone is UTC by default when not specified
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | sid                  | site-247               |
      | timestamp[start]     | 2026-08-20T01:01:00    |
      | timestamp[end]       | 2026-08-22T01:01:00    |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "utc"
    And the response body should contain day entries

  Scenario: A zone_id with no matching data returns an empty result with explicit timezone
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | sid                  | site-247               |
      | timestamp[start]     | 2026-08-20T01:01:00    |
      | timestamp[end]       | 2026-08-22T01:01:00    |
      | timezone             | America/New_York        |
      | zone_id[]            | Zone_1                  |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "America/New_York"
    And the response body should have no day entries

  Scenario: A zone_id with no matching data returns an empty result with default timezone
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | sid                  | site-247               |
      | timestamp[start]     | 2026-08-20T01:01:00    |
      | timestamp[end]       | 2026-08-22T01:01:00    |
      | zone_id[]            | Zone_1                  |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "utc"
    And the response body should have no day entries

  Scenario: Missing end timestamp is rejected
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | sid                  | site-247               |
      | timestamp[start]     | 2026-08-20T01:01:00    |
      | timezone             | America/New_York        |
    Then the response status should be 422

  Scenario: Missing start timestamp is rejected
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | sid                  | site-247               |
      | timestamp[end]       | 2026-08-22T01:01:00    |
      | timezone             | America/New_York        |
    Then the response status should be 422

  Scenario: Missing sid is rejected
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | timestamp[start]     | 2026-08-20T01:01:00    |
      | timestamp[end]       | 2026-08-22T01:01:00    |
      | timezone             | America/New_York        |
    Then the response status should be 422

  Scenario: An empty sid value is treated the same as a missing sid
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | sid                  |                         |
      | timestamp[start]     | 2026-08-20T01:01:00    |
      | timestamp[end]       | 2026-08-22T01:01:00    |
    Then the response status should be 422

  Scenario: Unknown sid is rejected
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | sid                  | site-000                |
      | timestamp[start]     | 2026-08-20T01:01:00    |
      | timestamp[end]       | 2026-08-22T01:01:00    |
    Then the response status should be 422

  Scenario: An invalid timezone is rejected
    When I request daywise counts with the following query parameters:
      | class_type[]        | pedestrian             |
      | sid                  | site-247               |
      | timestamp[start]     | 2026-08-20T01:01:00    |
      | timestamp[end]       | 2026-08-22T01:01:00    |
      | timezone             | Not/AZone                |
    Then the response status should be 422

  Scenario: Missing X-Customer-API-Key header is rejected
    When I request daywise counts without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I request daywise counts without the X-FEClient-Key header
    Then the response status should be 401
