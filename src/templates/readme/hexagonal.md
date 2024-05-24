# Hexagonal architecture

## The Pattern: Ports and Adapters (‘’Object Structural’’)

Allow an application to equally be driven by users, programs, automated test or batch scripts, and to be developed and tested in isolation from its eventual run-time devices and databases.

When any driver wants to use the application at a port, it sends a request that is converted by an adapter for the specific technology of the driver into an usable procedure call or message, which passes that to the application port. The application is blissfully ignorant of the driver’s technology. When the application has something to send out, it sends it out through a port to an adapter, which creates the appropriate signals needed by the receiving technology (human or automated). The application has a semantically sound interaction with the adapters on all sides of it, without actually knowing the nature of the things on the other side of the adapters.

## Motivation
One of the great bugaboos of software applications over the years has been infiltration of business logic into the user interface code. The problem this causes is threefold:

- First, the system can’t neatly be tested with automated test suites because part of the logic needing to be tested is dependent on oft-changing visual details such as field size and button placement;
- For the exact same reason, it becomes impossible to shift from a human-driven use of the system to a batch-run system;
- For still the same reason, it becomes difficult or impossible to allow the program to be driven by another program when that becomes attractive.

The attempted solution, repeated in many organizations, is to create a new layer in the architecture, with the promise that this time, really and truly, no business logic will be put into the new layer. However, having no mechanism to detect when a violation of that promise occurs, the organization finds a few years later that the new layer is cluttered with business logic and the old problem has reappeared.

Imagine now that ‘’every’’ piece of functionality the application offers were available through an API (application programmed interface) or function call. In this situation, the test or QA department can run automated test scripts against the application to detect when any new coding breaks a previously working function. The business experts can create automated test cases, before the GUI details are finalized, that tells the programmers when they have done their work correctly (and these tests become the ones run by the test department). The application can be deployed in ‘’headless’’ mode, so only the API is available, and other programs can make use of its functionality — this simplifies the overall design of complex application suites and also permits business-to-business service applications to use each other without human intervention over the web. Finally, the automated function regression tests detect any violation of the promise to keep business logic out of the presentation layer. The organization can detect, and then correct, the logic leak.

An interesting similar problem exists on what is normally considered “the other side” of the application, where the application logic gets tied to an external database or other service. When the database server goes down or undergoes significant rework or replacement, the programmers can’t work because their work is tied to the presence of the database. This causes delay costs and often bad feelings between the people.

It is not obvious that the two problems are related, but there is a symmetry between them that shows up in the nature of the solution.

## Nature of the Solution
Both the user-side and the server-side problems actually are caused by the same error in design and programming — the entanglement between the business logic and the interaction with external entities. The asymmetry to exploit is not that between ‘’left’’ and ‘’right’’ sides of the application but between ‘’inside’’ and ‘’outside’’ of the application. The rule to obey is that code pertaining to the ‘’inside’’ part should not leak into the ‘’outside’’ part.

Removing any left-right or up-down asymmetry for a moment, we see that the application communicates over ‘’ports’’ to external agencies. The word “port” is supposed to evoke thoughts of ‘’ports’’ in an operating system, where any device that adheres to the protocols of a port can be plugged into it; and ‘’ports’’ on electronics gadgets, where again, any device that fits the mechanical and electrical protocols can be plugged in.

- The protocol for a port is given by the purpose of the conversation between the two devices.
The protocol takes the form of an application program interface (API).

For each external device there is an ‘’adapter’’ that converts the API definition to the signals needed by that device and vice versa. A graphical user interface or GUI is an example of an adapter that maps the movements of a person to the API of the port. Other adapters that fit the same port are automated test harnesses such as FIT or Fitnesse, batch drivers, and any code needed for communication between applications across the enterprise or net.

On another side of the application, the application communicates with an external entity to get data. The protocol is typically a database protocol. From the application’s perspective, if the database is moved from a SQL database to a flat file or any other kind of database, the conversation across the API should not change. Additional adapters for the same port thus include an SQL adapter, a flat file adapter, and most importantly, an adapter to a “mock” database, one that sits in memory and doesn’t depend on the presence of the real database at all.

Many applications have only two ports: the user-side dialog and the database-side dialog. This gives them an asymmetric appearance, which makes it seem natural to build the application in a one-dimensional, three-, four-, or five-layer stacked architecture.

There are two problems with these drawings. First and worst, people tend not to take the “lines” in the layered drawing seriously. They let the application logic leak across the layer boundaries, causing the problems mentioned above. Secondly, there may be more than two ports to the application, so that the architecture does not fit into the one-dimensional layer drawing.

