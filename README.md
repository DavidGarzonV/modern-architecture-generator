<h1 align="center">Modern Architecture Generator - MAG</h1>

Plugin to create and structure projects with a architecture pattern with Typescript and Node JS.

In this plugin you can found the next architectures:

- Clean Architecture
- Hexagonal Architecture

## Installation

For global usage install with ```-g``` flag:

```md
npm install -g modern-architecture-generator
```

For local projects just install:

```md
npm install modern-architecture-generator
```

## Usage

You can install the application globally or integrate it into an existing project.

- After installation, run ``mag`` on terminal for help and details of the avaliable commands.

## Help

To get help about the commands run `mag help` or `mag [command] -h`

### Global Options commands

|ARGUMENT|SHORT ARGUMENT|DESCRIPTION|VALUE TYPE|
|---|---|---|---|
|`--path`|`-p`|Path to execute the command|`string`|

## Commands

### Create new project:

Creates a new project with a defined architecture using:

```md
mag create <PROJECT NAME> [OPTIONS]
mag create mag-test --path "C:\Users\user\Documents\GitHub\modern-architecture-generator\test"
```

**Options:**

|ARGUMENT|SHORT ARGUMENT|DESCRIPTION|VALUE TYPE|
|---|---|---|---|
|`--path`|`-p`|Path where the project will be created (Overwrites global path option)|`string`|

### Configure MAG in an existing project 

The application only works with applications with a `src` folder. To configure mag:

```md
mag configure
```

### Use cases

The use cases describe the rules that govern the interaction between users and entities. We do not expect changes in this layer to affect entities. We also do not expect this layer to be affected by changes to external elements such as the database, the user interface, or any of the common frameworks. 

#### Create a new use case:

Creates a personalized use case in your architecture folder using:

```md
mag usecase <usecase-name>
```

### Entities

Entities are the set of related business rules that are critical to the operation of an application.

An entity can be an object with methods, or it can be a set of functions and data structures, they know nothing about external layers and have no dependencies. They encapsulate the most general, high-level rules that the application would use.

#### Create a new entity:

Creates a personalized entity in your architecture folder.

```md
mag entity <entity-name>
```

### Services

Services are classes that encapsulate business logic that does not fit directly within an entity.

Domain services defines processes that are independent of the lifecycle of a particular Entity.

#### Create a new service:

Creates a personalized domain service in your architecture folder using:

```md
mag service <service-name>
```

### Helpers and Utilities (helpers vs utils)

- **Scope and Specificity**: Helpers are more specialized and context-specific, catering to the needs of a particular module or component. Utilities are broader in scope and are designed to provide general-purpose functionality.

- **Usage Context**: Helpers are usually used within the same module or closely related modules. Utilities are often used across different modules or even different projects.

- **Implementation**: Helpers may involve more domain-specific logic and are sometimes structured as classes to encapsulate related functionality. Utilities are often implemented as static methods or functions for ease of access.

### Helpers

Help to realise tasks or specific operations within a larger context. Uses methods that provide auxiliary functionality to other classes or components.  

Helpers can usually use external libraries to add functionality. 

| Helper Type           | Description                                                                                       |
|-----------------------|---------------------------------------------------------------------------------------------------|
| Shared helper         | If is general purpose and does not strictly belong to any layer.                                  |
| Application helper    | If helps with application-specific logic or coordination between the domain and external systems. |
| Domain helper         | If is related to core business logic and is purely computational or algorithmic, with no external dependencies. |
| Infrastructure helper | If interacts with external systems such as databases, web services or external libraries.         |

#### Create a new helper:

Creates a personalized helper in your architecture folder.

```md
mag helper <entity-name>
```

### Utilities

Classes with static methods or functions that perform generic and independent operations not related to specific instances or contexts. They often serve as repositories of functions commonly used throughout the application.

Normally, the utilities do not use external libraries, only the native components to enable generic functionality.

#### Create a new utility:

Creates a personalized utility in your architecture folder.

```md
mag util <entity-name>
```

---

## Clean Architecture

![clean architecture diagram](./src/templates/readme/public/clean/clean.jpg)

The concentric circles represent different areas of software. In general, the further in you go, the higher level the software becomes. The outer circles are mechanisms. The inner circles are policies.

The overriding rule that makes this architecture work is The Dependency Rule. This rule says that source code dependencies can only point inwards. Nothing in an inner circle can know anything at all about something in an outer circle. In particular, the name of something declared in an outer circle must not be mentioned by the code in the an inner circle. That includes, functions, classes. variables, or any other named software entity.

By the same token, data formats used in an outer circle should not be used by an inner circle, especially if those formats are generate by a framework in an outer circle. We don’t want anything in an outer circle to impact the inner circles.

### Folder Structure

```md
src
├── entities
│   ├── services (Optional)
│   └── helpers
├── use-cases
│   └── helpers
├── interface-adapters
├── utils
├── helpers
└── infrastructure
    ├── adapters
    ├── controllers
    ├── helpers
    └── persistence
```

### Avaliable commands:

### Interface adapters

The models are likely just data structures that are passed from the controllers to the use cases, and then back from the use cases to the presenters and views.

#### Create new interface adapter:

Creates a new interface adapter using:

```md
mag iadapter <interface-adapter-name>
```

