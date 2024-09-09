# The Onion Architecture

![onion architecture diagram](./public/onion/onion.png)

The main premise is that it controls coupling.  The fundamental rule is that all code can depend on layers more central, but code cannot depend on layers further out from the core.  In other words, all coupling is toward the center.   This architecture is unashamedly biased toward object-oriented programming, and it puts objects before all others.

## Dependency rule

The circles represent different levels of responsibility. In general, the deeper we go, the closer we get to the domain and the business rules. The outer circles represent mechanisms and the inner circles represent the core logic of the domain. The outer layers depend on the inner layers and the inner layers are completely unaware of the outer circles. Classes, methods, variables and source code in general that belong to the outer circle depend on the inner circle, but not vice versa.

## Layers


- **Domain layer**: Contains the core business logic, entities and business rules of the application.
- **Application layer**: Implements the use cases and coordinates the data flow between the domain and infrastructure layers.
- **Infrastructure layer**: Manages external issues such as databases, file systems or external services.
- **Presentation layer**: Manages user interfaces and presentation-related logic.

---

**Sources**: https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
