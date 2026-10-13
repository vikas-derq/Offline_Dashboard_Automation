@api
Feature: Classwise counts report API
  As an API automation engineer
  I want to verify the classwise counts report endpoint
  So that traffic count report responses are validated

  Scenario: Valid request returns counts grouped by day
    When I request classwise counts with the following query parameters:
      | group_by          | day                 |
      | class_type         | vehicle              |
      | sid                 | site-481             |
      | timestamp[start]    | 2026-06-01T01:01:00  |
      | timestamp[end]      | 2026-06-10T01:01:00  |
    Then the response status should be 200
    And the response body should have classwise counts metadata grouped by "day"

  Scenario: Valid request with class_type array format returns counts grouped by day
    When I request classwise counts with the following query parameters:
      | group_by          | day                  |
      | class_type[]        | pedestrian            |
      | sid                 | site-481              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-10T01:01:00   |
    Then the response status should be 200
    And the response body should have classwise counts metadata grouped by "day"

  Scenario: Valid request returns counts grouped by hour
    When I request classwise counts with the following query parameters:
      | group_by          | hour                 |
      | class_type[]        | pedestrian            |
      | sid                 | site-481              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-30T01:01:00   |
    Then the response status should be 200
    And the response body should have classwise counts metadata grouped by "hour"

  Scenario: Missing end timestamp is rejected
    When I request classwise counts with the following query parameters:
      | group_by          | day                  |
      | class_type         | vehicle               |
      | sid                 | site-481              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
    Then the response status should be 422

  Scenario: Missing start timestamp is rejected
    When I request classwise counts with the following query parameters:
      | group_by          | day                  |
      | class_type         | vehicle               |
      | sid                 | site-481              |
      | timestamp[end]      | 2026-06-10T01:01:00   |
    Then the response status should be 422

  Scenario: Missing sid is rejected
    When I request classwise counts with the following query parameters:
      | group_by          | day                  |
      | class_type         | vehicle               |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-10T01:01:00   |
    Then the response status should be 422

  Scenario: Unknown sid is rejected
    When I request classwise counts with the following query parameters:
      | group_by          | day                  |
      | class_type         | vehicle               |
      | sid                 | site-000              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-10T01:01:00   |
    Then the response status should be 422

  Scenario: Missing group_by is rejected
    When I request classwise counts with the following query parameters:
      | class_type         | vehicle               |
      | sid                 | site-481              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-10T01:01:00   |
    Then the response status should be 422

  Scenario: Invalid group_by value is rejected
    When I request classwise counts with the following query parameters:
      | group_by          | week                 |
      | class_type         | vehicle               |
      | sid                 | site-481              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-10T01:01:00   |
    Then the response status should be 422

  Scenario: Missing X-Customer-API-Key header is rejected
    When I request classwise counts without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I request classwise counts without the X-FEClient-Key header
    Then the response status should be 401

  Scenario: Missing class_type still succeeds since it is optional
    When I request classwise counts with the following query parameters:
      | group_by          | day                  |
      | sid                 | site-481              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-10T01:01:00   |
    Then the response status should be 200

  Scenario: A valid explicit timezone is honored
    When I request classwise counts with the following query parameters:
      | group_by          | day                  |
      | class_type         | vehicle               |
      | sid                 | site-481              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-10T01:01:00   |
      | timezone            | Asia/Dubai            |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "Asia/Dubai"

  Scenario: An invalid timezone is rejected
    When I request classwise counts with the following query parameters:
      | group_by          | day                  |
      | class_type         | vehicle               |
      | sid                 | site-481              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-10T01:01:00   |
      | timezone            | Not/AZone             |
    Then the response status should be 422

  Scenario: An unknown zone_id does not error and returns no matching data
    When I request classwise counts with the following query parameters:
      | group_by          | day                  |
      | class_type         | vehicle               |
      | sid                 | site-481              |
      | timestamp[start]    | 2026-06-01T01:01:00   |
      | timestamp[end]      | 2026-06-10T01:01:00   |
      | zone_id[]           | ZONE_DOES_NOT_EXIST   |
    Then the response status should be 200
