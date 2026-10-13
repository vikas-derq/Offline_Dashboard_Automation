@api
Feature: Speed by day-of-week report API
  As an API automation engineer
  I want to verify the speed dowwise endpoint
  So that speed bucket report responses are validated

  Scenario: Valid request without a zone_id filter returns speed bucket entries
    When I request speed dowwise with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
      | speed_unit           | kph                       |
      | speed_buckets        | 10,15                     |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "America/New_York"
    And the response body should contain speed bucket entries

  Scenario: A zone_id with no matching data collapses to one zero-value entry per day
    When I request speed dowwise with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
      | speed_unit           | kph                       |
      | speed_buckets        | 10,15                     |
      | zone_id[]            | Zone_1                    |
    Then the response status should be 200
    And the response body should contain one zero-value entry per day

  Scenario: Default speed_buckets and speed_unit still succeed since both are optional
    When I request speed dowwise with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 200
    And the response body should contain speed bucket entries

  Scenario: Timezone is UTC by default when not specified
    When I request speed dowwise with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | speed_unit           | kph                       |
      | speed_buckets        | 10,15                     |
    Then the response status should be 200
    And the response body's meta.grouping.timezone should be "utc"
    And the response body should contain speed bucket entries

  Scenario: Missing sid is rejected
    When I request speed dowwise with the following query parameters:
      | class_type[]        | vehicle                  |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: Unknown sid is rejected
    When I request speed dowwise with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-000                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: Missing start timestamp is rejected
    When I request speed dowwise with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: Missing end timestamp is rejected
    When I request speed dowwise with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timezone             | America/New_York          |
    Then the response status should be 422

  Scenario: An invalid timezone is rejected
    When I request speed dowwise with the following query parameters:
      | class_type[]        | vehicle                  |
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | timezone             | Not/AZone                   |
    Then the response status should be 422

  Scenario: An invalid speed_unit is rejected
    When I request speed dowwise with the following query parameters:
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | speed_unit           | furlongs                  |
    Then the response status should be 422

  Scenario: A single speed_buckets value is rejected
    When I request speed dowwise with the following query parameters:
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | speed_buckets        | 10                        |
    Then the response status should be 422

  Scenario: Non-ascending speed_buckets values are rejected
    When I request speed dowwise with the following query parameters:
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | speed_buckets        | 15,10                     |
    Then the response status should be 422

  Scenario: Negative speed_buckets values are rejected
    When I request speed dowwise with the following query parameters:
      | sid                  | site-247                 |
      | timestamp[start]     | 2026-09-22T00:00:00      |
      | timestamp[end]       | 2026-09-27T23:59:59      |
      | speed_buckets        | -5,10                     |
    Then the response status should be 422

  Scenario: Missing X-Customer-API-Key header is rejected
    When I request speed dowwise without the X-Customer-API-Key header
    Then the response status should be 401

  Scenario: Missing X-FEClient-Key header is rejected
    When I request speed dowwise without the X-FEClient-Key header
    Then the response status should be 401
