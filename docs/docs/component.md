# Properties on Component
- **typeName** component type for reuse purpose
- **instanceName** actual component name when initialize it
- **view** view Tempate
- **model** data Model
- **action** action for state change/model update

# State = Model + Action
```
                  +-----------+
       +--->      |           |      Action
 State            |   Model   +-------------------+
       +--->      |           |                   |
                  +-----------+                   |
                        ^                         |
                        |                         |
                        |                         |
                        |                         |
                        |                         v
                        |                   +-----------+
       +--->            |                   |           |
 State                  +-------------------+   Model   |
       +--->                   Action       |           |
                                            +-----------+
```
