---
runme:
  id: 01HX01SX1FQVSY7QV9WEAD066X
  version: v3
---

<h1 align="center">Modern Architecture Generator - Mag</h1>
<hr>

Plugin to create and enhance projects using software architectures.
In this plugin we can found the next architectures:

- Clean Architecture
- Hexagonal Architecture

## Development Setup

### Prerequisites

- Install [Node.js](https://nodejs.org/) which includes [Node Package Manager](https://www.npmjs.com/get-npm)

### Setting Up a Project

Install MAG CLI globally using `npm` package manager:

```sh {"id":"01HX06JD1R8Z6TZ6JP2CDHWBGQ"}
npm install -g modern-architecture-generator

```

### Testing in local

Execute commands:

```sh {"id":"01HX72WDBEYC84TH38W6FVCHNR"}
npm run start [command] [options]
```

### Command-language syntax

`mag [optional-command] [options]`

To see all the commands avaliable:

```sh {"id":"01HX072204ZZAF84GMVTT6K7J2"}
mag --help
mag [command] --help

```

### Using the tool

#### Create new project:

```sh {"id":"01HX06KVH4VH05GXGAKCCBEF74"}
mag create [PROJECT NAME] [OPTIONS]
mag create mag-test --path "C:\Users\user\Documents\GitHub\modern-architecture-generator\test"

```

**Options:**

|ARGUMENT|SHORT ARGUMENT|DESCRIPTION|VALUE TYPE|
|---|---|---|---|
|`--path`|`-p`|Path where the project will be created|`string`|

#### Create a new use case:

```sh {"id":"01HX06VZD72D9EX2Z363SWRYNN"}
mag usecase [USECASE NAME]

```

#### Create a new entity:

```sh {"id":"01HX06XDSG398G9H5J909K04JY"}
mag entity [ENTITY NAME]

```

---

## Clean Architecture

Dignissimos officia placeat voluptatem odio pariatur perspiciatis neque. Non ducimus laudantium dicta quos architecto cupiditate minus sit harum. Quia necessitatibus labore aut quae ut ut. Nobis molestiae placeat aperiam sint soluta voluptatem placeat et. Incidunt quas iure ut aut minima sit iusto. Exercitationem commodi laudantium in rerum.
Quasi iste labore ex. Quasi dicta rerum libero saepe nulla distinctio vero cumque. Est nisi eum labore laboriosam id voluptas. Ex voluptates blanditiis magnam quas omnis et. Sit provident amet et ut. Porro a nihil.
Consequatur exercitationem quia atque. Ut labore consectetur perferendis nisi possimus dolorum voluptas voluptas possimus. Rerum voluptatem eos nulla ullam et. Eveniet voluptates expedita eligendi odio.

### Folder Structure

```md {"id":"01HX0775CS1DG619R6ZJGGABSE"}
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

```md {"id":"01HX078H01DJBJ4G4H8VB28EXM"}
mag iadapter [ADAPTER NAME]
```

#### Create new adapter:

```md {"id":"01HX079D0X143G28G1V7DB05N5"}
mag adapter [ADAPTER NAME]
```

**Options:**

|ARGUMENT|DESCRIPTION|VALUE TYPE|
|---|---|---|
|`--adapter`|Name of the interface adapter to implements|`string`|

---

## Hexagonal Architecture

Dignissimos officia placeat voluptatem odio pariatur perspiciatis neque. Non ducimus laudantium dicta quos architecto cupiditate minus sit harum. Quia necessitatibus labore aut quae ut ut. Nobis molestiae placeat aperiam sint soluta voluptatem placeat et. Incidunt quas iure ut aut minima sit iusto. Exercitationem commodi laudantium in rerum.
Quasi iste labore ex. Quasi dicta rerum libero saepe nulla distinctio vero cumque. Est nisi eum labore laboriosam id voluptas. Ex voluptates blanditiis magnam quas omnis et. Sit provident amet et ut. Porro a nihil.
Consequatur exercitationem quia atque. Ut labore consectetur perferendis nisi possimus dolorum voluptas voluptas possimus. Rerum voluptatem eos nulla ullam et. Eveniet voluptates expedita eligendi odio.

### Folder Structure

```md {"id":"01HX7A19TN5S1AE9027GH0F84E"}
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

#### Create new driven port:

```md {"id":"01HX07PYFDZ0ZCWD4AS8SH2PSH"}
mag drivenp [DRIVEN PORT NAME]
```

#### Create new driving port:

```md {"id":"01HX07Q3YDMAMZB1WD4PEWFDY7"}
mag drivingp [DRIVING PORT NAME]
```

#### Create new driven adapter:

```md {"id":"01HX07QJT1534T4W2DZM4WV403"}
mag dvap [DRIVEN ADAPTER NAME]
```

**Options:**

|ARGUMENT|DESCRIPTION|VALUE TYPE|
|---|---|---|
|`--port`|Name of the driven port to implements|`string`|

#### Create new driving adapter:

```md {"id":"01HX07QXRFEHTS00110A5H74JJ"}
mag dgap [DRIVING ADAPTER NAME]
```

**Options:**

|ARGUMENT|DESCRIPTION|VALUE TYPE|
|---|---|---|
|`--port`|Name of the driving port to implements|`string`|

---

## License

**GPL-3.0**

Copyright © 2007 Free Software Foundation, Inc. <https://fsf.org/>

Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it is not allowed.
