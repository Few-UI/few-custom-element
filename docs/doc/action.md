# Properties on Action
- **input** How we prepare input from model and scope (pull)
- **output** How we process response to model(push)
- **scope** Default input from last action which u cae pull in input. Default response to next action
- **condition** criteria to see if we should execute the action/process the message or not
- **bubble** if yes the message will keep bubbling up after this action is done

# Action Flow in Component
```
                          +---------------------+
                          | Button Click (View) |<-------------+
                          +----------+----------+              |
                                     |                         |
                                     |(scope)                  |
                                     |                         |
                                     v                         |
     +-----------+        +----------+----------+        +-----+-----+
     |           |   In   |                     |  Out   |           |
     |           +------->+       Action        +------->+           |
     |           |        |                     |        |           |
     |           |        +----------+----------+        |           |
     |           |                   |                   |           |
     |   Model   |                   |(scope)            |   Model   |
     |           |                   |                   | (Updated) |
     |           |                   v                   |           |
     |           |        +----------+----------+        |           |
     |           |   In   |                     |  Out   |           |
     |           +------->+       Action        +------->+           |
     |           |        |                     |        |           |
     +-----------+        +---------------------+        +-----------+
```

# Ctx
```
                         +--------------------------+
                         |                          |
                         |       Parent View        +<----------------------------+
                         |                          |                             |
                         +--------------------------+                             |
                                      |                                           |
                                      v                                           |
                         +--------------------------+                             |
                         |                          |                             |
                         |   Button Click (View1)   +<----------------+           |
                         |                          |                 |           |
                         +--------------------------+                 |           |
                                      |                               |           |
                                      |                               |           |
                                      |(scope)                        |           |
                                      |                               |           |
                                      v                               |           |
  +-------------+        +--------------------------+         +-------------+     |
  |             |        |                          |         |             |     |
  |             |   In   |                          |   Out   |             |     |
  |    Model    +------->+                          +-------->+    Model    |     |
  |             |        |                          |         |             |     |
  |             |        |                          |         |             |     |
  +-------------+        |          Action          |         +-------------+     |
  |             |        |                          |         |             |     |
  |             |   In   |                          |   Out   |             |     |
  |     Ctx     +------->+                          +-------->+     Ctx     +-----+
  |             |        |                          |         |             |
  |             |        |                          |         |             |
  +-------------+        +--------------------------+         +-------------+
```