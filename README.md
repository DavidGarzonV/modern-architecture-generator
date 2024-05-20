<h1 align="center">Modern Architecture Generator - Mag</h1>

Plugin to create and enhance projects using software architectures.
In this plugin we can found the next architectures:

- Clean Architecture
- Hexagonal Architecture

## Development Setup

### Prerequisites

- Install [Node.js](https://nodejs.org/) which includes [Node Package Manager](https://www.npmjs.com/get-npm)

### Setting Up a Project

Install MAG CLI globally using `npm` package manager:

```sh
npm install -g modern-architecture-generator
```

### Testing in local

Execute commands:

```sh
npm run start [command] [options]
```

Find the outputs:
All the files created with mag tool are created in the folder `./test-environment` when the environment variable `NODE_ENV` has the `"local"` value

### Command-language syntax

`mag [optional-command] [options]`

To see all the commands avaliable:

```sh
mag --help
mag [command] --help
```

### Using the tool

**Note**: The projects uses the `src` folder to handle all the code.

#### Create new project:

Creates a new project with a defined architecture

```sh
mag create [PROJECT NAME] [OPTIONS]
mag create mag-test --path "C:\Users\user\Documents\GitHub\modern-architecture-generator\test"
```

**Options:**

|ARGUMENT|SHORT ARGUMENT|DESCRIPTION|VALUE TYPE|
|---|---|---|---|
|`--path`|`-p`|Path where the project will be created|`string`|

#### Create a new use case:

Creates a personalized use case in your architecture folder.

```sh
mag usecase
```

#### Create a new entity:

Creates a personalized entity in your architecture folder.

```sh
mag entity
```

---

## Clean Architecture

Dignissimos officia placeat voluptatem odio pariatur perspiciatis neque. Non ducimus laudantium dicta quos architecto cupiditate minus sit harum. Quia necessitatibus labore aut quae ut ut. Nobis molestiae placeat aperiam sint soluta voluptatem placeat et. Incidunt quas iure ut aut minima sit iusto. Exercitationem commodi laudantium in rerum.
Quasi iste labore ex. Quasi dicta rerum libero saepe nulla distinctio vero cumque. Est nisi eum labore laboriosam id voluptas. Ex voluptates blanditiis magnam quas omnis et. Sit provident amet et ut. Porro a nihil.
Consequatur exercitationem quia atque. Ut labore consectetur perferendis nisi possimus dolorum voluptas voluptas possimus. Rerum voluptatem eos nulla ullam et. Eveniet voluptates expedita eligendi odio.

### Folder Structure

```md
src
├── entities
├── use-cases
├── interface-adapters
└── infrastructure
    ├── controllers
    ├── presenters
    └── adapters
```

### Avaliable commands:

#### Create new interface adapter:

```md
mag iadapter
```

**Options:**

|ARGUMENT|SHORT ARGUMENT|DESCRIPTION|VALUE TYPE|EXAMPLE|
|---|---|---|---|---|
|`--entity`|`-e`|Entity related to the adapter|`string`| File: `Animals/Dog.entity.ts`, Entity: `Animals/Dog` |

#### Create new adapter:

```md
mag adapter
```
---

## Hexagonal Architecture

Dignissimos officia placeat voluptatem odio pariatur perspiciatis neque. Non ducimus laudantium dicta quos architecto cupiditate minus sit harum. Quia necessitatibus labore aut quae ut ut. Nobis molestiae placeat aperiam sint soluta voluptatem placeat et. Incidunt quas iure ut aut minima sit iusto. Exercitationem commodi laudantium in rerum.
Quasi iste labore ex. Quasi dicta rerum libero saepe nulla distinctio vero cumque. Est nisi eum labore laboriosam id voluptas. Ex voluptates blanditiis magnam quas omnis et. Sit provident amet et ut. Porro a nihil.
Consequatur exercitationem quia atque. Ut labore consectetur perferendis nisi possimus dolorum voluptas voluptas possimus. Rerum voluptatem eos nulla ullam et. Eveniet voluptates expedita eligendi odio.

### Folder Structure

```md
src
├── application
│   └── use-cases
├── domain
│   ├── entities
│   ├── services
│   └── ports
│       ├── driven-ports
│       └── driving-ports
└── infrastructure
    ├── driven-adapters
    └── driving-adapters
```

### Avaliable commands:

#### Create new driving port:

```md
mag drivingp
```

#### Create new driven port:

```md
mag drivenp
```

**Options:**

|ARGUMENT|SHORT ARGUMENT|DESCRIPTION|VALUE TYPE|EXAMPLE|
|---|---|---|---|---|
|`--entity`|`-e`|Entity related to the driven port|`string`| File: `Animals/Dog.entity.ts`, Entity: `Animals/Dog` |


## Custom Configuration

You can modify or create a file called `mag.config.json` to set custom configurations for the project with mag.

|OPTION| DESCRIPTION |VALUE TYPE| AVALIABLE OPTIONS | DEFAULT VALUE |
|---|---|---|---|---|
|`architecture`|Type of configured architecture|`string`| `clean`, `hexagonal` | "" |
|`useCasesFolder`|Set a custom use cases folder|`string`| "" | According to architecture |
|`usePascalCase`|Define if use pascal case for class names|`boolean`| `true`, `false` | true |
|`useCamelCase`|Use camel case for name class attributes and variables otherwise snake case|`boolean`| `true`, `false` | true |
|`filesEOL`|End of line prefered for new files created|`string`| `LF`, `CRLF` | `LF` |

---

## License

**GPL-3.0**

Copyright © 2007 Free Software Foundation, Inc. <https://fsf.org/>

Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it is not allowed.