The hexagonal, or ports and adapters, architecture solves these problems by noting the symmetry in the situation: there is an application on the inside communicating over some number of ports with things on the outside. The items outside the application can be dealt with symmetrically.

The hexagon is intended to visually highlight

(a) the inside-outside asymmetry and the similar nature of ports, to get away from the one-dimensional layered picture and all that evokes, and

(b) the presence of a defined number of different ports – two, three, or four (four is most I have encountered to date).

The hexagon is not a hexagon because the number six is important, but rather to allow the people doing the drawing to have room to insert ports and adapters as they need, not being constrained by a one-dimensional layered drawing. The term ‘’hexagonal architecture’’ comes from this visual effect.

The term “port and adapters” picks up the ‘’purposes’’ of the parts of the drawing. A port identifies a purposeful conversation. There will typically be multiple adapters for any one port, for various technologies that may plug into that port. Typically, these might include a phone answering machine, a human voice, a touch-tone phone, a graphical human interface, a test harness, a batch driver, an http interface, a direct program-to-program interface, a mock (in-memory) database, a real database (perhaps different databases for development, test, and real use).

In the Application Notes, the left-right asymmetry will be brought up again. However, the primary purpose of this pattern is to focus on the inside-outside asymmetry, pretending briefly that all external items are identical from the perspective of the application.


## Structure

![hexagonal structure with adapters](./public/hexagonal/hexagonal1.png)

### Application Notes

**The Left-Right Asymmetry**

The ports and adapters pattern is deliberately written pretending that all ports are fundamentally similar. That pretense is useful at the architectural level. In implementation, ports and adapters show up in two flavors, which I’ll call ‘’primary’’ and ‘’secondary’’, for soon-to-be-obvious reasons. They could be also called ‘’driving’’ adapters and ‘’driven’’ adapters.

The alert reader will have noticed that in all the examples given, FIT fixtures are used on the left-side ports and mocks on the right. In the three-layer architecture, FIT sits in the top layer and the mock sits in the bottom layer.

This is related to the idea from use cases of “primary actors” and “secondary actors”. A ‘’primary actor’’ is an actor that drives the application (takes it out of quiescent state to perform one of its advertised functions). A ‘’secondary actor’’ is one that the application drives, either to get answers from or to merely notify. The distinction between ‘’primary ‘’and’’ secondary ‘’lies in who triggers or is in charge of the conversation.

The natural test adapter to substitute for a ‘’primary’’ actor is FIT, since that framework is designed to read a script and drive the application. The natural test adapter to substitute for a ‘’secondary’’ actor such as a database is a mock, since that is designed to answer queries or record events from the application.

These observations lead us to follow the system’s use case context diagram and draw the ‘’primary ports ‘’and’’ primary adapters’’ on the left side (or top) of the hexagon, and the ‘’secondary ports’’ and ‘’secondary adapters’’ on the right (or bottom) side of the hexagon.

The relationship between primary and secondary ports/adapters and their respective implementation in FIT and mocks is useful to keep in mind, but it should be used as a consequence of using the ports and adapters architecture, not to short-circuit it. The ultimate benefit of a ports and adapters implementation is the ability to run the application in a fully isolated mode.

**Use Cases And The Application Boundary**

It is useful to use the hexagonal architecture pattern to reinforce the preferred way of writing use cases.

A common mistake is to write use cases to contain intimate knowledge of the technology sitting outside each port. These use cases have earned a justifiably bad name in the industry for being long, hard-to-read, boring, brittle, and expensive to maintain.

Understanding the ports and adapters architecture, we can see that the use cases should generally be written at the application boundary (the inner hexagon), to specify the functions and events supported by the application, regardless of external technology. These use cases are shorter, easier to read, less expensive to maintain, and more stable over time.


**How Many Ports?**

What exactly a port is and isn’t is largely a matter of taste. At the one extreme, every use case could be given its own port, producing hundreds of ports for many applications. Alternatively, one could imagine merging all primary ports and all secondary ports so there are only two ports, a left side and a right side.

Neither extreme appears optimal.

The weather system described in the Known Uses has four natural ports: the weather feed, the administrator, the notified subscribers, the subscriber database. A coffee machine controller has four natural ports: the user, the database containing the recipes and prices, the dispensers, and the coin box. A hospital medication system might have three: one for the nurse, one for the prescription database, and one for the computer-controller medication dispensers.

It doesn’t appear that there is any particular damage in choosing the “wrong” number of ports, so that remains a matter of intuition. My selection tends to favor a small number, two, three or four ports, as described above and in the Known Uses.

![hexagonal structure complex example](./public/hexagonal/hexagonal2.png)
