@api
Feature: Timewise counts report API
  As an API automation engineer
  I want to verify the timewise counts report endpoint
  So that traffic count report responses are validated

  Scenario: Valid request returns counts for a 5 minute interval
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-247              |
      | timestamp[start]     | 2026-08-20T01:01:00   |
      | timestamp[end]       | 2026-08-22T01:01:00   |
      | time_interval        | 5                      |
    Then the response status should be 200
    And the response body should have timewise counts metadata for a time interval of 5
    And the response body should contain time bucket entries

  Scenario: Valid request returns counts for a 60 minute interval
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-247              |
      | timestamp[start]     | 2026-08-20T01:01:00   |
      | timestamp[end]       | 2026-08-22T01:01:00   |
      | time_interval        | 60                     |
    Then the response status should be 200
    And the response body should have timewise counts metadata for a time interval of 60
    And the response body should contain time bucket entries

  Scenario: Missing time_interval is rejected
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-481              |
      | timestamp[start]     | 2026-06-01T01:01:00   |
      | timestamp[end]       | 2026-06-30T01:01:00   |
    Then the response status should be 422

  Scenario: Invalid time_interval value is rejected
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-481              |
      | timestamp[start]     | 2026-06-01T01:01:00   |
      | timestamp[end]       | 2026-06-30T01:01:00   |
      | time_interval        | 7                      |
    Then the response status should be 422

  Scenario: Missing sid is rejected
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | timestamp[start]     | 2026-06-01T01:01:00   |
      | timestamp[end]       | 2026-06-30T01:01:00   |
      | time_interval        | 5                      |
    Then the response status should be 422

  Scenario: Unknown sid is rejected
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-000              |
      | timestamp[start]     | 2026-06-01T01:01:00   |
      | timestamp[end]       | 2026-06-30T01:01:00   |
      | time_interval        | 5                      |
    Then the response status should be 422

  Scenario: Missing start timestamp is rejected
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-481              |
      | timestamp[end]       | 2026-06-30T01:01:00   |
      | time_interval        | 5                      |
    Then the response status should be 422

  Scenario: Missing end timestamp is rejected
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-481              |
      | timestamp[start]     | 2026-06-01T01:01:00   |
      | time_interval        | 5                      |
    Then the response status should be 422

  Scenario: Missing X-Customer-API-Key header is rejected
    When I request timewise counts without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I request timewise counts without the X-FEClient-Key header
    Then the response status should be 401

  Scenario: Missing class_type still succeeds since it is optional
    When I request timewise counts with the following query parameters:
      | sid                  | site-247              |
      | timestamp[start]     | 2026-08-20T01:01:00   |
      | timestamp[end]       | 2026-08-22T01:01:00   |
      | time_interval        | 5                      |
    Then the response status should be 200
    And the response body should contain time bucket entries

  Scenario: A valid explicit timezone is honored
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-247              |
      | timestamp[start]     | 2026-08-20T01:01:00   |
      | timestamp[end]       | 2026-08-22T01:01:00   |
      | time_interval        | 5                      |
      | timezone             | Asia/Dubai             |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "Asia/Dubai"
    And the response body should contain time bucket entries

  Scenario: An invalid timezone is rejected
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-247              |
      | timestamp[start]     | 2026-08-20T01:01:00   |
      | timestamp[end]       | 2026-08-22T01:01:00   |
      | time_interval        | 5                      |
      | timezone             | Not/AZone              |
    Then the response status should be 422

  Scenario: An unknown zone_id is not applied and results are unaffected
    When I request timewise counts with the following query parameters:
      | class_type[]        | pedestrian            |
      | sid                  | site-247              |
      | timestamp[start]     | 2026-08-20T01:01:00   |
      | timestamp[end]       | 2026-08-22T01:01:00   |
      | time_interval        | 5                      |
      | zone_id[]            | ZONE_DOES_NOT_EXIST    |
    Then the response status should be 200
    And the response body should contain time bucket entries