**Options:**

|ARGUMENT|SHORT ARGUMENT|DESCRIPTION|VALUE TYPE|EXAMPLE|
|---|---|---|---|---|
|`--entity`|`-e`|Entity related to the adapter|`string`| File: `Animals/Dog.entity.ts`, Entity: `Animals/Dog` |

### Adapters

The software in this layer is a set of adapters that convert data from the format most convenient for the use cases and entities, to the format most convenient for some external agency such as the Database or the Web. It is this layer, for example, that will wholly contain the MVC architecture of a GUI. The Presenters, Views, and Controllers all belong in here. 

#### Create new adapter:

Also in this layer is any other adapter necessary to convert data from some external form, such as an external service, to the internal form used by the use cases and entities.

```md
mag adapter <adapter-name>
```
---

## Hexagonal Architecture

![hexagonal structure with adapters](./src/templates/readme/public/hexagonal/hexagonal1.png)

The hexagonal architecture, or ports and adapters, is a structural pattern we use to make an application independent of specific technologies. This allows it to be easily tested and interacted with through different interfaces (API, web application, command line) and to use different technologies for persistence, communication, etc.

### Folder Structure

```md
src
├── application
│   ├── use-cases
│   └── helpers
├── domain
│   ├── entities
│   ├── services
│   ├── helpers
│   └── ports
│       ├── driven-ports
│       └── driving-ports
├── infrastructure
│   ├── adapters
│   |   ├── driven-adapters
│   |   └── driving-adapters
│   └── helpers
├── utils
└── helpers
```

### Available commands:

### Driving ports

For the driving/driver ports (Input ports), use case interfaces that the adapters must use are defined; they are those that allow data input into the application. They are defined in the domain layer and are implemented by external adapters (API Rest Controllers, GUI Controllers, Queue Adapters, CLI Adapters) that are responsible for transforming the incoming data into a format suitable for processing by the application. An example can be a REST API that receives HTTP requests and transforms them into domain objects that the application can process.

#### Create new driving port:

Creates a new driving port using:

```md
mag drivingp <driving-port-name>
```
### Driven ports

For the driven ports (Output ports), interfaces are defined that must be implemented by the adapters, which are those that allow data to be output from the application. They are defined at the domain layer and are implemented by external adapters that are responsible for transforming the data into a format suitable for storing or sending it to the outside world. An example of an output port can be a database that stores the domain objects processed by the application.

#### Create new driven port:

Creates a new driven port using:

```md
mag drivenp <driven-port-name>
```

**Options:**

|ARGUMENT|SHORT ARGUMENT|DESCRIPTION|VALUE TYPE|EXAMPLE|
|---|---|---|---|---|
|`--entity`|`-e`|Entity related to the driven port|`string`| File: `Animals/Dog.entity.ts`, Entity: `Animals/Dog` |

---

## Onion Architecture

![onion architectures](./src/templates/readme/public/onion/onion.png)

It is another variant of Clean Architecture that focuses on organising code into concentric layers, with the core of the system at the centre and the outer layers representing different levels of abstraction and implementation detail.

### Folder Structure

```md
src
├── application
│   ├── helpers
│   └── use-cases
├── domain
│   ├── helpers
│   ├── entities
│   └── repositories
├── infrastructure
│   ├── persistence
│   ├── external
│   └── helpers
├── helpers
└── utils
```

---

## Custom MAG Configuration

You can modify or create a file called `mag.config.json` to set custom configurations for the project with mag.

|OPTION| DESCRIPTION |VALUE TYPE| AVALIABLE OPTIONS | DEFAULT VALUE |
|---|---|---|---|---|
|`architecture`|Type of configured architecture|`string`| `clean`, `hexagonal` | "" |
|`useCasesFolder`|Set a custom use cases folder|`string`| "" | According to architecture |
|`usePascalCase`|Define if use pascal case for class names|`boolean`| `true`, `false` | true |
|`useCamelCase`|Use camel case for name class attributes and variables otherwise snake case|`boolean`| `true`, `false` | true |
|`filesEOL`|End of line prefered for new files created|`string`| `LF`, `CRLF` | `LF` |

## Development Setup

### Prerequisites

- Install [Node.js](https://nodejs.org/) which includes [Node Package Manager](https://www.npmjs.com/get-npm)

### Setting Up a Project

Install MAG CLI globally using `npm` package manager:

```md
npm install -g modern-architecture-generator
```

### Executing project in local

**Configure enviroment file:**

Create a `.env` file with the variable `NODE_ENV="local"` for development purposes.

**Execute commands:**

```md
npm run start [command] [arguments] [-- --option value]
```

**Global command testing**

First, create a link to execute the project and type `mag` with the desired command.

```md
npm run link
```

### Command-language syntax

`mag [command] [arguments] [options]`

To see all the commands avaliable:

```md
mag --help
mag [command] --help
```

### Notes

When you generate a project, you will also install the following dependencies:

- [https://www.npmjs.com/package/typescript](typescript)
- [https://www.npmjs.com/package/@types/node](@types/node)
- [https://www.npmjs.com/package/tsc-alias](tsc-alias)

---

## License

**GPL-3.0**

Copyright © 2007 Free Software Foundation, Inc. <https://fsf.org/>

Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it is not allowed.
