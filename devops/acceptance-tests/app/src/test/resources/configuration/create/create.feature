Feature: Create or modify a project

  Scenario: Create a new project with Clean Architecture
    Given The folder mag-test does not exists
    When I execute create command with Clean for project mag-test
    Then a folder mag-test has been created with Clean

  Scenario: Create a new project with Hexagonal Architecture
    Given The folder mag-test does not exists
    When I execute create command with Hexagonal for project mag-test
    Then a folder mag-test has been created with Hexagonal

  Scenario: Create a new project with Onion Architecture
    Given The folder mag-test does not exists
    When I execute create command with Onion for project mag-test
    Then a folder mag-test has been created with Onion